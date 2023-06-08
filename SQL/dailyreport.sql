-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 08, 2023 at 03:29 AM
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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dailyreport`
--
ALTER TABLE `dailyreport`
  ADD PRIMARY KEY (`fldID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dailyreport`
--
ALTER TABLE `dailyreport`
  MODIFY `fldID` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
 
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
