# Changelog

Notable changes to Web JMR.

Newest work sits under **[Unreleased]** until a version is tagged. Dated sections below are notes from before versioning.

---

## [Unreleased]

R&D hours input, R&D Manhour Report, and MH Report billing shares. No release date yet.

### Added

- Daily Report: employees can log **Research & Development** hours under KDT Internal Activities. Unlike other KIA items, the JRD is not auto-selected; only the selected group's JRDs are listed (groups manage those JRDs in JMC)
- **R&D Manhour Report** (`Reports/RDReport/`): monthly R&D hours by employee, grouped by BU, with print and Excel export. Groups are multi-select; users with all-group access can include several BUs
- Reports hub card for R&D Manhour Report
- Report permissions: R&D Report Access (54) and R&D Report All Group Access (55). Idempotent migration copies current Man-Hour Report grants

### Changed

- **Man-Hour Report billing:** KDT vs BU split is no longer read from item-name suffixes (`[50% KDT]`, `[100% KHI]`). Shares live in `Reports/MHReport/php/mh_billing.php` (0–100 = KDT share; BU gets the remainder)
- Training / KIA items that used to split 50/50 now bill **100% KDT** (K1/K2), including Training for New Employee, Trainer for Multiple BU, Trainer for One BU, and Research & Development. **Trainer for KHI Engineer** stays 100% BU
- Training item labels dropped the percent suffix (name only). Daily Report rows are unchanged (`fldID` stays the same)
- Groups with no KHI counterpart: any remaining partial share still goes 100% to KDT (same rule as before)

### Notes

- Depends on the shared R&D item of work (see 2026-08-27)
- To change a split later, edit `mhKdtShareByItemName()` — do not put `%` back in the item name
- Run: `php SQL/migrations/20260901_copy_mh_report_permissions_to_rd_report.php`
- Run: `php SQL/migrations/20260901_rename_trainer_for_one_bu.php`

---

## [2026-08-27] - Add Research & Development Item (KIA)

### Added

- Added shared Item of Work `Research & Development` under KDT Internal Activities (project ID 2)
- Added idempotent migration under `SQL/migrations/` for other developers to apply
- JMC: managers can open R&D and manage group-owned JRDs (title only; scoped by `#myGroup`)

### Changed

- JMC exception for R&D under KIA: drill-down + Add/Edit/Delete/Activate JRD enabled; other KIA items unchanged
- JMC: fixed default-project ID checks so Meeting/Kaizen/Presentation/Hiring no longer show clickable JRD drill-down (R&D only)
- Daily Report: R&D under KIA requires manual JRD selection; lists only the selected group's JRDs (other KIA items still auto-select)
- Daily Report: automatic cache-busting via `filemtime` (`index.php` + `lib/assets.php`) so users do not need hard refresh after deploys
- JMC: automatic cache-busting via `filemtime` (`index.php` + `lib/assets.php`)

### Removed

- Daily Report unused leftovers: `DR_v3.js`, `newDR.js`, `jquery.table2excel.js`, `neoBootstrap.css`, `index.css`, `fonts/font/demo.html`
- JMC unused leftovers: `selectpicker.js/css`, `w3-kawasaki.css`, `bootstrap.bundle.min.js`, `get_version.php`, `fonts/font/demo.html`, unused jQuery UI package extras (kept `jquery-ui.min.js`)

### Notes

- Item uses `fldGroup = NULL` (visible to all groups) and `fldPriority = 0`
- No JRDs are seeded; each group will manage their own JRDs via JMC
- Run: `php SQL/migrations/20260827_add_research_and_development_item.php`
- R&D item ID resolved by name via `JMC/ajax/get_rditem_id.php`
- Kept `overtimeTest.js` (still referenced / may be re-enabled)
- Open Daily Report via `/DailyReport/` (serves `index.php`); old `index.html` redirects there

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
