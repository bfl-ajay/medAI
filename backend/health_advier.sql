-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: health_advier
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blood_pressure_records`
--

DROP TABLE IF EXISTS `blood_pressure_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blood_pressure_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `systolic` int NOT NULL,
  `diastolic` int NOT NULL,
  `pulse` int DEFAULT NULL,
  `recorded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `blood_pressure_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blood_pressure_records`
--

LOCK TABLES `blood_pressure_records` WRITE;
/*!40000 ALTER TABLE `blood_pressure_records` DISABLE KEYS */;
INSERT INTO `blood_pressure_records` VALUES (1,16,110,120,87,'2026-02-24 11:58:33'),(2,16,97,110,78,'2026-02-24 11:58:52'),(3,16,190,120,99,'2026-02-24 12:18:03'),(4,16,68,89,67,'2026-02-24 12:24:32'),(5,16,11,22,44,'2026-02-24 12:24:49'),(6,16,22,140,45,'2026-02-24 12:41:57'),(7,16,110,120,87,'2026-02-24 12:42:25'),(8,16,110,78,89,'2026-02-24 12:43:11'),(9,16,98,120,65,'2026-02-24 12:54:52'),(10,16,87,85,67,'2026-02-24 12:55:44'),(11,16,87,79,58,'2026-02-24 12:56:35'),(12,16,130,130,110,'2026-02-24 12:56:47'),(13,16,97,110,78,'2026-02-24 12:57:05'),(14,16,120,80,89,'2026-02-24 13:36:50'),(15,16,119,79,89,'2026-02-24 13:44:00'),(16,16,119,78,55,'2026-02-25 14:36:50'),(17,16,71,78,79,'2026-02-26 10:32:20'),(28,16,108,78,34,'2026-02-27 13:34:36'),(29,16,109,78,78,'2026-03-02 10:52:34'),(30,16,111,74,89,'2026-03-04 13:20:28'),(32,16,123,89,89,'2026-03-05 17:02:47'),(33,68,119,79,89,'2026-03-06 12:07:24'),(34,68,111,68,99,'2026-03-06 14:36:34'),(35,68,84,74,87,'2026-03-09 10:35:58'),(36,16,112,74,80,'2026-03-09 16:26:18'),(37,68,111,75,89,'2026-03-10 10:32:03'),(38,16,111,77,88,'2026-03-11 13:16:55'),(39,68,134,88,91,'2026-03-12 11:25:26'),(40,68,93,67,78,'2026-03-12 11:26:03'),(41,68,70,60,79,'2026-03-16 16:04:42');
/*!40000 ALTER TABLE `blood_pressure_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `contact` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (12,'Swati_1 Nugula','swatinugula56@gmail.com','HII, Final Test - 05','2026-03-17 05:24:26','09005073919'),(13,'Swati_1 Nugula','swatinugula56@gmail.com','Hi, Final Test - 06','2026-03-17 05:28:52','09005073919');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diseases`
--

DROP TABLE IF EXISTS `diseases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diseases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diseases`
--

LOCK TABLES `diseases` WRITE;
/*!40000 ALTER TABLE `diseases` DISABLE KEYS */;
INSERT INTO `diseases` VALUES (1,'Diabetes'),(2,'Hypertension'),(3,'Heart Disease'),(4,'Asthma'),(5,'Arthritis'),(6,'Thyroid'),(7,'Migraine'),(8,'PCOS'),(9,'Anemia'),(10,'Depression'),(11,'None');
/*!40000 ALTER TABLE `diseases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_reports`
--

DROP TABLE IF EXISTS `medical_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `medical_reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_reports`
--

