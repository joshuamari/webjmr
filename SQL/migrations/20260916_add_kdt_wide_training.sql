-- Migration: Add "KDT Wide Training" item of work under Training,
-- with two item-scoped JRDs (100% KDT billing is configured in MH Report PHP).
-- Date: 2026-09-16
-- Database: webjmrdb
--
-- Canonical names:
--   Item: KDT Wide Training
--   JRD:  People management training program
--   JRD:  Work Evolution Guidance
--
-- Safe to run multiple times (idempotent).
-- Looks up Training by project name so fldID can differ per environment.
-- JRDs are tied to this item (fldItem = item ID), not the shared Training pool.

SET @trainProjID := (
    SELECT fldID
    FROM projectstable
    WHERE fldProject = 'Training'
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
    @trainProjID,
    'KDT Wide Training',
    NULL,
    1,
    0,
    0
FROM DUAL
WHERE @trainProjID IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM itemofworkstable
      WHERE fldProject = @trainProjID
        AND fldItem = 'KDT Wide Training'
        AND fldDelete = '0'
  );

SET @kdtWideItemID := (
    SELECT fldID
    FROM itemofworkstable
    WHERE fldProject = @trainProjID
      AND fldItem = 'KDT Wide Training'
      AND fldDelete = '0'
    LIMIT 1
);

INSERT INTO drawingreference (
    fldProject,
    fldItem,
    fldJob,
    fldGroup,
    fldExpectedMH,
    fldActive,
    fldPriority,
    fldDelete
)
SELECT
    @trainProjID,
    @kdtWideItemID,
    'People management training program',
    NULL,
    0,
    1,
    1,
    0
FROM DUAL
WHERE @trainProjID IS NOT NULL
  AND @kdtWideItemID IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM drawingreference
      WHERE fldDelete = '0'
        AND fldProject = @trainProjID
        AND fldJob = 'People management training program'
  );

INSERT INTO drawingreference (
    fldProject,
    fldItem,
    fldJob,
    fldGroup,
    fldExpectedMH,
    fldActive,
    fldPriority,
    fldDelete
)
SELECT
    @trainProjID,
    @kdtWideItemID,
    'Work Evolution Guidance',
    NULL,
    0,
    1,
    2,
    0
FROM DUAL
WHERE @trainProjID IS NOT NULL
  AND @kdtWideItemID IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM drawingreference
      WHERE fldDelete = '0'
        AND fldProject = @trainProjID
        AND fldJob = 'Work Evolution Guidance'
  );

-- Verify
SELECT
    i.fldID AS itemID,
    p.fldProject,
    i.fldItem,
    i.fldGroup AS itemGroup,
    i.fldActive,
    i.fldDelete,
    d.fldID AS jrdID,
    d.fldJob,
    d.fldItem AS jrdItemID,
    d.fldGroup AS jrdGroup,
    d.fldActive AS jrdActive,
    d.fldPriority AS jrdPriority
FROM itemofworkstable AS i
JOIN projectstable AS p ON p.fldID = i.fldProject
LEFT JOIN drawingreference AS d
    ON d.fldItem = i.fldID
   AND d.fldDelete = '0'
WHERE p.fldProject = 'Training'
  AND i.fldItem = 'KDT Wide Training'
  AND i.fldDelete = '0'
ORDER BY d.fldPriority, d.fldJob;
