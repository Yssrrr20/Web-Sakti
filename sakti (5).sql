-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 30 Jun 2025 pada 17.34
-- Versi server: 8.0.42-0ubuntu0.24.04.1
-- Versi PHP: 8.3.6

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
-- Struktur dari tabel `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `level` enum('INFO','SUCCESS','WARNING','ACTION') NOT NULL DEFAULT 'INFO',
  `event_type` varchar(100) NOT NULL,
  `message` varchar(255) NOT NULL,
  `details` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `activity_log`
--

INSERT INTO `activity_log` (`id`, `timestamp`, `level`, `event_type`, `message`, `details`) VALUES
(3, '2025-06-28 10:17:36', 'INFO', 'DATA_SENT_TO_TRAINING', 'Berhasil mengirim file \'processed_batch_2025-06-17T04-08-04-722Z.csv\' ke server training.', '{\"filename\": \"processed_batch_2025-06-17T04-08-04-722Z.csv\", \"serverResponse\": {\"details\": \"Analisis dan korelasi berhasil.\", \"message\": \"Pipeline analisis dan korelasi tanah selesai.\"}}'),
(4, '2025-06-28 10:21:18', 'INFO', 'FILE_RECEIVED', 'Berhasil menerima 3 file: hasil_akhir_kesehatan_pohon.csv, hasil_analisis_tanah.csv, Map.tif.', '{\"files\": [\"hasil_akhir_kesehatan_pohon.csv\", \"hasil_analisis_tanah.csv\", \"Map.tif\"]}'),
(5, '2025-06-28 10:21:36', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(6, '2025-06-28 11:00:50', 'INFO', 'MAP_TILING_STARTED', 'Proses tiling untuk peta \'Map.tif\' dimulai.', NULL),
(7, '2025-06-28 11:00:50', 'INFO', 'CSV_PROCESSING_COMPLETED', 'Selesai memproses file CSV: hasil_akhir_kesehatan_pohon.csv, hasil_analisis_tanah.csv', '{\"files\": [\"hasil_akhir_kesehatan_pohon.csv\", \"hasil_analisis_tanah.csv\"]}'),
(8, '2025-06-28 11:00:53', 'SUCCESS', 'MAP_TILING_COMPLETED', 'Proses tiling untuk peta \'Map.tif\' berhasil.', NULL),
(9, '2025-06-28 11:19:16', 'INFO', 'MAP_TILING_STARTED', 'Proses tiling untuk peta \'Map.tif\' dimulai.', NULL),
(10, '2025-06-28 11:19:16', 'INFO', 'CSV_PROCESSING_COMPLETED', 'Selesai memproses file CSV: hasil_akhir_kesehatan_pohon.csv, hasil_analisis_tanah.csv', '{\"files\": [\"hasil_akhir_kesehatan_pohon.csv\", \"hasil_analisis_tanah.csv\"]}'),
(11, '2025-06-28 11:19:18', 'SUCCESS', 'MAP_TILING_COMPLETED', 'Proses tiling untuk peta \'Map.tif\' berhasil.', NULL),
(12, '2025-06-28 14:08:24', 'WARNING', 'DATA_SENT_FAILURE', 'Tidak dapat terhubung ke server training. Pastikan URL dan port sudah benar.', NULL),
(13, '2025-06-28 14:31:53', 'WARNING', 'DATA_SENT_FAILURE', 'Tidak dapat terhubung ke server training. Pastikan URL dan port sudah benar.', NULL),
(14, '2025-06-28 14:32:28', 'INFO', 'DATA_SENT_TO_TRAINING', 'Berhasil mengirim file \'processed_batch_2025-06-28T11-26-33-912Z.csv\' ke server training.', '{\"filename\": \"processed_batch_2025-06-28T11-26-33-912Z.csv\", \"serverResponse\": {\"details\": \"Analisis dan korelasi berhasil.\", \"message\": \"Pipeline analisis dan korelasi tanah selesai.\"}}'),
(15, '2025-06-28 14:35:08', 'INFO', 'FILE_RECEIVED', 'Berhasil menerima 3 file: hasil_akhir_kesehatan_pohon.csv, hasil_analisis_tanah.csv, Map.tif.', '{\"files\": [\"hasil_akhir_kesehatan_pohon.csv\", \"hasil_analisis_tanah.csv\", \"Map.tif\"]}'),
(16, '2025-06-28 14:57:33', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(17, '2025-06-28 14:58:09', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(18, '2025-06-28 15:03:34', 'INFO', 'DATA_SENT_TO_TRAINING', 'Berhasil mengirim file \'processed_batch_2025-06-28T11-26-14-883Z.csv\' ke server training.', '{\"filename\": \"processed_batch_2025-06-28T11-26-14-883Z.csv\", \"serverResponse\": {\"details\": \"Analisis dan korelasi berhasil.\", \"message\": \"Pipeline analisis dan korelasi tanah selesai.\"}}'),
(19, '2025-06-28 15:06:03', 'INFO', 'FILE_RECEIVED', 'Berhasil menerima 3 file: hasil_akhir_kesehatan_pohon.csv, hasil_analisis_tanah.csv, Map.tif.', '{\"files\": [\"hasil_akhir_kesehatan_pohon.csv\", \"hasil_analisis_tanah.csv\", \"Map.tif\"]}'),
(20, '2025-06-28 15:27:16', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(21, '2025-06-28 17:38:39', 'INFO', 'FILE_RECEIVED', 'Berhasil menerima 3 file: hasil_akhir_kesehatan_pohon.csv, hasil_analisis_tanah.csv, Map.tif.', '{\"files\": [\"hasil_akhir_kesehatan_pohon.csv\", \"hasil_analisis_tanah.csv\", \"Map.tif\"]}'),
(22, '2025-06-28 17:43:22', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(23, '2025-06-28 18:27:45', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(24, '2025-06-28 18:40:59', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(25, '2025-06-29 07:00:42', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(26, '2025-06-29 07:05:53', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(27, '2025-06-29 08:34:42', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(28, '2025-06-29 09:30:52', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(29, '2025-06-29 09:34:37', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(30, '2025-06-29 12:28:26', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(31, '2025-06-30 07:55:43', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(32, '2025-06-30 07:57:28', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(33, '2025-06-30 13:15:11', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(34, '2025-06-30 13:17:52', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(35, '2025-06-30 15:21:56', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}'),
(36, '2025-06-30 15:37:13', 'WARNING', 'DATA_SENT_FAILURE', 'Tidak dapat terhubung ke server training. Pastikan URL dan port sudah benar.', NULL),
(37, '2025-06-30 15:37:36', 'WARNING', 'DATA_SENT_FAILURE', 'Tidak dapat terhubung ke server training. Pastikan URL dan port sudah benar.', NULL),
(38, '2025-06-30 17:07:55', 'SUCCESS', 'ZONE_ANALYSIS', 'Analisis zona baru berhasil dibuat, menghasilkan 10 zona.', '{\"zones_created\": 10}');

-- --------------------------------------------------------

--
-- Struktur dari tabel `map_zones`
--

CREATE TABLE `map_zones` (
  `id` int NOT NULL,
  `zone_name` varchar(255) DEFAULT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bounds_sw_lat` double NOT NULL,
  `bounds_sw_lng` double NOT NULL,
  `bounds_ne_lat` double NOT NULL,
  `bounds_ne_lng` double NOT NULL,
  `tree_count_total` int DEFAULT '0',
  `tree_count_healthy` int DEFAULT '0',
  `tree_count_infected` int DEFAULT '0',
  `tree_count_potential` int DEFAULT '0',
  `avg_ph` decimal(5,2) DEFAULT NULL,
  `avg_temperature` decimal(6,2) DEFAULT NULL,
  `avg_humidity` decimal(6,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `map_zones`
--

INSERT INTO `map_zones` (`id`, `zone_name`, `label`, `bounds_sw_lat`, `bounds_sw_lng`, `bounds_ne_lat`, `bounds_ne_lng`, `tree_count_total`, `tree_count_healthy`, `tree_count_infected`, `tree_count_potential`, `avg_ph`, `avg_temperature`, `avg_humidity`, `created_at`) VALUES
(1, 'Zona 1', 'Normal', -6.551962443125156, 106.71656800874598, -6.551512442675155, 106.71702011715234, 24, 20, 2, 2, 6.75, 1023.75, 2.00, '2025-06-30 17:07:55'),
(2, 'Zona 2', 'Zona Sehat', -6.551512442675155, 106.71611590033962, -6.551062442225154, 106.71656800833817, 6, 6, 0, 0, NULL, NULL, NULL, '2025-06-30 17:07:55'),
(3, 'Zona 3', 'Normal', -6.551512442675155, 106.71656800833817, -6.551062442225154, 106.71702011633673, 30, 26, 2, 2, 7.80, 1023.75, 0.00, '2025-06-30 17:07:55'),
(4, 'Zona 4', 'Zona Sehat', -6.551512442675155, 106.71702011633673, -6.551062442225154, 106.71747222433528, 2, 2, 0, 0, NULL, NULL, NULL, '2025-06-30 17:07:55'),
(5, 'Zona 5', 'Zona Sehat', -6.551062442225154, 106.71611590033962, -6.5506124417751534, 106.71656800793038, 20, 20, 0, 0, NULL, NULL, NULL, '2025-06-30 17:07:55'),
(6, 'Zona 6', 'Normal', -6.551062442225154, 106.71656800793038, -6.5506124417751534, 106.71702011552114, 27, 24, 1, 2, 7.80, 1023.75, 0.00, '2025-06-30 17:07:55'),
(7, 'Zona 7', 'Zona Sehat', -6.5506124417751534, 106.71611590033962, -6.550162441325153, 106.71656800752262, 18, 18, 0, 0, NULL, NULL, NULL, '2025-06-30 17:07:55'),
(8, 'Zona 8', 'Zona Sehat', -6.5506124417751534, 106.71656800752262, -6.550162441325153, 106.71702011470563, 19, 19, 0, 0, NULL, NULL, NULL, '2025-06-30 17:07:55'),
(9, 'Zona 9', 'Zona Sehat', -6.550162441325153, 106.71611590033962, -6.549712440875152, 106.71656800711489, 1, 1, 0, 0, NULL, NULL, NULL, '2025-06-30 17:07:55'),
(10, 'Zona 10', 'Zona Sehat', -6.550162441325153, 106.71656800711489, -6.549712440875152, 106.71702011389016, 2, 2, 0, 0, NULL, NULL, NULL, '2025-06-30 17:07:55');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sensors`
--

CREATE TABLE `sensors` (
  `id` int NOT NULL,
  `serial_number` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sensors`
--

INSERT INTO `sensors` (`id`, `serial_number`, `status`, `created_at`) VALUES
(1, 'SENSOR001', 'active', '2025-04-14 16:05:29'),
(2, 'SENSOR002', 'inactive', '2025-04-14 16:05:29'),
(3, 'SENSOR003', 'inactive', '2025-04-14 16:05:29'),
(4, 'SENSOR004', 'inactive', '2025-04-14 16:05:29'),
(5, 'SENSOR007', 'inactive', '2025-04-14 16:05:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sensor_readings`
--

CREATE TABLE `sensor_readings` (
  `id` int NOT NULL,
  `sensor_id` int DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `kelembapan` float DEFAULT NULL,
  `pH` float DEFAULT NULL,
  `gps_lat` double DEFAULT NULL,
  `gps_long` double DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sensor_readings`
--

INSERT INTO `sensor_readings` (`id`, `sensor_id`, `temperature`, `kelembapan`, `pH`, `gps_lat`, `gps_long`, `timestamp`) VALUES
(170, 1, 1023.75, 100, 7.8, -7.286562, 112.796172, '2025-06-16 17:59:57'),
(171, 1, 1023.75, 100, 7.8, -7.286899, 112.796369, '2025-06-16 18:05:53'),
(172, 1, 1023.75, 100, 7.8, -7.287178, 112.796434, '2025-06-16 18:08:06'),
(173, 1, 1023.75, 100, 7.8, -7.28717, 112.796427, '2025-06-16 18:08:42'),
(174, 1, 1023.75, 100, 7.8, -7.287169, 112.796434, '2025-06-16 18:09:14'),
(175, 1, 1023.75, 0, 7.8, -7.287179, 112.796432, '2025-06-16 18:09:49'),
(176, 1, 1023.75, 100, 7.8, -7.287165, 112.796466, '2025-06-16 18:11:01'),
(177, 1, 1023.75, 0, 7.8, -7.287158, 112.796459, '2025-06-16 18:11:52'),
(178, 1, 1023.75, 50, 7.8, -7.287155, 112.796465, '2025-06-16 18:12:10'),
(179, 1, 1023.75, 100, 7.8, -7.287151, 112.796464, '2025-06-16 18:13:06'),
(180, 1, 1023.75, 100, 7.8, -7.287151, 112.796465, '2025-06-16 18:13:07'),
(181, 1, 34.5, 100, 7.8, -7.287143, 112.796463, '2025-06-16 18:13:28'),
(182, 1, 35.5, 100, 7.8, -7.287146, 112.796461, '2025-06-16 18:13:51'),
(183, 1, 33.5, 100, 7.8, -7.287144, 112.796461, '2025-06-16 18:14:16'),
(184, 1, 1023.75, 0, 7.8, -7.286114, 112.796165, '2025-06-16 18:22:21'),
(185, 1, 1023.75, 0, 7.8, -7.285973, 112.795906, '2025-06-16 18:23:02'),
(186, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:27:09'),
(187, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:27:23'),
(188, 1, 1023.75, 8, 3.61, 0, -1, '2025-06-17 03:39:02'),
(189, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:39:06'),
(190, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:39:07'),
(191, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:39:07'),
(192, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:39:09'),
(193, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:39:10'),
(194, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:39:11'),
(195, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:39:11'),
(196, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:39:12'),
(197, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:39:13'),
(198, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:44:49'),
(199, 1, 1023.75, 0, 7.8, 0, -1, '2025-06-17 03:44:59'),
(200, 1, 0, 100, 7.8, -7.28531, 112.795947, '2025-06-07 19:25:56'),
(201, 1, 0, 100, 3.1, -7.285316, 112.795951, '2025-06-07 19:26:01'),
(202, 1, 0, 100, 7.09, -7.285238, 112.795952, '2025-06-07 19:40:17'),
(203, 1, 1023.75, 0, 0.1, 0, -1, '2025-06-27 14:30:35'),
(204, 1, 1023.75, 0, 0.11, 0, -1, '2025-06-27 14:38:28'),
(205, 1, 1023.75, 0, 0.06, 0, -1, '2025-06-27 14:46:26'),
(206, 1, 1023.75, 0, 0.11, 0, -1, '2025-06-27 14:46:28'),
(207, 1, 1023.75, 0, 0.16, 0, -1, '2025-06-27 14:46:30'),
(208, 1, 1023.75, 0, 0.21, 0, -1, '2025-06-27 14:46:31'),
(209, 1, 1023.75, 0, 0.26, 0, -1, '2025-06-27 14:46:31'),
(210, 1, 1023.75, 0, 0.31, 0, -1, '2025-06-27 14:46:32'),
(211, 1, 1023.75, 0, 0.36, 0, -1, '2025-06-27 14:46:33'),
(212, 1, 1023.75, 0, 0.41, 0, -1, '2025-06-27 14:46:33'),
(213, 1, 1023.75, 0, 0.45, 0, -1, '2025-06-27 14:46:34'),
(214, 1, 1023.75, 0, 0.49, 0, -1, '2025-06-27 14:46:35'),
(215, 1, 1023.75, 0, 0.54, 0, -1, '2025-06-27 14:46:35'),
(216, 1, 1023.75, 0, 0.59, 0, -1, '2025-06-27 14:46:36'),
(217, 1, 1023.75, 0, 0.64, 0, -1, '2025-06-27 14:46:37'),
(218, 1, 1023.75, 0, 0.68, 0, -1, '2025-06-27 14:46:37'),
(219, 1, 1023.75, 0, 0.73, 0, -1, '2025-06-27 14:46:38'),
(220, 1, 1023.75, 0, 0.71, 0, -1, '2025-06-27 14:46:38'),
(221, 1, 1023.75, 0, 0.7, 0, -1, '2025-06-27 14:46:38'),
(222, 1, 1023.75, 0, 0.7, 0, -1, '2025-06-27 14:46:39'),
(223, 1, 1023.75, 0, 0.69, 0, -1, '2025-06-27 14:46:40'),
(224, 1, 1023.75, 0, 0.68, 0, -1, '2025-06-27 14:46:40'),
(225, 1, 1023.75, 0, 0.65, 0, -1, '2025-06-27 14:46:41'),
(226, 1, 1023.75, 0, 0.65, 0, -1, '2025-06-27 14:46:42'),
(227, 1, 1023.75, 0, 0.98, 0, -1, '2025-06-27 14:47:14'),
(228, 1, 1023.75, 0, 1.32, 0, -1, '2025-06-27 14:47:15'),
(229, 1, 1023.75, 0, 1.64, 0, -1, '2025-06-27 14:47:16'),
(230, 1, 1023.75, 0, 1.97, 0, -1, '2025-06-27 14:47:16'),
(231, 1, 1023.75, 0, 2.29, 0, -1, '2025-06-27 14:47:17'),
(232, 1, 1023.75, 0, 2.59, 0, -1, '2025-06-27 14:47:17'),
(233, 1, 1023.75, 0, 2.92, 0, -1, '2025-06-27 14:47:20'),
(234, 1, 1023.75, 0, 3.15, 0, -1, '2025-06-27 14:47:25'),
(235, 1, 1023.75, 0, 3.47, 0, -1, '2025-06-27 14:47:27'),
(236, 1, 1023.75, 0, 3.76, 0, -1, '2025-06-27 14:47:27'),
(237, 1, 1023.75, 0, 4.08, 0, -1, '2025-06-27 14:47:28'),
(238, 1, 1023.75, 0, 4.4, 0, -1, '2025-06-27 14:47:28'),
(239, 1, 1023.75, 0, 4.73, 0, -1, '2025-06-27 14:47:29'),
(240, 1, 25.75, 0, 0, 0, -1, '2025-06-28 11:31:41'),
(241, 1, 25.75, 0, 0, 0, -1, '2025-06-28 11:31:41'),
(242, 1, 38.25, 0, 7.3, 0, -1, '2025-06-28 11:31:52'),
(243, 1, 37.75, 0, 7.31, 0, -1, '2025-06-28 11:31:53'),
(244, 1, 34.75, 0, 7.48, 0, -1, '2025-06-28 11:32:10');

-- --------------------------------------------------------

--
-- Struktur dari tabel `soil_data`
--

CREATE TABLE `soil_data` (
  `id` int NOT NULL,
  `sensor_id` int DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `humidity` float DEFAULT NULL,
  `ph` float DEFAULT NULL,
  `gps_lat` double DEFAULT NULL,
  `gps_long` double DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `status_prediksi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `soil_data`
--

INSERT INTO `soil_data` (`id`, `sensor_id`, `temperature`, `humidity`, `ph`, `gps_lat`, `gps_long`, `timestamp`, `status_prediksi`) VALUES
(129, 1, 1023.75, 8, 3.61, -6.551727090562029, 106.7166565303066, '2025-06-16 20:39:02', 'Tidak Sehat'),
(130, 1, 1023.75, 0, 7.8, -6.551625680049829, 106.7169551485463, '2025-06-16 20:39:06', 'Tidak Sehat'),
(131, 1, 1023.75, 0, 7.8, -6.551588138439603, 106.71692199146908, '2025-06-16 20:39:07', 'Tidak Sehat'),
(132, 1, 1023.75, 0, 7.8, -6.551391121263676, 106.71673166452776, '2025-06-16 20:39:07', 'Tidak Sehat'),
(133, 1, 1023.75, 0, 7.8, -6.550912118471838, 106.71667503884524, '2025-06-16 20:39:11', 'Tidak Sehat'),
(134, 1, 1023.75, 0, 7.8, -6.551127214771207, 106.71659093305468, '2025-06-16 20:39:12', 'Tidak Sehat'),
(135, 1, 1023.75, 0, 7.8, -6.551771354073334, 106.71685878805548, '2025-06-16 20:39:13', 'Tidak Sehat');

-- --------------------------------------------------------

--
-- Struktur dari tabel `trees`
--

CREATE TABLE `trees` (
  `id` int NOT NULL,
  `gps_lat` double DEFAULT NULL,
  `gps_long` double DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `trees`
--

INSERT INTO `trees` (`id`, `gps_lat`, `gps_long`, `status`) VALUES
(1, -6.550671373578656, 106.71642823617644, 'healthy'),
(2, -6.550759100765217, 106.71683930961014, 'healthy'),
(3, -6.551426258869497, 106.71685422289524, 'healthy'),
(4, -6.551126896622807, 106.71662371794002, 'potential'),
(5, -6.550802595214225, 106.71636599263992, 'healthy'),
(6, -6.55057903702122, 106.71640733508184, 'healthy'),
(7, -6.550178429444364, 106.71677720542236, 'healthy'),
(8, -6.550412743721792, 106.7163953043009, 'healthy'),
(9, -6.551130670925512, 106.71647776108618, 'healthy'),
(10, -6.550233899139044, 106.7163593702407, 'healthy'),
(11, -6.550916831054688, 106.71668732933036, 'potential'),
(12, -6.551082911972204, 106.7166930435378, 'healthy'),
(13, -6.550308339301033, 106.71696174890874, 'healthy'),
(14, -6.551008935945235, 106.71684437453352, 'healthy'),
(15, -6.550877990718568, 106.71675737426231, 'healthy'),
(16, -6.550251405238084, 106.71657627900954, 'healthy'),
(17, -6.551092675020787, 106.71684816975748, 'healthy'),
(18, -6.55096253010232, 106.7164587061307, 'healthy'),
(19, -6.551925705030352, 106.71672469825126, 'healthy'),
(20, -6.551544612964018, 106.7167921693665, 'healthy'),
(21, -6.551128498934257, 106.71677086279423, 'healthy'),
(22, -6.550961941342141, 106.71676772011068, 'healthy'),
(23, -6.550997300556181, 106.71668947586411, 'potential'),
(24, -6.550587258567967, 106.71667123130982, 'healthy'),
(25, -6.55027690564139, 106.71643928583735, 'healthy'),
(26, -6.551214595917523, 106.71663243911811, 'healthy'),
(27, -6.551337876364036, 106.7165664256445, 'healthy'),
(28, -6.550624929175722, 106.71660118240392, 'healthy'),
(29, -6.551253180637073, 106.71670555593414, 'infected'),
(30, -6.550154601409648, 106.71669875894482, 'healthy'),
(31, -6.550334789173061, 106.71682078228132, 'healthy'),
(32, -6.551836827358567, 106.71658169933733, 'healthy'),
(33, -6.550332249054652, 106.71660579606, 'healthy'),
(34, -6.551962443125156, 106.71665371029668, 'healthy'),
(35, -6.551255549723687, 106.71656006209808, 'healthy'),
(36, -6.551503470913043, 106.71671436523329, 'healthy'),
(37, -6.550669279207024, 106.71683549360765, 'infected'),
(38, -6.551045788517456, 106.71646624245923, 'healthy'),
(39, -6.550414725194525, 106.71684210887872, 'healthy'),
(40, -6.550368742327481, 106.71646954222368, 'healthy'),
(41, -6.55117502804679, 106.71684681387742, 'healthy'),
(42, -6.5508844641816655, 106.7169166998284, 'healthy'),
(43, -6.550244858867672, 106.7167119334038, 'healthy'),
(44, -6.550799551400795, 106.71691407021892, 'healthy'),
(45, -6.551516769764245, 106.71693009051776, 'healthy'),
(46, -6.550878030774286, 106.71660883154122, 'healthy'),
(47, -6.551644515749797, 106.71699485706156, 'healthy'),
(48, -6.551043862560294, 106.7166189894584, 'healthy'),
(49, -6.551669550222464, 106.71672054735365, 'healthy'),
(50, -6.551677066859546, 106.7165748370727, 'infected'),
(51, -6.5507461345213365, 106.71652627269016, 'healthy'),
(52, -6.550832633685638, 106.7166807254662, 'healthy'),
(53, -6.551589343566721, 106.71657313357645, 'healthy'),
(54, -6.550756561874788, 106.71628185594136, 'healthy'),
(55, -6.551340432041839, 106.71670842745336, 'healthy'),
(56, -6.551381365759502, 106.71677874521367, 'healthy'),
(57, -6.550461389600753, 106.71646798751566, 'healthy'),
(58, -6.551835630329718, 106.71672649556896, 'healthy'),
(59, -6.5514211242824, 106.71671384973575, 'potential'),
(60, -6.5508340829635, 106.71653055009, 'healthy'),
(61, -6.551170405384974, 106.71655672996076, 'healthy'),
(62, -6.550970311128127, 106.71691980048848, 'healthy'),
(63, -6.550794992710291, 106.71660527269007, 'healthy'),
(64, -6.551501396730899, 106.71656838828156, 'healthy'),
(65, -6.5509243692212005, 106.7165353033393, 'healthy'),
(66, -6.551875867144893, 106.7166585606303, 'healthy'),
(67, -6.550873880631954, 106.71645419241403, 'healthy'),
(68, -6.550960820498225, 106.71661660021262, 'healthy'),
(69, -6.551166175172511, 106.7166991763724, 'healthy'),
(70, -6.551922431576003, 106.7165873723478, 'healthy'),
(71, -6.551712819471843, 106.71665519598996, 'potential'),
(72, -6.551606134631194, 106.7169306300562, 'potential'),
(73, -6.550636123882049, 106.716200739908, 'healthy'),
(74, -6.550121931103982, 106.71640109411834, 'healthy'),
(75, -6.551756600596756, 106.716576980424, 'healthy'),
(76, -6.550211674760871, 106.71663298708064, 'healthy'),
(77, -6.551546527013984, 106.71664293107996, 'healthy'),
(78, -6.551295988290989, 106.71677517831009, 'healthy'),
(79, -6.550629555992601, 106.71634271035606, 'healthy'),
(80, -6.550924962127513, 106.71684081243755, 'healthy'),
(81, -6.550521313258572, 106.71611590033962, 'healthy'),
(82, -6.550708877364112, 106.71674907650343, 'healthy'),
(83, -6.550354869315213, 106.7169006195286, 'healthy'),
(84, -6.551717495771758, 106.71679276055468, 'healthy'),
(85, -6.551794687820891, 106.7166587508957, 'healthy'),
(86, -6.551585334460171, 106.71671932367823, 'healthy'),
(87, -6.551462779930738, 106.7166414750997, 'healthy'),
(88, -6.551467446652119, 106.71678184667554, 'healthy'),
(89, -6.551131234907904, 106.71692853817818, 'infected'),
(90, -6.55100504867568, 106.71654446834206, 'healthy'),
(91, -6.55049672076358, 106.7163979306056, 'healthy'),
(92, -6.550674225618642, 106.7162782995487, 'healthy'),
(93, -6.5516276807401, 106.71665022634976, 'healthy'),
(94, -6.551398371655671, 106.71700500978538, 'healthy'),
(95, -6.55134415018646, 106.71685253856208, 'healthy'),
(96, -6.550713111556092, 106.71660546060996, 'healthy'),
(97, -6.550256028455687, 106.71679782223384, 'healthy'),
(98, -6.550716820151834, 106.71620499245802, 'healthy'),
(99, -6.551380659238869, 106.71664329964848, 'healthy'),
(100, -6.550748882601886, 106.71668043912764, 'healthy'),
(101, -6.551315348816163, 106.71699700630263, 'healthy'),
(102, -6.551220405037599, 106.71691761466344, 'healthy'),
(103, -6.55071741871823, 106.71691940359251, 'healthy'),
(104, -6.550541150051996, 106.71633539040266, 'healthy'),
(105, -6.551386726271965, 106.7169214583902, 'healthy'),
(106, -6.551042889922368, 106.71676659333582, 'healthy'),
(107, -6.5512613340781725, 106.71685248929536, 'healthy'),
(108, -6.551753049759179, 106.71672597925496, 'healthy'),
(109, -6.550852444352396, 106.71629200856422, 'healthy'),
(110, -6.550285215527314, 106.71688260303944, 'healthy'),
(111, -6.550589792683716, 106.71627216281183, 'healthy'),
(112, -6.55129644667164, 106.71664114030644, 'healthy'),
(113, -6.551419522776511, 106.71656647086805, 'healthy'),
(114, -6.550663076457427, 106.71652856193278, 'healthy'),
(115, -6.550215874494229, 106.71649942999656, 'healthy'),
(116, -6.551631171338824, 106.71679246535858, 'healthy'),
(117, -6.551590938516947, 106.7168592306371, 'infected'),
(118, -6.55083536011236, 106.71684120783948, 'healthy'),
(119, -6.551478163319711, 106.71700013629376, 'healthy'),
(120, -6.55062372263357, 106.71674878535988, 'healthy'),
(121, -6.55045324398092, 106.71631871514022, 'healthy'),
(122, -6.55055425710381, 106.71619671728776, 'healthy'),
(123, -6.550601060972914, 106.71612389243968, 'healthy'),
(124, -6.550711639910406, 106.716351646186, 'healthy'),
(125, -6.5510822222046325, 106.71655268566148, 'healthy'),
(126, -6.5505828560847945, 106.71652197170452, 'healthy'),
(127, -6.551304623992388, 106.71691790266232, 'healthy'),
(128, -6.550796114370584, 106.71675615861598, 'healthy'),
(129, -6.550438761536949, 106.71692804173034, 'healthy'),
(130, -6.550169351721231, 106.7165584541087, 'healthy'),
(131, -6.551273658723781, 106.71707943957372, 'healthy'),
(132, -6.5507694109967325, 106.71615019965483, 'healthy'),
(133, -6.551674229707727, 106.7168571762088, 'healthy'),
(134, -6.550298862181989, 106.71651772593628, 'healthy'),
(135, -6.551505067568563, 106.71686314765466, 'healthy'),
(136, -6.551372167307489, 106.71707416225031, 'healthy'),
(137, -6.550202500205319, 106.71685307955472, 'healthy'),
(138, -6.5502286780267145, 106.71692849304512, 'healthy'),
(139, -6.55067986172492, 106.71613515626932, 'healthy'),
(140, -6.551232542315127, 106.7169941499355, 'healthy'),
(141, -6.55034764320322, 106.71668772261664, 'healthy'),
(142, -6.550540733399477, 106.71659411072474, 'healthy'),
(143, -6.550131939869499, 106.71662125216116, 'healthy'),
(144, -6.5501866329694245, 106.71643055595514, 'healthy'),
(145, -6.550580873296513, 106.71682817356692, 'healthy'),
(146, -6.551050772618329, 106.71692428629248, 'healthy'),
(147, -6.550809876143319, 106.71622074962168, 'healthy'),
(148, -6.550311162299343, 106.71675192740982, 'healthy'),
(149, -6.551052028918379, 106.71662533337658, 'healthy');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `map_zones`
--
ALTER TABLE `map_zones`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `sensors`
--
ALTER TABLE `sensors`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `sensor_readings`
--
ALTER TABLE `sensor_readings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sensor_timestamp` (`sensor_id`,`timestamp` DESC);

--
-- Indeks untuk tabel `soil_data`
--
ALTER TABLE `soil_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_soil_data_sensors_idx` (`sensor_id`);

--
-- Indeks untuk tabel `trees`
--
ALTER TABLE `trees`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT untuk tabel `map_zones`
--
ALTER TABLE `map_zones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `sensors`
--
ALTER TABLE `sensors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `sensor_readings`
--
ALTER TABLE `sensor_readings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=245;

--
-- AUTO_INCREMENT untuk tabel `soil_data`
--
ALTER TABLE `soil_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=136;

--
-- AUTO_INCREMENT untuk tabel `trees`
--
ALTER TABLE `trees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `sensor_readings`
--
ALTER TABLE `sensor_readings`
  ADD CONSTRAINT `sensor_readings_ibfk_1` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`id`);

--
-- Ketidakleluasaan untuk tabel `soil_data`
--
ALTER TABLE `soil_data`
  ADD CONSTRAINT `fk_soil_data_sensors` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
