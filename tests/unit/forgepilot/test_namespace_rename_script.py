from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


def _run(cmd: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=cwd,
        text=True,
        capture_output=True,
        check=True,
    )


def test_namespace_rename_script_dry_run(tmp_path: Path):
    repo = tmp_path / 'repo'
    repo.mkdir()
    target = repo / 'example.env'
    target.write_text('OPENHANDS_RUNTIME_NAME=dev\n', encoding='utf-8')
    whitelist = repo / 'whitelist.json'
    whitelist.write_text(
        json.dumps(
            {
                'replacements': [
                    {
                        'name': 'runtime_name',
                        'old': 'OPENHANDS_RUNTIME_NAME',
                        'new': 'FORGEPILOT_RUNTIME_NAME',
                    }
                ]
            }
        ),
        encoding='utf-8',
    )

    script = Path('scripts/forgepilot-namespace-rename.py').resolve()
    result = subprocess.run(
        [
            sys.executable,
            str(script),
            '--root',
            str(repo),
            '--whitelist',
            str(whitelist),
            '--paths',
            'example.env',
        ],
        cwd=repo,
        text=True,
        capture_output=True,
        check=True,
    )
    assert 'Dry-run only' in result.stdout
    assert target.read_text(encoding='utf-8') == 'OPENHANDS_RUNTIME_NAME=dev\n'


def test_namespace_rename_script_apply_generates_scoped_patches(tmp_path: Path):
    repo = tmp_path / 'repo'
    repo.mkdir()
    _run(['git', 'init'], cwd=repo)
    _run(['git', 'config', 'user.email', 'dev@forgepilot.local'], cwd=repo)
    _run(['git', 'config', 'user.name', 'forgepilot-bot'], cwd=repo)

    target = repo / 'target.env'
    untouched = repo / 'untouched.env'
    target.write_text('OPENHANDS_RUNTIME_NAME=dev\n', encoding='utf-8')
    untouched.write_text('OPENHANDS_RUNTIME_NAME=keep\n', encoding='utf-8')
    _run(['git', 'add', '.'], cwd=repo)
    _run(['git', 'commit', '-m', 'seed'], cwd=repo)

    whitelist = repo / 'whitelist.json'
    whitelist.write_text(
        json.dumps(
            {
                'replacements': [
                    {
                        'name': 'runtime_name',
                        'old': 'OPENHANDS_RUNTIME_NAME',
                        'new': 'FORGEPILOT_RUNTIME_NAME',
                    }
                ]
            }
        ),
        encoding='utf-8',
    )

    script = Path('scripts/forgepilot-namespace-rename.py').resolve()
    subprocess.run(
        [
            sys.executable,
            str(script),
            '--root',
            str(repo),
            '--whitelist',
            str(whitelist),
            '--paths',
            'target.env',
            '--apply',
        ],
        cwd=repo,
        text=True,
        capture_output=True,
        check=True,
    )

    assert target.read_text(encoding='utf-8') == 'FORGEPILOT_RUNTIME_NAME=dev\n'
    assert untouched.read_text(encoding='utf-8') == 'OPENHANDS_RUNTIME_NAME=keep\n'

    forward_patch = repo / 'scripts/forgepilot-rename-forward.patch'
    rollback_patch = repo / 'scripts/forgepilot-rename-rollback.patch'
    assert forward_patch.exists()
    assert rollback_patch.exists()

    forward_content = forward_patch.read_text(encoding='utf-8')
    rollback_content = rollback_patch.read_text(encoding='utf-8')
    assert 'target.env' in forward_content
    assert 'untouched.env' not in forward_content
    assert 'FORGEPILOT_RUNTIME_NAME=dev' in rollback_content
