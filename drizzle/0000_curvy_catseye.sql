CREATE TABLE `analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`user_email` text NOT NULL,
	`company` text NOT NULL,
	`role_id` text NOT NULL,
	`role_label` text NOT NULL,
	`score` integer NOT NULL,
	`resume_filename` text,
	`resume_object_key` text,
	`result_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analyses_user_created_at` ON `analyses` (`user_id`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
