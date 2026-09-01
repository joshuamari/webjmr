-- Migration: Drop billing-percent suffixes from Training item names
-- Date: 2026-09-01
-- Database: webjmrdb
--
-- Canonical names:
--   Trainer for One BU Participants
--   Trainer for Multiple BU Participants
--   Training for New Employee (3 Months)
--
-- Safe to run multiple times (idempotent).
-- Does not change fldID; dailyreport rows stay linked.

UPDATE itemofworkstable AS i
JOIN projectstable AS p ON p.fldID = i.fldProject
SET i.fldItem = 'Trainer for One BU Participants'
WHERE p.fldProject = 'Training'
  AND i.fldDelete = '0'
  AND i.fldItem LIKE 'Trainer for One BU Participants%'
  AND i.fldItem <> 'Trainer for One BU Participants'
  AND NOT EXISTS (
      SELECT 1
      FROM itemofworkstable AS existing
      WHERE existing.fldDelete = '0'
        AND existing.fldItem = 'Trainer for One BU Participants'
        AND existing.fldProject = i.fldProject
  );

UPDATE itemofworkstable AS i
JOIN projectstable AS p ON p.fldID = i.fldProject
SET i.fldItem = 'Trainer for Multiple BU Participants'
WHERE p.fldProject = 'Training'
  AND i.fldDelete = '0'
  AND i.fldItem LIKE 'Trainer for Multiple BU Participants%'
  AND i.fldItem <> 'Trainer for Multiple BU Participants'
  AND NOT EXISTS (
      SELECT 1
      FROM itemofworkstable AS existing
      WHERE existing.fldDelete = '0'
        AND existing.fldItem = 'Trainer for Multiple BU Participants'
        AND existing.fldProject = i.fldProject
  );

UPDATE itemofworkstable AS i
JOIN projectstable AS p ON p.fldID = i.fldProject
SET i.fldItem = 'Training for New Employee (3 Months)'
WHERE p.fldProject = 'Training'
  AND i.fldDelete = '0'
  AND i.fldItem LIKE 'Training for New Employee (3 Months)%'
  AND i.fldItem <> 'Training for New Employee (3 Months)'
  AND NOT EXISTS (
      SELECT 1
      FROM itemofworkstable AS existing
      WHERE existing.fldDelete = '0'
        AND existing.fldItem = 'Training for New Employee (3 Months)'
        AND existing.fldProject = i.fldProject
  );

-- Verify
SELECT
    i.fldID,
    i.fldProject,
    i.fldItem,
    i.fldActive,
    i.fldDelete
FROM itemofworkstable AS i
JOIN projectstable AS p ON p.fldID = i.fldProject
WHERE p.fldProject = 'Training'
  AND i.fldDelete = '0'
  AND (
    i.fldItem LIKE 'Trainer for One BU Participants%'
    OR i.fldItem LIKE 'Trainer for Multiple BU Participants%'
    OR i.fldItem LIKE 'Training for New Employee (3 Months)%'
  )
ORDER BY i.fldItem;
