CREATE TABLE `users` (
  `user_id` CHAR(32) NOT NULL,
  `hash` CHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
