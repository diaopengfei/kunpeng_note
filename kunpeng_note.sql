/*
Navicat MySQL Data Transfer

Source Server         : Mysql_py
Source Server Version : 50720
Source Host           : localhost:3306
Source Database       : kunpeng_note

Target Server Type    : MYSQL
Target Server Version : 50720
File Encoding         : 65001

Date: 2018-06-26 09:25:14
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for dailytasks
-- ----------------------------
DROP TABLE IF EXISTS `dailytasks`;
CREATE TABLE `dailytasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(32) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` varchar(600) DEFAULT NULL,
  `finishtime` varchar(255) DEFAULT NULL,
  `state` int(1) NOT NULL,
  `importance` int(1) NOT NULL,
  `writetime` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for plans
-- ----------------------------
DROP TABLE IF EXISTS `plans`;
CREATE TABLE `plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(32) NOT NULL,
  `title` varchar(255) NOT NULL,
  `starttime` varchar(32) DEFAULT NULL,
  `finishtime` varchar(32) DEFAULT NULL,
  `importance` int(1) NOT NULL,
  `state` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for plan_tasks
-- ----------------------------
DROP TABLE IF EXISTS `plan_tasks`;
CREATE TABLE `plan_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) NOT NULL,
  `username` varchar(32) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` varchar(600) DEFAULT NULL,
  `starttime` varchar(32) DEFAULT NULL,
  `state` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(32) NOT NULL,
  `password` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
