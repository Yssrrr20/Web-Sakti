-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 27 Bulan Mei 2025 pada 03.07
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sakti`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `actions`
--

CREATE TABLE `actions` (
  `id` int(11) NOT NULL,
  `tree_id` int(11) DEFAULT NULL,
  `action_type` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `actions`
--

INSERT INTO `actions` (`id`, `tree_id`, `action_type`, `description`, `created_by`, `created_at`) VALUES
(1, 1, 'treatment', 'Applied pesticide', 1, '2025-04-14 16:05:29'),
(2, 2, 'monitoring', 'Regular checkup', 2, '2025-04-14 16:05:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `drone_scans`
--

CREATE TABLE `drone_scans` (
  `id` int(11) NOT NULL,
  `tree_id` int(11) DEFAULT NULL,
  `scan_time` datetime DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `status_detected` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `drone_scans`
--

INSERT INTO `drone_scans` (`id`, `tree_id`, `scan_time`, `image_path`, `status_detected`) VALUES
(1, 1, '2025-04-14 16:05:29', '/images/scan1.jpg', 'no issue'),
(2, 2, '2025-04-14 16:05:29', '/images/scan2.jpg', 'Ganoderma detected');

-- --------------------------------------------------------

--
-- Struktur dari tabel `help_docs`
--

CREATE TABLE `help_docs` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `help_docs`
--

INSERT INTO `help_docs` (`id`, `title`, `type`, `content`, `created_at`) VALUES
(1, 'How to Monitor Tree Health', 'Guide', 'Step-by-step instructions for monitoring tree health in the field.', '2025-04-14 16:05:30'),
(2, 'Troubleshooting Drone Scans', 'Guide', 'How to resolve issues with drone scans.', '2025-04-14 16:05:30');

-- --------------------------------------------------------

--
-- Struktur dari tabel `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `zone_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `locations`
--

INSERT INTO `locations` (`id`, `name`, `description`, `lat`, `longitude`, `zone_id`) VALUES
(1, 'Location A', 'Description of Location A', 1.29027, 103.851959, NULL),
(2, 'Location B', 'Description of Location B', 1.29027, 103.951959, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `navigation_logs`
--

CREATE TABLE `navigation_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `tree_id` int(11) DEFAULT NULL,
  `arrival_time` datetime DEFAULT NULL,
  `departure_time` datetime DEFAULT NULL,
  `gps_lat` double DEFAULT NULL,
  `gps_long` double DEFAULT NULL,
  `collected` tinyint(1) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `navigation_logs`
--

INSERT INTO `navigation_logs` (`id`, `user_id`, `tree_id`, `arrival_time`, `departure_time`, `gps_lat`, `gps_long`, `collected`, `notes`) VALUES
(1, 1, 1, '2025-04-14 16:05:30', '2025-04-14 16:05:30', 1.29027, 103.851959, 1, 'Collected sample from tree A'),
(2, 2, 2, '2025-04-14 16:05:30', '2025-04-14 16:05:30', 1.29027, 103.951959, 0, 'Did not collect due to infection');

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `tree_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `read_status` tinyint(1) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `tree_id`, `message`, `read_status`, `timestamp`) VALUES
(1, 1, 1, 'Tree is healthy', 1, '2025-04-14 16:05:29'),
(2, 2, 2, 'Ganoderma detected, action required', 0, '2025-04-14 16:05:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sensors`
--

