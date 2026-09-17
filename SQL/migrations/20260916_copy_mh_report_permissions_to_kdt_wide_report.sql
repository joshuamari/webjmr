-- Migration: Copy MH Report permissions to KDT Wide Training Report
-- Date: 2026-09-16
-- Database: kdtphdb
--
--   MH Access (3)        -> KDT Wide Access (56)
--   MH All group (51)    -> KDT Wide All Group Access (57)
--
-- Safe to run multiple times (idempotent). Existing KDT Wide grants are kept.
-- Run 20260916_add_kdt_wide_report_permissions.sql first so 56 and 57 exist.

INSERT INTO user_permissions (permission_id, fldEmployeeNum)
SELECT 56, src.fldEmployeeNum
FROM user_permissions AS src
WHERE src.permission_id = 3
  AND NOT EXISTS (
      SELECT 1
      FROM user_permissions AS existing
      WHERE existing.permission_id = 56
        AND existing.fldEmployeeNum = src.fldEmployeeNum
  );

INSERT INTO user_permissions (permission_id, fldEmployeeNum)
SELECT 57, src.fldEmployeeNum
FROM user_permissions AS src
WHERE src.permission_id = 51
  AND NOT EXISTS (
      SELECT 1
      FROM user_permissions AS existing
      WHERE existing.permission_id = 57
        AND existing.fldEmployeeNum = src.fldEmployeeNum
  );

-- Verify
SELECT permission_id, COUNT(*) AS user_count
FROM user_permissions
WHERE permission_id IN (3, 51, 56, 57)
GROUP BY permission_id
ORDER BY permission_id;
