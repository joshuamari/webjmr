-- Migration: Copy MH Report permissions to R&D Manhour Report
-- Date: 2026-09-01
-- Database: kdtphdb
--
--   MH Access (3)        -> R&D Access (54)
--   MH All group (51)    -> R&D All Group Access (55)
--
-- Safe to run multiple times (idempotent). Existing R&D grants are kept.

INSERT INTO user_permissions (permission_id, fldEmployeeNum)
SELECT 54, src.fldEmployeeNum
FROM user_permissions AS src
WHERE src.permission_id = 3
  AND NOT EXISTS (
      SELECT 1
      FROM user_permissions AS existing
      WHERE existing.permission_id = 54
        AND existing.fldEmployeeNum = src.fldEmployeeNum
  );

INSERT INTO user_permissions (permission_id, fldEmployeeNum)
SELECT 55, src.fldEmployeeNum
FROM user_permissions AS src
WHERE src.permission_id = 51
  AND NOT EXISTS (
      SELECT 1
      FROM user_permissions AS existing
      WHERE existing.permission_id = 55
        AND existing.fldEmployeeNum = src.fldEmployeeNum
  );

-- Verify
SELECT permission_id, COUNT(*) AS user_count
FROM user_permissions
WHERE permission_id IN (3, 51, 54, 55)
GROUP BY permission_id
ORDER BY permission_id;
