-- Migration: Add KDT Wide Training Report module and permissions
-- Date: 2026-09-16
-- Database: kdtphdb
--
-- Module (Web JMR):
--   KDT Wide Training Report
-- Permissions:
--   Access            (permission_id = 56)
--   All Group Access  (permission_id = 57)
--
-- Safe to run multiple times (idempotent).
-- Looks up Web JMR by project name so project_id can differ per environment.
-- Does not overwrite permission_id 56 or 57 if those IDs already exist.

SET @webJmrProjectId := (
    SELECT project_id
    FROM kdtwebprojects
    WHERE project_name = 'Web JMR'
    LIMIT 1
);

INSERT INTO kdtproject_modules (project_id, module_name)
SELECT
    @webJmrProjectId,
    'KDT Wide Training Report'
FROM DUAL
WHERE @webJmrProjectId IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM kdtproject_modules
      WHERE project_id = @webJmrProjectId
        AND module_name = 'KDT Wide Training Report'
  );

SET @kdtWideReportModuleId := (
    SELECT module_id
    FROM kdtproject_modules
    WHERE project_id = @webJmrProjectId
      AND module_name = 'KDT Wide Training Report'
    LIMIT 1
);

INSERT INTO p_permissions (
    permission_id,
    module_id,
    permission_name,
    permission_desc
)
SELECT
    56,
    @kdtWideReportModuleId,
    'Access',
    'Access to KDT Wide Training Report'
FROM DUAL
WHERE @kdtWideReportModuleId IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM p_permissions
      WHERE permission_id = 56
  )
  AND NOT EXISTS (
      SELECT 1
      FROM p_permissions
      WHERE module_id = @kdtWideReportModuleId
        AND permission_name = 'Access'
  );

INSERT INTO p_permissions (
    permission_id,
    module_id,
    permission_name,
    permission_desc
)
SELECT
    57,
    @kdtWideReportModuleId,
    'All Group Access',
    'All Group Access for KDT Wide Training Report'
FROM DUAL
WHERE @kdtWideReportModuleId IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM p_permissions
      WHERE permission_id = 57
  )
  AND NOT EXISTS (
      SELECT 1
      FROM p_permissions
      WHERE module_id = @kdtWideReportModuleId
        AND permission_name = 'All Group Access'
  );

-- Verify
SELECT
    p.project_id,
    p.project_name,
    m.module_id,
    m.module_name,
    perm.permission_id,
    perm.permission_name,
    perm.permission_desc
FROM kdtwebprojects AS p
JOIN kdtproject_modules AS m
    ON m.project_id = p.project_id
LEFT JOIN p_permissions AS perm
    ON perm.module_id = m.module_id
WHERE p.project_name = 'Web JMR'
  AND m.module_name = 'KDT Wide Training Report'
ORDER BY perm.permission_id;
