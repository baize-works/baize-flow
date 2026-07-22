-- Baize Flow MySQL database reset script
-- WARNING: this script deletes the entire Baize Flow database.
--
-- This script intentionally creates only an empty database. Do not add
-- CREATE TABLE, ALTER TABLE, or INSERT statements here; Flyway migration
-- scripts are the single source of truth for schema and seed data.

DROP DATABASE IF EXISTS `baize_flow`;

CREATE DATABASE `baize_flow`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
