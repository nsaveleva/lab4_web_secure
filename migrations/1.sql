CREATE TABLE `users` (
  `user_id` CHAR(32) NOT NULL,
  `hash` CHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `rsa_keys` (
  `user_id` CHAR(32) NOT NULL,
  `private_key` TEXT NOT NULL,
  `public_key` TEXT NOT NULL,
  CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  UNIQUE KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8;

CREATE TABLE `passwords` (
  `user_id` CHAR(32) NOT NULL,
  `service` CHAR(255) NOT NULL,
  `login` CHAR(64) NOT NULL,
  `password` TEXT NOT NULL,
  CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  KEY (`login`),
  PRIMARY KEY (`service`, `login`)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8;