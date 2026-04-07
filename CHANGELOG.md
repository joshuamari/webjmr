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

### Notes

- Requires DB column `request_reason`
- Ensure frontend uses updated textarea ID: `requestCreateReason`

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
