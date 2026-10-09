-- Migration: Add Special Leave item of work under Leave
-- Date: 2026-10-08
-- Database: webjmrdb
--
-- Safe to run multiple times (idempotent).
-- Looks up Leave by project name so fldID can differ per environment.
-- fldGroup is NULL so every group sees it in Daily Report.
-- No JRD is seeded. Leave entries do not require a job request.

SET @leaveProjID := (
    SELECT fldID
    FROM projectstable
    WHERE fldProject = 'Leave'
      AND fldDelete = 0
    LIMIT 1
);

INSERT INTO itemofworkstable (
    fldProject,
    fldItem,
    fldGroup,
    fldActive,
    fldPriority,
    fldDelete
)
SELECT
    @leaveProjID,
    'Special Leave',
    NULL,
    1,
    0,
    0
FROM DUAL
WHERE @leaveProjID IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM itemofworkstable
      WHERE fldProject = @leaveProjID
        AND fldItem = 'Special Leave'
        AND fldDelete = '0'
  );

-- Verify
SELECT
    fldID,
    fldProject,
    fldItem,
    fldGroup,
    fldActive,
    fldPriority,
    fldDelete
FROM itemofworkstable
WHERE fldProject = @leaveProjID
  AND fldItem = 'Special Leave'
  AND fldDelete = '0';
