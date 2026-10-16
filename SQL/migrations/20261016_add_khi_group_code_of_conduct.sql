-- Migration: Add "KHI Group Code of Conduct" JRD under KDT Wide Training.
-- Date: 2026-10-16
-- Database: webjmrdb
--
-- Canonical names:
--   Item: KDT Wide Training
--   JRD:  KHI Group Code of Conduct
--
-- Safe to run multiple times (idempotent).
-- Looks up Training and KDT Wide Training by name so fldID can differ per environment.
-- JRD is item-scoped (fldItem = KDT Wide item ID, fldGroup NULL), not the shared Training pool.
-- Requires 20260916_add_kdt_wide_training.sql to have been applied first.

SET @trainProjID := (
    SELECT fldID
    FROM projectstable
    WHERE fldProject = 'Training'
    LIMIT 1
);

SET @kdtWideItemID := (
    SELECT fldID
    FROM itemofworkstable
    WHERE fldProject = @trainProjID
      AND fldItem = 'KDT Wide Training'
      AND fldDelete = '0'
    LIMIT 1
);

SET @nextPriority := (
    SELECT IFNULL(MAX(fldPriority), 0) + 1
    FROM drawingreference
    WHERE fldProject = @trainProjID
      AND fldItem = @kdtWideItemID
      AND fldDelete = '0'
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
    'KHI Group Code of Conduct',
    NULL,
    0,
    1,
    @nextPriority,
    0
FROM DUAL
WHERE @trainProjID IS NOT NULL
  AND @kdtWideItemID IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM drawingreference
      WHERE fldDelete = '0'
        AND fldProject = @trainProjID
        AND fldJob = 'KHI Group Code of Conduct'
  );

-- Verify
SELECT
    i.fldID AS itemID,
    p.fldProject,
    i.fldItem,
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
