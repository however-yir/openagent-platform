#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            'Apply ForgePilot namespace rename rules from a whitelist and generate '
            'rollback patch.'
        )
    )
    parser.add_argument(
        '--root',
        default=Path(__file__).resolve().parent.parent,
        type=Path,
        help='Repository root path.',
    )
    parser.add_argument(
        '--whitelist',
        default=Path(__file__).resolve().parent / 'forgepilot-rename-whitelist.json',
        type=Path,
        help='Whitelist JSON file containing approved replacements.',
    )
    parser.add_argument(
        '--paths',
        nargs='*',
        default=None,
        help='Optional files/directories to limit replacement scope.',
    )
    parser.add_argument(
        '--apply',
        action='store_true',
        help='Apply replacements in place. Without this flag, script runs in dry-run.',
    )
    parser.add_argument(
        '--rollback-patch',
        default='scripts/forgepilot-rename-rollback.patch',
        type=Path,
        help='Path for generated rollback patch (reverse patch).',
    )
    parser.add_argument(
        '--forward-patch',
        default='scripts/forgepilot-rename-forward.patch',
        type=Path,
        help='Path for generated forward patch (audit record).',
    )
    return parser.parse_args()


def is_text_file(path: Path) -> bool:
    binary_suffixes = {
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.pdf',
        '.ico',
        '.woff',
        '.woff2',
        '.ttf',
        '.zip',
        '.gz',
        '.tar',
    }
    return path.suffix.lower() not in binary_suffixes


def load_replacements(whitelist_path: Path) -> list[tuple[str, str, str]]:
    data = json.loads(whitelist_path.read_text(encoding='utf-8'))
    replacements: list[tuple[str, str, str]] = []
    for item in data.get('replacements', []):
        name = str(item['name'])
        old = str(item['old'])
        new = str(item['new'])
        replacements.append((name, old, new))
    return replacements


def iter_target_files(root: Path, target_paths: list[str] | None) -> list[Path]:
    if target_paths:
        resolved: list[Path] = []
        for value in target_paths:
            candidate = (root / value).resolve()
            if candidate.is_dir():
                for path in candidate.rglob('*'):
                    if path.is_file() and is_text_file(path):
                        resolved.append(path)
            elif candidate.is_file() and is_text_file(candidate):
                resolved.append(candidate)
        return sorted(set(resolved))

    excluded_prefixes = {
        '.git',
        'frontend/node_modules',
        'node_modules',
        'dist',
        'build',
        '.venv',
    }
    files: list[Path] = []
    for path in root.rglob('*'):
        if not path.is_file() or not is_text_file(path):
            continue
        rel = path.relative_to(root).as_posix()
        if any(
            rel == prefix or rel.startswith(f'{prefix}/')
            for prefix in excluded_prefixes
        ):
            continue
        files.append(path)
    return files


def apply_replacements(
    files: list[Path],
    replacements: list[tuple[str, str, str]],
    *,
    apply: bool,
) -> dict[str, list[str]]:
    touched: dict[str, list[str]] = {}
    for file_path in files:
        original = file_path.read_text(encoding='utf-8', errors='ignore')
        updated = original
        matched_rules: list[str] = []
        for name, old, new in replacements:
            if old in updated:
                updated = updated.replace(old, new)
                matched_rules.append(name)
        if updated != original:
            touched[str(file_path)] = matched_rules
            if apply:
                file_path.write_text(updated, encoding='utf-8')
    return touched


def _relative_targets(root: Path, touched_paths: list[str]) -> list[str]:
    return [str(Path(path).resolve().relative_to(root)) for path in touched_paths]


def generate_patches(
    root: Path,
    touched_paths: list[str],
    forward_patch: Path,
    rollback_patch: Path,
) -> None:
    if not touched_paths:
        return

    forward_patch_path = (root / forward_patch).resolve()
    rollback_patch_path = (root / rollback_patch).resolve()
    forward_patch_path.parent.mkdir(parents=True, exist_ok=True)
    rollback_patch_path.parent.mkdir(parents=True, exist_ok=True)
    targets = _relative_targets(root, touched_paths)
    diff_cmd = ['git', 'diff', '--binary', '--', *targets]
    reverse_cmd = ['git', 'diff', '--binary', '-R', '--', *targets]

    forward = subprocess.run(
        diff_cmd,
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    rollback = subprocess.run(
        reverse_cmd,
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    ).stdout

    forward_patch_path.write_text(forward, encoding='utf-8')
    rollback_patch_path.write_text(rollback, encoding='utf-8')


def main() -> int:
    args = parse_args()
    root = args.root.resolve()
    replacements = load_replacements(args.whitelist.resolve())
    files = iter_target_files(root, args.paths)
    touched = apply_replacements(files, replacements, apply=args.apply)

    if not touched:
        print('No whitelist matches found.')
        return 0

    print(f'Matched {len(touched)} files.')
    for file_path, rules in sorted(touched.items()):
        print(f'- {Path(file_path).relative_to(root)}: {", ".join(sorted(set(rules)))}')

    if args.apply:
        generate_patches(
            root,
            touched_paths=list(touched),
            forward_patch=args.forward_patch,
            rollback_patch=args.rollback_patch,
        )
        scope = ', '.join(sorted(_relative_targets(root, list(touched))[:6]))
        if len(touched) > 6:
            scope = f'{scope}, ...'
        print(
            f'Applied replacements. Generated patches:\n'
            f'  scope: {scope}\n'
            f'  forward: {args.forward_patch}\n'
            f'  rollback: {args.rollback_patch}'
        )
    else:
        print(
            'Dry-run only. Re-run with --apply to write files and generate rollback patch.'
        )

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
