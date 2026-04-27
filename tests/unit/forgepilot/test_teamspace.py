"""Tests for team space permissions and data isolation (B-17)."""

from openhands.forgepilot.teamspace import (
    SpacePermissionGuard,
    SpaceRole,
    SpaceType,
    TeamSpace,
    space_registry,
)


def test_create_personal_space():
    space = space_registry.create_space(
        'test-personal', 'My Space', 'user-1', SpaceType.PERSONAL
    )
    assert space.owner_id == 'user-1'
    assert 'user-1' in space.members
    assert space.members['user-1'].role == SpaceRole.OWNER


def test_permission_guard_owner_has_all():
    space = TeamSpace(space_id='s1', name='Test', owner_id='owner-1')
    guard = SpacePermissionGuard(space)
    assert guard.can('owner-1', 'space:delete')
    assert guard.can('owner-1', 'space:write')
    assert guard.can('owner-1', 'space:read')


def test_permission_guard_viewer_limited():
    space = TeamSpace(space_id='s1', name='Test', owner_id='owner-1')
    from openhands.forgepilot.teamspace import SpaceMember

    space.members['viewer-1'] = SpaceMember(user_id='viewer-1', role=SpaceRole.VIEWER)
    guard = SpacePermissionGuard(space)
    assert guard.can('viewer-1', 'space:read')
    assert not guard.can('viewer-1', 'space:write')
    assert not guard.can('viewer-1', 'space:delete')


def test_permission_guard_unknown_user():
    space = TeamSpace(space_id='s1', name='Test', owner_id='owner-1')
    guard = SpacePermissionGuard(space)
    assert not guard.can('stranger', 'space:read')


def test_role_hierarchy():
    space = TeamSpace(space_id='s1', name='Test', owner_id='owner-1')
    from openhands.forgepilot.teamspace import SpaceMember

    space.members['admin-1'] = SpaceMember(user_id='admin-1', role=SpaceRole.ADMIN)
    guard = SpacePermissionGuard(space)
    assert guard.is_at_least('admin-1', SpaceRole.MEMBER)
    assert not guard.is_at_least('admin-1', SpaceRole.OWNER)
    assert guard.is_at_least('owner-1', SpaceRole.OWNER)


def test_list_user_spaces():
    space_registry.create_space('s2', 'Space 2', 'user-2')
    spaces = space_registry.list_user_spaces('user-2')
    assert any(s.space_id == 's2' for s in spaces)
