CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
);

CREATE TABLE `profil` (
  `userId` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `height` float NOT NULL,
  `weight` float NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL
)

CREATE TABLE Nutrition (
  id INT PRIMARY KEY,
  food VARCHAR(255),
  calorie INT,
  protein FLOAT,
  karbo FLOAT,
  fat FLOAT,
  fiber FLOAT
);

ALTER TABLE `profil`
  ADD KEY `id` (`userId`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`);

ALTER TABLE `profil`
  ADD CONSTRAINT `id` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
('0358d529-04fc-11ee-8ca6-7c57581dfbcf', 'udin1', 'udinajaib1@gmail.com', '$2b$10$DVJXP.93Es3Y.tkdPEFJOuOa9Kmp/AWZNcjRnBwqwYUaL3047lS3y'),
('2f000eef-0345-11ee-a245-7c57581dfbcf', 'udin', 'udina@gmail.com', '$2b$10$IRmlGs.kjUnR1r93FaR80.oNiMVgYc6nN3TiC/.y1h/51mgs1YrOe'),
('48b42d78-0345-11ee-a245-7c57581dfbcf', 'udin1', 'udinajaib@gmail.com', '$2b$10$ethdwTIbcpYzXRY0y429t.zhXOXnU7HkRdNSTMik01Twoyb7uG/aW');

INSERT INTO `profil` (`userId`, `name`, `height`, `weight`, `age`, `gender`) VALUES
('0358d529-04fc-11ee-8ca6-7c57581dfbcf', 'udin1', 180, 75, 30, 'Male'),
('2f000eef-0345-11ee-a245-7c57581dfbcf', 'udin', 160, 55, 35, 'Male');