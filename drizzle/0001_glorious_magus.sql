CREATE TABLE `site_settings_versions` (
	`revision` integer PRIMARY KEY NOT NULL,
	`config_json` text NOT NULL,
	`updated_by_user_id` text NOT NULL,
	`updated_by_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
