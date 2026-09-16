-- Migration: Daily Report audit history
-- Date: 2026-09-09
-- Database: webjmrdb
--
-- Safe to run multiple times (idempotent).
-- Stores Created / Updated / Deleted changes to dailyreport rows.
-- Copy From is not an audit action; copied rows are logged as Created when inserted.

CREATE TABLE IF NOT EXISTS `dailyreport_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `daily_report_id` int(11) NOT NULL,
  `employee_num` int(11) NOT NULL,
  `actor_num` int(11) NOT NULL,
  `actor_name` varchar(200) DEFAULT NULL,
  `actor_role` varchar(100) DEFAULT NULL,
  `report_date` date NOT NULL,
  `action` varchar(20) NOT NULL,
  `is_override` tinyint(1) NOT NULL DEFAULT 0,
  `override_reason` varchar(500) DEFAULT NULL,
  `previous_values` longtext DEFAULT NULL,
  `new_values` longtext DEFAULT NULL,
  `changed_fields` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_dr_history_employee_created` (`employee_num`, `created_at`),
  KEY `idx_dr_history_employee_report` (`employee_num`, `report_date`),
  KEY `idx_dr_history_actor` (`actor_num`),
  KEY `idx_dr_history_action` (`action`),
  KEY `idx_dr_history_daily_report` (`daily_report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
