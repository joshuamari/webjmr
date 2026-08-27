-- Migration: Add Research & Development Item of Work under KDT Internal Activities
-- Date: 2026-08-27
-- Database: webjmrdb
--
-- Safe to run multiple times (idempotent).
-- Does NOT seed JRDs — each group will add their own via JMC.

INSERT INTO itemofworkstable (
    fldProject,
    fldItem,
    fldGroup,
    fldActive,
    fldPriority,
    fldDelete
)
SELECT
    2,
    'Research & Development',
    NULL,
    1,
    0,
    0
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM itemofworkstable
    WHERE fldProject = 2
      AND fldItem = 'Research & Development'
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
WHERE fldProject = 2
  AND fldItem = 'Research & Development'
  AND fldDelete = '0';
