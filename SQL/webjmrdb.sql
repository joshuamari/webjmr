-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 08, 2023 at 03:17 AM
-- Server version: 10.4.20-MariaDB
-- PHP Version: 8.0.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webjmrdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `ams`
--

CREATE TABLE `ams` (
  `fldID` bigint(20) NOT NULL,
  `fldEmployeeNum` int(11) DEFAULT NULL,
  `fldDate` date DEFAULT NULL,
  `fldTime` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `dailyreport`
--

CREATE TABLE `dailyreport` (
  `fldID` int(11) NOT NULL,
  `fldEmployeeNum` int(11) NOT NULL,
  `fldGroup` varchar(4) NOT NULL,
  `fldDate` date NOT NULL,
  `fldLocation` int(11) NOT NULL,
  `fldProject` int(11) NOT NULL,
  `fldItem` int(11) NOT NULL,
  `fldJobRequestDescription` varchar(100) DEFAULT NULL,
  `fld2D3D` varchar(10) DEFAULT NULL,
  `fldRevision` int(11) NOT NULL,
  `fldTOW` int(11) DEFAULT NULL,
  `fldChecker` int(11) DEFAULT NULL,
  `fldDuration` float NOT NULL,
  `fldMHType` int(11) NOT NULL,
  `fldRemarks` varchar(500) DEFAULT NULL,
  `fldTrGroup` varchar(5) DEFAULT NULL,
  `fldChangeLog` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `dispatch_locations`
--

CREATE TABLE `dispatch_locations` (
  `fldID` int(11) NOT NULL,
  `fldLocation` varchar(50) NOT NULL,
  `fldCode` int(1) NOT NULL DEFAULT 1,
  `fldActive` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `drawingreference`
--

CREATE TABLE `drawingreference` (
  `fldID` bigint(20) NOT NULL,
  `fldProject` varchar(100) NOT NULL,
  `fldItem` varchar(100) DEFAULT NULL,
  `fldJob` varchar(100) NOT NULL,
  `fldGroup` varchar(100) DEFAULT NULL,
  `fldNoSheets` int(11) DEFAULT NULL,
  `fldPaperSize` varchar(2) DEFAULT NULL,
  `fldDrawingName` varchar(100) DEFAULT NULL,
  `fldKHIDate` date DEFAULT NULL,
  `fldKHIC` varchar(100) DEFAULT NULL,
  `fldKHIDeadline` date DEFAULT NULL,
  `fldKDTDeadline` date DEFAULT NULL,
  `fldExpectedMH` int(10) DEFAULT 0,
  `fldActive` int(1) NOT NULL DEFAULT 1,
  `fldPriority` bigint(20) NOT NULL DEFAULT 0,
  `fldDelete` varchar(30) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `itemlabels`
--

CREATE TABLE `itemlabels` (
  `fldID` int(11) NOT NULL,
  `fldItem` int(11) NOT NULL,
  `fldLabel` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `itemofworkstable`
--

CREATE TABLE `itemofworkstable` (
  `fldID` bigint(20) NOT NULL,
  `fldProject` varchar(100) NOT NULL,
  `fldItem` varchar(100) NOT NULL,
  `fldGroup` varchar(100) DEFAULT NULL,
  `fldActive` int(1) NOT NULL DEFAULT 1,
  `fldPriority` bigint(20) NOT NULL,
  `fldDelete` varchar(30) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `planning`
--

CREATE TABLE `planning` (
  `fldID` int(11) NOT NULL,
  `fldPlanner` int(11) NOT NULL,
  `fldDatePlanned` datetime NOT NULL,
  `fldEmployeeNum` int(11) NOT NULL,
  `fldJob` int(11) NOT NULL,
  `fldStartDate` date NOT NULL,
  `fldEndDate` date NOT NULL,
  `fldHours` float NOT NULL,
  `fldStatus` datetime DEFAULT NULL,
  `fldDateModified` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `projectstable`
--

CREATE TABLE `projectstable` (
  `fldID` bigint(20) NOT NULL,
  `fldProject` varchar(100) NOT NULL,
  `fldOrder` varchar(100) DEFAULT NULL,
  `fldBUIC` varchar(100) DEFAULT NULL,
  `fldDirect` int(1) NOT NULL DEFAULT 1,
  `fldGroup` varchar(100) DEFAULT NULL,
  `fldActive` int(1) NOT NULL DEFAULT 1,
  `fldPriority` bigint(20) NOT NULL,
  `fldDelete` varchar(30) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `project_share`
--

CREATE TABLE `project_share` (
  `fldID` int(11) NOT NULL,
  `fldProject` int(11) NOT NULL,
  `fldEmployeeNum` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tap_machines`
--

CREATE TABLE `tap_machines` (
  `fldID` int(11) NOT NULL,
  `fldMachine` varchar(100) DEFAULT NULL,
  `fldType` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `typesofworktable`
--

CREATE TABLE `typesofworktable` (
  `fldID` bigint(20) NOT NULL,
  `fldTOW` varchar(100) NOT NULL,
  `fldCode` varchar(100) NOT NULL,
  `fldTOWType` int(1) NOT NULL,
  `fldTOWDesc` varchar(200) DEFAULT NULL,
  `fldActive` int(1) NOT NULL,
  `fldPrio` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ams`
--
ALTER TABLE `ams`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `dailyreport`
--
ALTER TABLE `dailyreport`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `dispatch_locations`
--
ALTER TABLE `dispatch_locations`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `drawingreference`
--
ALTER TABLE `drawingreference`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `itemlabels`
--
ALTER TABLE `itemlabels`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `itemofworkstable`
--
ALTER TABLE `itemofworkstable`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `planning`
--
ALTER TABLE `planning`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `projectstable`
--
ALTER TABLE `projectstable`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `project_share`
--
ALTER TABLE `project_share`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `tap_machines`
--
ALTER TABLE `tap_machines`
  ADD PRIMARY KEY (`fldID`);

--
-- Indexes for table `typesofworktable`
--
ALTER TABLE `typesofworktable`
  ADD PRIMARY KEY (`fldID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ams`
--
ALTER TABLE `ams`
  MODIFY `fldID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dailyreport`
--
ALTER TABLE `dailyreport`
  MODIFY `fldID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dispatch_locations`
--
ALTER TABLE `dispatch_locations`
  MODIFY `fldID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `drawingreference`
--
ALTER TABLE `drawingreference`
  MODIFY `fldID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `itemlabels`
--
ALTER TABLE `itemlabels`
  MODIFY `fldID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `itemofworkstable`
--
ALTER TABLE `itemofworkstable`
  MODIFY `fldID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `planning`
--
ALTER TABLE `planning`
  MODIFY `fldID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projectstable`
--
ALTER TABLE `projectstable`
  MODIFY `fldID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_share`
--
ALTER TABLE `project_share`
  MODIFY `fldID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tap_machines`
--
ALTER TABLE `tap_machines`
  MODIFY `fldID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `typesofworktable`
--
ALTER TABLE `typesofworktable`
  MODIFY `fldID` bigint(20) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
