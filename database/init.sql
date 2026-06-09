CREATE DATABASE IF NOT EXISTS tcm_platform;
USE tcm_platform;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `password` varchar(255) NOT NULL COMMENT '密码哈希',
  `address` varchar(255) DEFAULT NULL COMMENT '常用地址',
  `role` varchar(10) DEFAULT 'user' COMMENT '角色: user/admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `type` enum('article','herb') NOT NULL COMMENT '分类类型',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for tcm_articles
-- ----------------------------
DROP TABLE IF EXISTS `tcm_articles`;
CREATE TABLE `tcm_articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '标题',
  `thumbnail` text DEFAULT NULL COMMENT '缩略图URL',
  `summary` varchar(500) DEFAULT NULL COMMENT '简介',
  `content` text NOT NULL COMMENT '详细内容',
  `source` varchar(100) DEFAULT '原创' COMMENT '来源',
  `category_id` int NOT NULL COMMENT '分类ID',
  `author_id` int DEFAULT NULL COMMENT '作者ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_title` (`title`),
  CONSTRAINT `fk_article_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for herbs
-- ----------------------------
DROP TABLE IF EXISTS `herbs`;
CREATE TABLE `herbs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '中药名',
  `alias` varchar(255) DEFAULT NULL COMMENT '别名',
  `image` text DEFAULT NULL COMMENT '图片URL',
  `summary` varchar(500) DEFAULT NULL COMMENT '简介',
  `source` varchar(100) DEFAULT '原创' COMMENT '来源',
  `efficacy` text COMMENT '功效主治',
  `pharmacology` text COMMENT '药理作用',
  `category_id` int DEFAULT NULL COMMENT '分类ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  CONSTRAINT `fk_herb_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- Table structure for herb_favorites
-- ----------------------------
DROP TABLE IF EXISTS `herb_favorites`;
CREATE TABLE `herb_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `herb_id` int NOT NULL COMMENT '中药ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_herb` (`user_id`, `herb_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorite_herb` FOREIGN KEY (`herb_id`) REFERENCES `herbs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Seeding Data
-- ----------------------------

-- Users (password: 123456)
INSERT INTO `users` (`username`, `email`, `password`, `address`, `role`) VALUES
('admin', 'admin@example.com', '$2y$10$LUF8m0F6JWrhY0.bp9T2.eXFa0VtRMs1aqDNRFxIsqiL4i/3YLlZ.', '系统管理员地址', 'admin'),
('user01', 'user01@example.com', '$2y$10$LUF8m0F6JWrhY0.bp9T2.eXFa0VtRMs1aqDNRFxIsqiL4i/3YLlZ.', '北京市朝阳区', 'user'),
('user02', 'user02@example.com', '$2y$10$LUF8m0F6JWrhY0.bp9T2.eXFa0VtRMs1aqDNRFxIsqiL4i/3YLlZ.', '上海市浦东新区', 'user');

-- Categories (Article)
INSERT INTO `categories` (`name`, `type`) VALUES
('养生保健', 'article'),
('中医理论', 'article'),
('经络穴位', 'article'),
('食疗药膳', 'article'),
('名医医案', 'article');

-- Categories (Herb)
INSERT INTO `categories` (`name`, `type`) VALUES
('解表药', 'herb'),
('清热药', 'herb'),
('补益药', 'herb'),
('理气药', 'herb'),
('止血药', 'herb');

-- TCM Articles
INSERT INTO `tcm_articles` (`title`, `thumbnail`, `summary`, `content`, `source`, `category_id`, `author_id`) VALUES
('什么是“气虚”？如何调理？', 'https://miaobi-lite.bj.bcebos.com/miaobi/5mao/b%275Yas5aSp6LWW5bqK5piv5q2j5bi455qE5ZCXXzE3MzY4ODAzMTguNzE1MTkwMg%3D%3D%27/0.png', '气虚是指元气不足，脏腑功能减退，出现少气懒言、乏力自汗等症状。', '<p>气虚体质的特征与调理方案...</p>', '名医讲堂', 2, 1);
-- (为了演示效果，实际应添加更多数据，这里先添加5条示例)

-- Herbs
INSERT INTO `herbs` (`name`, `alias`, `image`, `efficacy`, `pharmacology`, `category_id`) VALUES
('人参', '黄参、血参', 'https://pic.rmb.bdstatic.com/bjh/3f114d884757/251002/7deba494d0595bc8d2255d3c6c802628.jpeg', '大补元气，复脉固脱，补脾益肺，生津养血，安神益智。', '含有人参皂苷等活性成分，具有抗疲劳、调节免疫、保护心血管等作用。', 8)

