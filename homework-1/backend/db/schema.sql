CREATE DATABASE IF NOT EXISTS otus_social_network;
USE otus_social_network;
/*
 */
CREATE TABLE IF NOT EXISTS cities (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB;
/*
 */
CREATE TABLE IF NOT EXISTS interests (
    id INT NOT NULL AUTO_INCREMENT,
    value VARCHAR(20) NOT NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB;
/*
 */
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL DEFAULT "NONAME",
    last_name VARCHAR(255),
    gender ENUM('male', 'female'),
    birthday DATE,
    city INT,
    interests JSON,
    PRIMARY KEY (id),
    FOREIGN KEY (city) REFERENCES cities (id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
/*
 */
CREATE TABLE IF NOT EXISTS friendship (
    req_friend INT NOT NULL,
    acc_friend INT NOT NULL,
    accepted boolean NOT NULL DEFAULT FALSE,
    id BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (req_friend) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (acc_friend) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB;
/*
 */
DROP function IF EXISTS `unique_combination`;
CREATE FUNCTION `unique_combination` (b INT, a INT) RETURNS BIGINT DETERMINISTIC RETURN GREATEST(A, B) * (GREATEST(A, B) + 1) + LEAST(A, B);