LOCK TABLES `medical_reports` WRITE;
/*!40000 ALTER TABLE `medical_reports` DISABLE KEYS */;
INSERT INTO `medical_reports` VALUES (23,16,'Papa Report.pdf','1773395507815-Papa Report.pdf','2026-03-13 09:51:47'),(26,68,'Papa Report.pdf','1773637524245-Papa Report.pdf','2026-03-16 05:05:24'),(27,68,'1470185R0326OPCS45828.pdf','1773641518144-1470185R0326OPCS45828.pdf','2026-03-16 06:11:58'),(28,68,'1470185R0326OPCS45828 (3).pdf','1773652373329-1470185R0326OPCS45828 (3).pdf','2026-03-16 09:12:53'),(30,16,'1470185R0326OPCS45828.pdf','1773730131596-1470185R0326OPCS45828.pdf','2026-03-17 06:48:51');
/*!40000 ALTER TABLE `medical_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `doctor_name` varchar(255) DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (8,16,'prescription_Swati.png','1771849237582-prescription_Swati.png','2026-02-23 12:20:37',NULL,NULL),(9,16,'prescription_Test_1.png','1771930906380-prescription_Test_1.png','2026-02-24 11:01:46',NULL,NULL),(10,16,'prescription_Test_1.2.png','1771995516804-prescription_Test_1.2.png','2026-02-25 04:58:36',NULL,NULL),(11,16,'prescription_Test_1.3.png','1772009216419-prescription_Test_1.3.png','2026-02-25 08:46:56',NULL,NULL),(19,68,'prescription_Swati.png','1773120604937-prescription_Swati.png','2026-03-10 05:30:04',NULL,NULL),(20,68,'prescription_Test2.png','1773294406365-prescription_Test2.png','2026-03-12 05:46:46',NULL,NULL),(21,68,'prescription_Test_1.3.png','1773657237410-prescription_Test_1.3.png','2026-03-16 10:33:57',NULL,NULL),(22,68,'prescription_Test2.png','1773727104149-prescription_Test2.png','2026-03-17 05:58:24',NULL,NULL);
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reminders`
--

DROP TABLE IF EXISTS `reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `medicine_name` varchar(255) NOT NULL,
  `time` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `dosage` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reminders`
--

LOCK TABLES `reminders` WRITE;
/*!40000 ALTER TABLE `reminders` DISABLE KEYS */;
INSERT INTO `reminders` VALUES (424,68,'Insulin','08:30','2026-03-06 06:56:55',NULL),(429,68,'Metformin','08:00','2026-03-09 08:20:57',NULL),(439,16,'Lisinopril','08:00','2026-03-11 08:00:17',NULL),(441,16,'Ibuprofen','08:00','2026-03-11 08:01:47',NULL),(442,16,'Ibuprofen','13:00','2026-03-11 08:02:04',NULL),(443,16,'Ibuprofen','20:00','2026-03-11 08:02:28',NULL),(444,16,'Insulin','08:00','2026-03-11 08:06:05',NULL),(445,16,'Albuterol Inhaler','PRN','2026-03-11 08:10:47',NULL),(446,68,'Lisinopril','08:00','2026-03-17 06:19:08',NULL);
/*!40000 ALTER TABLE `reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_additional_info`
--

DROP TABLE IF EXISTS `user_additional_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_additional_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `allergies` text,
  `medical_notes` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_additional_info`
--

LOCK TABLES `user_additional_info` WRITE;
/*!40000 ALTER TABLE `user_additional_info` DISABLE KEYS */;
INSERT INTO `user_additional_info` VALUES (1,16,'8976567898','Test','Test!!!','2026-03-02 10:02:58','2026-02-23 07:58:42'),(8,18,'5678987654','None','Dont do anything physically heavy\n','2026-02-24 05:45:41','2026-02-24 05:45:34'),(9,64,'5678923478','Combileom','Test !!!','2026-02-27 06:10:37','2026-02-27 06:10:37'),(10,1,'Test1','Test','Test','2026-03-02 10:07:59','2026-03-02 10:07:59'),(11,1,'Test2','Test','Test','2026-03-02 10:08:04','2026-03-02 10:08:04'),(12,16,'4536373839','Insulin','Diabeties!!!','2026-03-02 10:11:51','2026-03-02 10:11:51'),(13,16,'7888888888','Test3','Tet3','2026-03-02 10:17:18','2026-03-02 10:17:18'),(14,16,'3456789876','Test_4','Test_4','2026-03-02 10:21:51','2026-03-02 10:21:51'),(15,16,'0000000000','Test5','tset5','2026-03-02 10:31:09','2026-03-02 10:31:09'),(16,68,'8888888888','Na','UUU','2026-03-06 11:01:03','2026-03-06 11:01:03'),(17,68,'9559689527','Combiflon','No','2026-03-06 11:12:33','2026-03-06 11:12:33'),(18,68,'9559689527','B12 tablets','Don\'t take it','2026-03-09 06:47:55','2026-03-09 06:47:55'),(20,16,'9999999999','NA','Alert Test','2026-03-11 07:34:50','2026-03-11 07:34:50'),(25,68,'2345678990','00uuu','nnn','2026-03-12 07:26:57','2026-03-12 07:26:57'),(26,68,'9850794720','Insulin','Never','2026-03-16 10:32:53','2026-03-16 10:32:53');
/*!40000 ALTER TABLE `user_additional_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_otp`
--

DROP TABLE IF EXISTS `user_otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_otp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `type` enum('login','email','phone','forgot') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_otp`
--

LOCK TABLES `user_otp` WRITE;
/*!40000 ALTER TABLE `user_otp` DISABLE KEYS */;
INSERT INTO `user_otp` VALUES (1,16,'431526','email',NULL,NULL,0,'2026-03-05 06:40:48'),(2,16,'809991','phone','9559689527',NULL,0,'2026-03-05 06:40:48'),(3,16,'423279','phone','9559689527',NULL,0,'2026-03-05 06:40:48'),(4,16,'396411','phone','9559689527',NULL,0,'2026-03-05 06:40:48'),(5,16,'245704','phone','9559689527',NULL,0,'2026-03-05 06:40:48'),(6,16,'475380','email',NULL,NULL,0,'2026-03-05 06:40:48'),(7,16,'474337','email',NULL,NULL,0,'2026-03-05 06:40:48'),(8,16,'160404','phone','9773456789',NULL,0,'2026-03-05 06:40:48'),(9,16,'996880','email',NULL,NULL,0,'2026-03-05 06:40:48'),(10,16,'387023','phone','4567898765',NULL,0,'2026-03-05 06:40:48'),(11,16,'956125','email',NULL,NULL,0,'2026-03-05 06:40:48'),(12,16,'714099','email',NULL,NULL,0,'2026-03-05 06:46:15'),(13,16,'487980','email',NULL,NULL,0,'2026-03-05 06:53:16'),(14,16,'881818','email',NULL,NULL,0,'2026-03-05 06:55:00'),(15,16,'849583','email',NULL,NULL,0,'2026-03-05 07:01:10'),(18,16,'876283','email',NULL,NULL,0,'2026-03-05 07:19:11'),(19,16,'130713','login',NULL,NULL,0,'2026-03-05 07:28:27'),(20,16,'487310','login',NULL,NULL,0,'2026-03-05 07:30:50'),(21,16,'492806','login',NULL,NULL,0,'2026-03-05 07:46:42'),(22,16,'252875','login',NULL,NULL,0,'2026-03-05 07:54:45'),(23,16,'548204','login',NULL,NULL,0,'2026-03-05 07:57:22'),(24,16,'561882','login',NULL,NULL,0,'2026-03-05 07:59:55'),(25,16,'582590','login',NULL,NULL,0,'2026-03-05 08:09:46'),(26,16,'203581','login',NULL,NULL,0,'2026-03-05 08:13:09'),(27,16,'398001','login',NULL,NULL,0,'2026-03-05 08:25:01'),(28,16,'882513','login',NULL,NULL,0,'2026-03-05 08:26:59'),(29,16,'400085','login',NULL,NULL,0,'2026-03-05 08:41:11'),(31,16,'716735','login',NULL,NULL,0,'2026-03-05 08:53:09'),(32,16,'856310','login',NULL,NULL,0,'2026-03-05 08:53:10'),(34,16,'177431','login',NULL,NULL,0,'2026-03-05 08:57:35'),(37,16,'745344','login',NULL,NULL,0,'2026-03-05 09:06:16'),(39,16,'789058','login',NULL,NULL,0,'2026-03-05 09:13:59'),(42,16,'361313','login',NULL,NULL,0,'2026-03-05 09:34:50'),(43,16,'620674','login',NULL,NULL,0,'2026-03-05 09:34:56'),(45,16,'114133','login',NULL,NULL,0,'2026-03-06 05:03:36'),(46,16,'216226','email',NULL,NULL,0,'2026-03-11 06:25:48'),(48,16,'335793','login',NULL,NULL,0,'2026-03-11 06:27:18'),(49,16,'997924','login',NULL,NULL,0,'2026-03-11 06:27:19'),(50,16,'517677','login',NULL,NULL,0,'2026-03-11 06:31:53'),(51,16,'749070','login',NULL,NULL,0,'2026-03-11 06:31:55'),(52,16,'798903','login',NULL,NULL,0,'2026-03-11 06:34:15'),(53,16,'684930','login',NULL,NULL,0,'2026-03-11 06:44:54'),(54,16,'799891','login',NULL,NULL,0,'2026-03-11 06:46:58'),(55,16,'212837','login',NULL,NULL,0,'2026-03-11 06:48:55'),(56,16,'591168','login',NULL,NULL,0,'2026-03-11 06:53:26'),(57,16,'432982','login',NULL,NULL,0,'2026-03-11 06:54:59'),(58,16,'775907','email',NULL,NULL,0,'2026-03-11 07:25:19'),(59,16,'443516','email',NULL,NULL,0,'2026-03-11 07:25:22'),(60,16,'261399','email',NULL,NULL,0,'2026-03-11 07:25:49'),(62,16,'735254','login',NULL,NULL,0,'2026-03-11 07:27:37'),(63,16,'497572','login',NULL,NULL,0,'2026-03-11 07:37:26'),(64,16,'546187','login',NULL,NULL,0,'2026-03-11 08:17:59'),(65,16,'977881','login',NULL,NULL,0,'2026-03-11 09:30:30'),(66,68,'339791','email',NULL,NULL,0,'2026-03-12 06:04:21'),(67,68,'165254','email',NULL,NULL,0,'2026-03-12 06:04:23'),(68,68,'234203','email',NULL,NULL,0,'2026-03-12 06:19:18'),(69,68,'975543','email',NULL,NULL,0,'2026-03-12 06:19:19'),(70,68,'933594','email',NULL,NULL,0,'2026-03-12 06:19:20'),(71,68,'560797','email',NULL,NULL,0,'2026-03-12 06:19:20'),(72,68,'724953','email',NULL,NULL,0,'2026-03-12 06:19:20'),(73,68,'179240','email',NULL,NULL,0,'2026-03-12 06:19:20'),(74,68,'647250','email',NULL,NULL,0,'2026-03-12 06:19:32'),(75,68,'978555','email',NULL,NULL,0,'2026-03-12 06:20:47'),(76,68,'662847','email',NULL,NULL,0,'2026-03-12 06:21:34'),(77,68,'681697','email',NULL,NULL,0,'2026-03-12 06:23:52'),(78,68,'319913','email',NULL,NULL,0,'2026-03-12 06:24:27'),(79,68,'181692','email',NULL,NULL,0,'2026-03-12 06:27:20'),(83,68,'126800','login',NULL,NULL,0,'2026-03-12 07:19:46'),(84,68,'591459','login',NULL,NULL,0,'2026-03-12 07:23:31'),(85,68,'468337','email',NULL,NULL,0,'2026-03-12 07:29:32'),(86,68,'997434','email',NULL,NULL,0,'2026-03-12 07:48:44'),(87,68,'913945','email',NULL,NULL,0,'2026-03-12 07:49:56'),(88,68,'897112','email',NULL,NULL,0,'2026-03-12 07:50:55'),(89,68,'728392','email',NULL,NULL,0,'2026-03-12 07:52:59'),(90,68,'469566','email',NULL,NULL,0,'2026-03-12 07:54:15'),(91,68,'782490','email',NULL,NULL,0,'2026-03-12 07:54:46'),(92,68,'168863','email',NULL,NULL,0,'2026-03-12 07:56:39'),(93,68,'898032','email',NULL,NULL,0,'2026-03-12 08:03:56'),(97,68,'112580','email',NULL,NULL,0,'2026-03-16 10:37:01'),(99,68,'259454','login',NULL,NULL,0,'2026-03-16 10:39:21'),(100,68,'687255','forgot',NULL,NULL,0,'2026-03-16 12:00:37'),(101,68,'782721','forgot',NULL,NULL,0,'2026-03-16 12:00:52'),(102,68,'488458','forgot',NULL,NULL,0,'2026-03-16 12:06:10'),(103,68,'790525','forgot',NULL,NULL,0,'2026-03-16 12:11:21');
/*!40000 ALTER TABLE `user_otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'user',
  `dob` date DEFAULT NULL,
  `height` float DEFAULT NULL,
  `weight` varchar(20) DEFAULT NULL,
  `bloodGroup` varchar(10) DEFAULT NULL,
  `Known_diseases` text,
  `mobile_no` varchar(20) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `two_factor_type` enum('none','email','phone') DEFAULT 'none',
  `email_verified` tinyint DEFAULT '0',
  `recovery_email` text,
  `is_active` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (16,'Swati','swatinugula56@gmail.com','$2b$10$2lQEXkgme.GAZ/guJNnwk.YRH/0pJ.SMtwLJX6HcHSTVBOyWvud/e','user','2004-11-11',163,'65','O+','[\"D64.9 - Anemia, unspecified\"]','9999999999','female','1772618158976-images.jpg',0,'email',0,'swati@gmail.com',1),(68,'Nanu','swatinugula445@gmail.com','$2b$10$KWSw3AfYa3UP/PQSUrc35.Ays1YCXtmd0OOc7nY5R5bzJlzzXjiRi','user','2004-11-22',162,'65','O+','[\"D64.9 - Anemia, unspecified\",\"E07.9 - Disorder of thyroid, unspecified\",\"Z83.3 - Family history of diabetes mellitus\"]','9559689527','female','1772787340593-images.jpg',0,'email',0,'swatinugula56@gmail.com',1),(71,'Test_1','test1@gmail.com','$2b$10$MDNsEdtiFv4.yTJXq3A0J.0ZpYz7P9uuA2tYTWvkcSmWDrGIwfQ0q','user','2003-11-26',179,'87','O+','[\"Maleria\"]','9005073919','female',NULL,0,'none',0,NULL,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-17 15:04:43
