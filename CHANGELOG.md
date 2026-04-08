# Changelog

All notable changes to this project will be documented in this file.

Format is based on a simplified version of Keep a Changelog.

---

## [YYYY-MM-DD] - Release Title

### Added

- New features

### Changed

- Changes in existing behavior

### Fixed

- Bug fixes

### Removed

- Removed features or deprecated logic

### Notes

- Optional context, warnings, or migration notes

---
## [2026-04-08] - Startup Config Fix & Management Item Update

### Added

- Added new item selection for Management projects (for GM use case)
- Inserted corresponding records in itemofworkstable, itemlabels, and drawingreference
- Updated item priority for proper ordering

### Changed

- Aligned local MonthlyStandard folder with deployed server version to prevent environment mismatch

### Fixed

- Fixed broken get_startup_config.php response caused by removing array unpacking (...$systemIds)
- Restored correct data structure being sent to frontend

### Notes

- Backend compatibility issue identified (older PHP version does not support array unpacking)
- Be careful when modifying data structures shared with frontend — silent breakages will cascade

---

## [2026-04-07] - DR Unlock Improvements

### Added

- Added request reason field for unlock requests
- Added denial reason modal for approvers
- Added Request ID column on DR Approvals tables

### Changed

- Request form & Requests for me table is now hidden for users without override access
- Group selector behavior retained for override users
- Changed Daily Report lock overlay for normal users to "Please coordinate with your group leader".

### Fixed

- Fixed incorrect month label display (Feb showing as March)
- Fixed locking message not updating correctly
- Fixed email recipient issue (approver not included in CC)
- Fixed month accessing for approved request enabled editing all previous months

### Notes

- Requires DB column `request_reason` and `action_reason`
- Ensure frontend uses updated textarea ID: `requestReason` and `actionReason`

---

## [2026-04-01] - Initial Locking Feature

### Added

- Implemented Daily Report locking system
- Added Temporary Access Request feature
- Added approval/denial workflow
- Email for Requests and Status Updates

### Changed

- Editing restricted outside editable month

### Notes

- Locking follows first working day at 1:00 PM rule
