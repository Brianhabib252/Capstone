CREATE TABLE Nutrition (
  id INT PRIMARY KEY,
  food VARCHAR(255),
  calorie INT,
  protein FLOAT,
  karbo FLOAT,
  fat FLOAT,
  fiber FLOAT
);
CREATE TABLE profil (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  height FLOAT NOT NULL,
  weight FLOAT NOT NULL,
  age INT NOT NULL,
  alergi VARCHAR(200)
);