CREATE TABLE `sensors` (
  `id` int(11) NOT NULL,
  `serial_number` varchar(255) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sensors`
--

INSERT INTO `sensors` (`id`, `serial_number`, `location_id`, `status`, `created_at`) VALUES
(1, 'SENSOR001', 1, 'active', '2025-04-14 16:05:29'),
(2, 'SENSOR002', 2, 'inactive', '2025-04-14 16:05:29'),
(3, 'SENSOR003', 2, 'active', '2025-04-14 16:05:29'),
(4, 'SENSOR004', 2, 'inactive', '2025-04-14 16:05:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sensor_readings`
--

CREATE TABLE `sensor_readings` (
  `id` int(11) NOT NULL,
  `sensor_id` int(11) DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `kelembapan` float DEFAULT NULL,
  `pH` float DEFAULT NULL,
  `nitrogen` float DEFAULT NULL,
  `phosphor` float DEFAULT NULL,
  `kalium` float DEFAULT NULL,
  `gps_lat` double DEFAULT NULL,
  `gps_long` double DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `source_file` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sensor_readings`
--

INSERT INTO `sensor_readings` (`id`, `sensor_id`, `temperature`, `kelembapan`, `pH`, `nitrogen`, `phosphor`, `kalium`, `gps_lat`, `gps_long`, `timestamp`, `source_file`) VALUES
(9, 1, 28.5, 65.2, 6.3, 40.2, 10.3, 35.1, -0.123456, 101.123456, '2025-04-12 08:30:00', 'sensor_001.csv'),
(10, 2, 29.1, 66.7, 6.5, 38.7, 9.8, 36, -0.123567, 101.123567, '2025-04-12 09:00:00', 'sensor_002.csv'),
(11, 1, 30, 64.5, 6.2, 41, 10.5, 34.8, -0.123678, 101.123678, '2025-04-12 09:30:00', 'sensor_001.csv'),
(12, 3, 27.8, 68.1, 6.4, 39, 10.1, 35.5, -0.123789, 101.123789, '2025-04-12 10:00:00', 'sensor_003.csv'),
(13, 4, 24.8, 70.3, 4.7, 39, 10.1, 35.5, -0.123789, 101.123789, '2025-04-12 10:00:00', 'sensor_003.csv');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sync_logs`
--

CREATE TABLE `sync_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `sync_time` datetime DEFAULT NULL,
  `sync_status` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sync_logs`
--

INSERT INTO `sync_logs` (`id`, `user_id`, `sync_time`, `sync_status`, `notes`) VALUES
(1, 1, '2025-04-14 16:05:29', 'success', 'Data sync completed successfully'),
(2, 2, '2025-04-14 16:05:29', 'failed', 'Sync failed due to network issues');

-- --------------------------------------------------------

--
-- Struktur dari tabel `trees`
--

CREATE TABLE `trees` (
  `id` int(11) NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `gps_lat` double DEFAULT NULL,
  `gps_long` double DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `trees`
--

INSERT INTO `trees` (`id`, `location_id`, `gps_lat`, `gps_long`, `status`) VALUES
(1, 1, 1.29027, 103.851959, 'healthy'),
(2, 2, 1.29027, 103.951959, 'infected');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tree_health_history`
--

CREATE TABLE `tree_health_history` (
  `id` int(11) NOT NULL,
  `tree_id` int(11) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `humidity` float DEFAULT NULL,
  `pH` float DEFAULT NULL,
  `nitrogen` float DEFAULT NULL,
  `phosphor` float DEFAULT NULL,
  `potassium` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tree_health_history`
--

INSERT INTO `tree_health_history` (`id`, `tree_id`, `timestamp`, `status`, `temperature`, `humidity`, `pH`, `nitrogen`, `phosphor`, `potassium`) VALUES
(1, 1, '2025-04-14 16:05:29', 'healthy', 30.5, 70.2, 6.5, 1.2, 0.5, 1.3),
(2, 2, '2025-04-14 16:05:29', 'infected', 28.3, 65.4, 6.7, 1, 0.6, 1.1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Admin User', 'admin@example.com', 'adminpass', 'admin', '2025-04-14 16:05:29'),
(2, 'Operator User', 'operator@example.com', 'operatorpass', 'operator', '2025-04-14 16:05:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `zones`
--

CREATE TABLE `zones` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `long` double DEFAULT NULL,
  `radius` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `zone_summaries`
--

CREATE TABLE `zone_summaries` (
  `id` int(11) NOT NULL,
  `zone_id` int(11) DEFAULT NULL,
  `temperature_avg` float DEFAULT NULL,
  `humidity_avg` float DEFAULT NULL,
  `pH_avg` float DEFAULT NULL,
  `nitrogen_avg` float DEFAULT NULL,
  `phosphor_avg` float DEFAULT NULL,
  `kalium_avg` float DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `actions`
--
ALTER TABLE `actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tree_id` (`tree_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indeks untuk tabel `drone_scans`
--
ALTER TABLE `drone_scans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tree_id` (`tree_id`);

--
-- Indeks untuk tabel `help_docs`
--
ALTER TABLE `help_docs`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_locations_zones` (`zone_id`);

--
-- Indeks untuk tabel `navigation_logs`
--
ALTER TABLE `navigation_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `tree_id` (`tree_id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `tree_id` (`tree_id`);

--
-- Indeks untuk tabel `sensors`
--
ALTER TABLE `sensors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indeks untuk tabel `sensor_readings`
--
ALTER TABLE `sensor_readings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sensor_id` (`sensor_id`);

--
-- Indeks untuk tabel `sync_logs`
--
ALTER TABLE `sync_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `trees`
--
ALTER TABLE `trees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indeks untuk tabel `tree_health_history`
--
ALTER TABLE `tree_health_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tree_id` (`tree_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `zone_summaries`
--
ALTER TABLE `zone_summaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `zone_id` (`zone_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `actions`
--
ALTER TABLE `actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `drone_scans`
--
ALTER TABLE `drone_scans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `help_docs`
--
ALTER TABLE `help_docs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `navigation_logs`
--
ALTER TABLE `navigation_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `sensors`
--
ALTER TABLE `sensors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `sensor_readings`
--
ALTER TABLE `sensor_readings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `sync_logs`
--
ALTER TABLE `sync_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `trees`
--
ALTER TABLE `trees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `tree_health_history`
--
ALTER TABLE `tree_health_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `zones`
--
ALTER TABLE `zones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `zone_summaries`
--
ALTER TABLE `zone_summaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `actions`
--
ALTER TABLE `actions`
  ADD CONSTRAINT `actions_ibfk_1` FOREIGN KEY (`tree_id`) REFERENCES `trees` (`id`),
  ADD CONSTRAINT `actions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `drone_scans`
--
ALTER TABLE `drone_scans`
  ADD CONSTRAINT `drone_scans_ibfk_1` FOREIGN KEY (`tree_id`) REFERENCES `trees` (`id`);

--
-- Ketidakleluasaan untuk tabel `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `fk_locations_zones` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `navigation_logs`
--
ALTER TABLE `navigation_logs`
  ADD CONSTRAINT `navigation_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `navigation_logs_ibfk_2` FOREIGN KEY (`tree_id`) REFERENCES `trees` (`id`);

--
-- Ketidakleluasaan untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`tree_id`) REFERENCES `trees` (`id`);

--
-- Ketidakleluasaan untuk tabel `sensors`
--
ALTER TABLE `sensors`
  ADD CONSTRAINT `sensors_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`);

--
-- Ketidakleluasaan untuk tabel `sensor_readings`
--
ALTER TABLE `sensor_readings`
  ADD CONSTRAINT `sensor_readings_ibfk_1` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`id`);

--
-- Ketidakleluasaan untuk tabel `sync_logs`
--
ALTER TABLE `sync_logs`
  ADD CONSTRAINT `sync_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `trees`
--
ALTER TABLE `trees`
  ADD CONSTRAINT `trees_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`);

--
-- Ketidakleluasaan untuk tabel `tree_health_history`
--
ALTER TABLE `tree_health_history`
  ADD CONSTRAINT `tree_health_history_ibfk_1` FOREIGN KEY (`tree_id`) REFERENCES `trees` (`id`);

--
-- Ketidakleluasaan untuk tabel `zone_summaries`
--
ALTER TABLE `zone_summaries`
  ADD CONSTRAINT `zone_summaries_ibfk_1` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
