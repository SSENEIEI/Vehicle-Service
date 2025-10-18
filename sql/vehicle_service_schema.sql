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

CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `factory_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_factory_department` (`factory_id`, `name`),
  CONSTRAINT `fk_departments_factory` FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `divisions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_department_division` (`department_id`, `name`),
  CONSTRAINT `fk_divisions_department` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
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

INSERT INTO `users` (`username`, `password_hash`, `email`, `role`, `status`)
VALUES ('gaservice', '$2b$10$R9ObxUutkMVUUG6qKIHAYuG5RZT0xG9WuWo9mhHd/95AJO1TW9Kg2', NULL, 'admin', 'active')
ON DUPLICATE KEY UPDATE
  `role` = VALUES(`role`),
  `status` = VALUES(`status`);
