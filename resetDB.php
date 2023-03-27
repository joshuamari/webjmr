<?php
#region Require Database Connections
require_once "Includes/dbconnectwebjmr.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables

#endregion

#region main
    #region TRUNCATE
    $truncProjQ="TRUNCATE projectstable";
    $truncProjStmt=$connwebjmr->query($truncProjQ);
    $truncItemQ="TRUNCATE itemofworkstable";
    $truncItemStmt=$connwebjmr->query($truncItemQ);
    $truncJRDQ="TRUNCATE drawingreference";
    $truncJRDStmt=$connwebjmr->query($truncJRDQ);
    $truncShareQ="TRUNCATE project_share";
    $truncShareStmt=$connwebjmr->query($truncShareQ);
    #endregion

    #region INSERT
    $insertProjQ="INSERT INTO `projectstable` (`fldID`, `fldProject`, `fldOrder`, `fldBUIC`, `fldDirect`, `fldGroup`, `fldActive`, `fldPriority`, `fldDelete`) VALUES
    (1, 'Management', NULL, NULL, 0, NULL, 1, 0, 0),
    (2, 'KDT Internal Activities', NULL, NULL, 0, NULL, 1, 0, 0),
    (3, 'Training', NULL, NULL, 0, NULL, 1, 0, 0),
    (4, 'Development, Analysis & IT', NULL, NULL, 0, NULL, 1, 0, 0),
    (5, 'Business Trip & Other', NULL, NULL, 0, NULL, 1, 0, 0),
    (6, 'Leave', NULL, NULL, 0, NULL, 1, 0, 0)";
    $insertProjStmt=$connwebjmr->query($insertProjQ);
    $insertItemQ="INSERT INTO `itemofworkstable` (`fldID`, `fldProject`, `fldItem`, `fldGroup`, `fldActive`, `fldPriority`, `fldDelete`) VALUES
    (1, '1', 'Management (SM)', NULL, 1, 0, 0),
    (2, '1', 'Department Management (DM of Solution)', NULL, 1, 0, 0),
    (3, '1', 'Department Management (DM)', NULL, 1, 0, 0),
    (4, '1', 'Group Management (AM)', NULL, 1, 0, 0),
    (5, '1', 'Group Management (SSV)', NULL, 1, 0, 0),
    (6, '2', 'Meeting (regular or PJ Meeting related to KHI)', NULL, 1, 0, 0),
    (7, '2', 'Meeting (Kaizen, Outing or Year-end party related to KDT)', NULL, 1, 0, 0),
    (8, '2', 'Kaizen', NULL, 1, 0, 0),
    (9, '2', 'Presentation', NULL, 1, 0, 0),
    (10, '3', 'Training for KDT engineer (Prior approval from KHI)', NULL, 1, 0, 0),
    (11, '3', 'Training for New Employee (3 Months)', NULL, 1, 0, 0),
    (12, '3', 'Trainer for KHI Engineer', NULL, 1, 0, 0),
    (13, '3', 'Trainer for Multiple BU Participants', NULL, 1, 0, 0),
    (14, '3', 'Trainer for One BU Participants', NULL, 1, 0, 0),
    (15, '4', 'Development (Requested  by KHI or KDT Group)', 'SYS', 1, 0, 0),
    (16, '4', 'Development (Requested  by KDT Management)', 'SYS', 1, 0, 0),
    (17, '4', 'Analysis (Requested  by KME, KHI & KDT Group)', 'ANA', 1, 0, 0),
    (18, '4', 'Analysis (Requested  by KDT Management)', 'ANA', 1, 0, 0),
    (19, '4', 'IT (Requested  by KHI or KDT Group)', 'IT', 1, 0, 0),
    (20, '4', 'IT (Requested  by KDT Management)', 'IT', 1, 0, 0),
    (21, '5', 'Business Trip (Requested by KHI)', NULL, 1, 0, 0),
    (22, '5', 'Business Trip, Seminar (Requested by KDT)', NULL, 1, 0, 0),
    (23, '5', 'Medical', NULL, 1, 0, 0),
    (24, '5', 'Calamity', NULL, 1, 0, 0),
    (25, '6', 'Vacation Leave', NULL, 1, 0, 0),
    (26, '6', 'Sick Leave', NULL, 1, 0, 0),
    (27, '6', 'Emergency Leave', NULL, 1, 0, 0),
    (28, '6', 'Maternity Leave', NULL, 1, 0, 0),
    (29, '6', 'Paternity Leave', NULL, 1, 0, 0),
    (30, '6', 'Tubercolosis Leave', NULL, 1, 0, 0),
    (31, '6', 'Long Leave', NULL, 1, 0, 0)";
    $insertItemStmt=$connwebjmr->query($insertItemQ);
    $insertJRDQ="INSERT INTO `drawingreference` (`fldID`, `fldProject`, `fldItem`, `fldJob`, `fldGroup`, `fldNoSheets`, `fldPaperSize`, `fldDrawingName`, `fldKHIDate`, `fldKHIC`, `fldKHIDeadline`, `fldKDTDeadline`, `fldExpectedMH`, `fldActive`, `fldPriority`, `fldDelete`) VALUES
    (1, '1', '1', 'Overall Management', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (2, '1', '2', 'Department Management', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (3, '1', '3', 'Department Management', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (4, '1', '4', 'Group Management', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (5, '1', '5', 'Group Management', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (6, '2', '6', 'Meeting (regular or PJ Meeting related to KHI)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (7, '2', '7', 'Meeting (Kaizen, Outing or Year-end party related to KDT)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (8, '2', '8', 'Kaizen', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (9, '2', '9', 'Presentation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (10, '3', NULL, 'AdvanceSteel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (11, '3', NULL, 'AutoCAD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (12, '3', NULL, 'AutoPIPE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (13, '3', NULL, 'CATIA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (14, '3', NULL, 'E3D/PDMS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (15, '3', NULL, 'eDPP', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (16, '3', NULL, 'ETAP', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (17, '3', NULL, 'Excel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (18, '3', NULL, 'HyperWorks', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (19, '3', NULL, 'Inventor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (20, '3', NULL, 'Navisworks', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (21, '3', NULL, 'Nihonggo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (22, '3', NULL, 'Orientation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (23, '3', NULL, 'Powerpoint', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (24, '3', NULL, 'Primavera', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (25, '3', NULL, 'Revit', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (26, '3', NULL, 'SP3D', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (27, '3', NULL, 'SPELE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (28, '3', NULL, 'SPINST', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (29, '3', NULL, 'SPPID', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (30, '3', NULL, 'STAAD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (31, '3', NULL, 'Visio', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 0),
    (32, '4', '16', 'EDMon', 'SYS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0),
    (33, '4', '16', 'Forms', 'SYS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 2, 0),
    (34, '4', '16', 'JMR', 'SYS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 3, 0),
    (35, '4', '16', 'Timelog', 'SYS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 4, 0),
    (36, '4', '16', 'Web JMR', 'SYS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 5, 0)";
    $insertJRDStmt=$connwebjmr->query($insertJRDQ);
    #endregion


#endregion

#region function

#endregion
header('Location: ./JMC');
?>