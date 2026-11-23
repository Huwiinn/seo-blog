CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`category` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`content` text NOT NULL,
	`meta_title` text DEFAULT '' NOT NULL,
	`meta_description` text DEFAULT '' NOT NULL,
	`focus_keyword` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`cover_image` text,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published_at` integer,
	`modified_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_published_idx` ON `posts` (`status`,`published_at`);