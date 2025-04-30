CREATE DATABASE IF NOT EXISTS `proyecto_hospital` USE `proyecto_hospital`;

DROP TABLE IF EXISTS `evaluaciones`;

CREATE TABLE
  `evaluaciones` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nombre` varchar(255) NOT NULL,
    `episodio` int NOT NULL,
    `fecha` date NOT NULL,
    `categoria` varchar(50) NOT NULL,
    `psico` tinyint NOT NULL,
    `bio` tinyint NOT NULL,
    `social` tinyint NOT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

LOCK TABLES `evaluaciones` WRITE;

INSERT INTO
  `evaluaciones`
VALUES
  (
    1,
    'Steven Restrepo Torres',
    12345,
    '2025-04-01',
    'Biológico',
    2,
    6,
    3
  );

UNLOCK TABLES;