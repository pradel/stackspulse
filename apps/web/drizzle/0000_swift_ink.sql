CREATE TABLE `token` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`decimals` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`txId` text PRIMARY KEY NOT NULL,
	`protocol` text NOT NULL,
	`action` text NOT NULL,
	`blockHeight` blob NOT NULL,
	`timestamp` integer NOT NULL,
	`sender` text NOT NULL,
	`json` blob NOT NULL
);
