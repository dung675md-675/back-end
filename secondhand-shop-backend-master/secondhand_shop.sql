-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: secondhand_shop
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Điện thoại','Điện thoại di động cũ các loại','https://via.placeholder.com/300x200?text=Phone','ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47'),(2,'Laptop','Laptop, máy tính xách tay cũ','https://via.placeholder.com/300x200?text=Laptop','ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47'),(3,'Máy ảnh','Máy ảnh, ống kính cũ','https://via.placeholder.com/300x200?text=Camera','ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47'),(4,'Đồng hồ','Đồng hồ đeo tay cũ','https://via.placeholder.com/300x200?text=Watch','ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47'),(5,'Quần áo','Quần áo, thời trang cũ','https://via.placeholder.com/300x200?text=Fashion','ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47'),(6,'Sách','Sách cũ các loại','https://via.placeholder.com/300x200?text=Books','ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_orders` int DEFAULT '0',
  `total_spent` double DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,2,'123 Nguyễn Huệ','Hà Nội','Hoàn Kiếm','Hàng Bạc',5,15000000,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(2,3,'456 Lê Lợi','Hồ Chí Minh','Quận 1','Bến Nghé',3,8000000,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(3,4,'789 Trần Phú','Đà Nẵng','Hải Châu','Thạch Thang',10,37000000,'2026-01-27 14:30:47','2026-01-27 07:49:53'),(4,5,'321 Hai Bà Trưng','Hà Nội','Đống Đa','Cát Linh',7,18000000,'2026-01-27 14:30:47','2026-01-27 14:30:47');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `subtotal` double NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'iPhone 12 Pro Max 128GB',15000000,1,15000000,'2026-01-27 14:30:47'),(2,2,2,'MacBook Pro M1 2020',20000000,1,20000000,'2026-01-27 14:30:47'),(3,3,3,'Canon EOS 80D',12000000,1,12000000,'2026-01-27 14:30:47'),(4,4,4,'Apple Watch Series 6',6000000,1,6000000,'2026-01-27 14:30:47');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint NOT NULL,
  `total_amount` double NOT NULL,
  `discount_amount` double DEFAULT '0',
  `final_amount` double NOT NULL,
  `status` enum('PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `shipping_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `idx_orders_customer` (`customer_id`),
  KEY `idx_orders_status` (`status`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD20260101001',1,15000000,0,15000000,'DELIVERED','123 Nguyễn Huệ, Hoàn Kiếm, Hà Nội','0912345678','Giao hàng giờ hành chính','2026-01-27 14:30:47','2026-01-27 14:30:47'),(2,'ORD20260115002',2,20000000,1000000,19000000,'SHIPPING','456 Lê Lợi, Quận 1, TP.HCM','0923456789','Gọi trước khi giao','2026-01-27 14:30:47','2026-01-27 14:30:47'),(3,'ORD20260120003',3,12000000,0,12000000,'DELIVERED','789 Trần Phú, Hải Châu, Đà Nẵng','0934567890',NULL,'2026-01-27 14:30:47','2026-01-27 07:49:53'),(4,'ORD20260122004',4,6000000,500000,5500000,'CANCELLED','321 Hai Bà Trưng, Đống Đa, Hà Nội','0945678901','Kiểm tra kỹ hàng','2026-01-27 14:30:47','2026-01-27 07:44:43');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `payment_method` enum('COD','BANK_TRANSFER','MOMO','VNPAY') COLLATE utf8mb4_unicode_ci DEFAULT 'COD',
  `payment_status` enum('PENDING','PAID','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `amount` double NOT NULL,
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'BANK_TRANSFER','PAID',15000000,'TXN20260101001','2026-01-01 07:30:00','2026-01-27 14:30:47','2026-01-27 14:30:47'),(2,2,'MOMO','PAID',19000000,'MOMO20260115002','2026-01-15 03:15:00','2026-01-27 14:30:47','2026-01-27 14:30:47'),(3,3,'COD','PENDING',12000000,NULL,NULL,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(4,4,'VNPAY','PENDING',5500000,NULL,NULL,'2026-01-27 14:30:47','2026-01-27 14:30:47');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` double NOT NULL,
  `original_price` double DEFAULT NULL,
  `condition_status` enum('NEW','LIKE_NEW','GOOD','FAIR','POOR') COLLATE utf8mb4_unicode_ci DEFAULT 'GOOD',
  `quantity` int DEFAULT '1',
  `category_id` bigint NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('AVAILABLE','SOLD','RESERVED','DELETED') COLLATE utf8mb4_unicode_ci DEFAULT 'AVAILABLE',
  `views` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_status` (`status`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'iPhone 12 Pro Max 128GB','iPhone 12 Pro Max màu xanh dương, 128GB, 95% pin, không trầy xước',15000000,30000000,'LIKE_NEW',1,1,'https://via.placeholder.com/400x400?text=iPhone12ProMax','AVAILABLE',150,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(2,'MacBook Pro M1 2020','MacBook Pro M1 8GB/256GB, còn bảo hành 6 tháng',20000000,35000000,'GOOD',1,2,'https://via.placeholder.com/400x400?text=MacBookProM1','AVAILABLE',200,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(3,'Canon EOS 80D','Body Canon 80D, đi kèm lens 18-55mm, fullbox',12000000,25000000,'GOOD',1,3,'https://via.placeholder.com/400x400?text=Canon80D','AVAILABLE',80,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(4,'Apple Watch Series 6','Apple Watch Series 6 44mm, dây cao su đen',6000000,12000000,'LIKE_NEW',2,4,'https://via.placeholder.com/400x400?text=AppleWatch6','AVAILABLE',120,'2026-01-27 14:30:47','2026-01-27 07:44:43'),(5,'Samsung Galaxy S21 Ultra','Samsung S21 Ultra 256GB, màu đen, 90% pin',13000000,28000000,'GOOD',1,1,'https://via.placeholder.com/400x400?text=SamsungS21Ultra','AVAILABLE',95,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(6,'Dell XPS 13 9310','Dell XPS 13 i7 Gen 11, 16GB RAM, 512GB SSD',18000000,35000000,'LIKE_NEW',1,2,'https://via.placeholder.com/400x400?text=DellXPS13','AVAILABLE',110,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(7,'Sony A7 III Body','Sony A7 III body only, còn rất mới',25000000,45000000,'LIKE_NEW',1,3,'https://via.placeholder.com/400x400?text=SonyA7III','AVAILABLE',75,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(8,'Rolex Submariner Replica','Đồng hồ Rolex Submariner bản Replica cao cấp',3000000,5000000,'GOOD',1,4,'https://via.placeholder.com/400x400?text=RolexReplica','AVAILABLE',60,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(9,'Áo khoác North Face','Áo khoác North Face size M, còn mới 95%',1500000,4000000,'LIKE_NEW',2,5,'https://via.placeholder.com/400x400?text=NorthFace','AVAILABLE',45,'2026-01-27 14:30:47','2026-01-27 14:30:47'),(10,'Sách \"Sapiens\" tiếng Việt','Sách Sapiens - Lược sử loài người, bản tiếng Việt',150000,250000,'GOOD',3,6,'https://via.placeholder.com/400x400?text=Sapiens','AVAILABLE',30,'2026-01-27 14:30:47','2026-01-27 14:30:47');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Quản trị viên hệ thống','2026-01-27 14:30:47','2026-01-27 14:30:47'),(2,'SELLER','Người bán hàng','2026-01-27 14:30:47','2026-01-27 14:30:47'),(3,'CUSTOMER','Khách hàng','2026-01-27 14:30:47','2026-01-27 14:30:47');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` bigint NOT NULL,
  `status` enum('ACTIVE','INACTIVE','BLOCKED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role_id`),
  KEY `idx_users_status` (`status`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','admin@shop.com','Administrator','0901234567',1,'ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47'),(2,'seller1','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','seller1@shop.com','Nguyễn Văn A','0912345678',2,'ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47'),(3,'seller2','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','seller2@shop.com','Trần Thị B','0923456789',2,'ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47'),(4,'customer1','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','customer1@gmail.com','Lê Văn C','0934567890',3,'ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47'),(5,'customer2','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','customer2@gmail.com','Phạm Thị D','0945678901',3,'ACTIVE','2026-01-27 14:30:47','2026-01-27 14:30:47');
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

-- Dump completed on 2026-01-27 22:04:11
