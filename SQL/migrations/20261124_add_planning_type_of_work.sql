-- Migration: Add Planning type of work
-- Date: 2026-11-24
-- Database: webjmrdb
--
-- Safe to run multiple times (idempotent).
-- fldTOWType = 1 so it appears for normal projects, not Leave.
-- No special form behavior. Checker and automatic hours stay tied to existing type IDs.

INSERT INTO typesofworktable (
    fldTOW,
    fldCode,
    fldTOWType,
    fldTOWDesc,
    fldActive,
    fldPrio
)
SELECT
    'Planning',
    'Plan',
    1,
    'Planning',
    1,
    0
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM typesofworktable
    WHERE fldTOW = 'Planning'
      AND fldTOWType = 1
);

-- Verify
SELECT
    fldID,
    fldCode,
    fldTOW,
    fldTOWType,
    fldTOWDesc,
    fldActive,
    fldPrio
FROM typesofworktable
WHERE fldTOW = 'Planning'
  AND fldTOWType = 1;
