from openhands.forgepilot.control_plane.task_protocol import (
    TaskPhase,
    is_valid_phase_transition,
    select_verification_commands,
    validate_phase_sequence,
)


def test_select_verification_commands_with_aliases():
    assert select_verification_commands('py') == ['pytest -q']
    assert select_verification_commands('ts') == [
        'npm run typecheck',
        'npm test -- --runInBand',
    ]


def test_select_verification_commands_fallback():
    assert select_verification_commands('unknown') == [
        "echo 'No built-in verifier; define project-specific command.'"
    ]


def test_phase_transition_rules():
    assert is_valid_phase_transition(None, TaskPhase.PLAN)
    assert is_valid_phase_transition(TaskPhase.PLAN, TaskPhase.PLAN)
    assert is_valid_phase_transition(TaskPhase.PLAN, TaskPhase.EXECUTE)
    assert not is_valid_phase_transition(TaskPhase.PLAN, TaskPhase.REPORT)


def test_validate_phase_sequence_complete():
    sequence = [
        TaskPhase.PLAN,
        TaskPhase.EXECUTE,
        TaskPhase.VERIFY,
        TaskPhase.REPORT,
    ]
    assert validate_phase_sequence(sequence)


def test_validate_phase_sequence_incomplete():
    sequence = [TaskPhase.PLAN, TaskPhase.EXECUTE, TaskPhase.VERIFY]
    assert not validate_phase_sequence(sequence)
