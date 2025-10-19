CREATE DATABASE IF NOT EXISTS `vehicle_service` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vehicle_service`;

CREATE TABLE IF NOT EXISTS `roles` (
  `role_key` VARCHAR(30) PRIMARY KEY,
  `display_name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `capabilities` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `roles` (`role_key`, `display_name`, `description`, `capabilities`) VALUES
  ('admin', 'Administrator', 'Full access to manage the Vehicle Service system.', JSON_ARRAY('manage_users', 'manage_services', 'view_reports', 'configure_system')),
  ('user', 'Service Staff', 'Handles daily service operations and scheduling.', JSON_ARRAY('create_service_order', 'update_service_order', 'view_vehicles')),
  ('vendor', 'Partner Vendor', 'Provides external maintenance or repair services.', JSON_ARRAY('view_assigned_orders', 'update_order_progress', 'upload_documents'))
ON DUPLICATE KEY UPDATE
  `display_name` = VALUES(`display_name`),
  `description` = VALUES(`description`),
  `capabilities` = VALUES(`capabilities`);

CREATE TABLE IF NOT EXISTS `factories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `location` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `divisions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `factory_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_factory_division` (`factory_id`, `name`),
  CONSTRAINT `fk_divisions_factory` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `factory_id` INT NOT NULL,
  `division_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_division_department` (`division_id`, `name`),
  CONSTRAINT `fk_departments_factory` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_departments_division` FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NULL,
  `role` VARCHAR(30) NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `factory_id` INT NULL,
  `department_id` INT NULL,
  `division_id` INT NULL,
  `last_login_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_users_factory` (`factory_id`),
  KEY `idx_users_department` (`department_id`),
  KEY `idx_users_division` (`division_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role`) REFERENCES `roles`(`role_key`),
  CONSTRAINT `fk_users_factory` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_division` FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `company_drivers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `photo_url` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `company_vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `registration` VARCHAR(50) NOT NULL,
  `vehicle_type` VARCHAR(50) NOT NULL,
  `photo_url` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_vehicle_registration` (`registration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`username`, `password_hash`, `email`, `role`, `status`)
VALUES ('gaservice', '$2b$10$R9ObxUutkMVUUG6qKIHAYuG5RZT0xG9WuWo9mhHd/95AJO1TW9Kg2', NULL, 'admin', 'active')
ON DUPLICATE KEY UPDATE
  `role` = VALUES(`role`),
  `status` = VALUES(`status`);

-- Booking system tables supporting company and rental flows
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `reference_code` VARCHAR(32) NOT NULL UNIQUE,
  `booking_type` ENUM('company', 'rental') NOT NULL,
  `requester_emp_no` VARCHAR(32) NOT NULL,
  `requester_name` VARCHAR(120) NOT NULL,
  `factory_id` INT NOT NULL,
  `division_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  `contact_phone` VARCHAR(32) NOT NULL,
  `contact_email` VARCHAR(160) NOT NULL,
  `cargo_details` TEXT NULL,
  `ga_driver_name` VARCHAR(120) NULL,
  `ga_driver_phone` VARCHAR(32) NULL,
  `ga_vehicle_id` INT NULL,
  `ga_vehicle_type` VARCHAR(80) NULL,
  `ga_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `ga_reject_reason` TEXT NULL,
  `created_by` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bookings_factory` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_division` FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_department` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_vehicle` FOREIGN KEY (`ga_vehicle_id`) REFERENCES `company_vehicles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `booking_points` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` BIGINT UNSIGNED NOT NULL,
  `point_type` ENUM('pickup', 'dropoff') NOT NULL,
  `sequence_no` INT UNSIGNED NOT NULL,
  `travel_date` DATE NULL,
  `depart_time` TIME NULL,
  `arrive_time` TIME NULL,
  `passenger_count` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `passenger_names` TEXT NULL,
  `location_name` VARCHAR(255) NOT NULL,
  `district` VARCHAR(120) NOT NULL,
  `province` VARCHAR(120) NOT NULL,
  `flight_number` VARCHAR(40) NULL,
  `flight_time` TIME NULL,
  `note_to_driver` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_booking_points_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_booking_point_order` (`booking_id`, `point_type`, `sequence_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `booking_files` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` BIGINT UNSIGNED NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `stored_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(120) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_booking_files_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `booking_notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` BIGINT UNSIGNED NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `notified_at` TIMESTAMP NULL,
  CONSTRAINT `fk_booking_notifications_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_booking_email` (`booking_id`, `email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `booking_history` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` BIGINT UNSIGNED NOT NULL,
  `actor` VARCHAR(120) NOT NULL,
  `action` VARCHAR(80) NOT NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_booking_history_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
