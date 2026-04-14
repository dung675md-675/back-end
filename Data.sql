-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: secondhand_shop
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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_t8o6pivur7nn124jehx7cygw5` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'2026-04-14 07:31:00.903333','','https://hangthungnguyenkiencaocap.com/wp-content/uploads/2021/07/539343767ee48bbad2f5.jpg','Giày','ACTIVE','2026-04-14 07:31:00.903333'),(2,'2026-04-14 07:31:38.374630','','https://bizweb.dktcdn.net/thumb/1024x1024/100/399/392/products/h8-ak6-pp-web-thumbnails-11.jpg?v=1745308217517','Áo khoác','ACTIVE','2026-04-14 07:31:38.374630'),(3,'2026-04-14 07:32:27.762097','','https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSa1C6GcbOzCp4q-SdDH03y-IfzuYS7X3PXB_m1DhclkGBV0lggwz_fPmlloIUEpj4x2Vr6j9NL5Ha8diIWEUG2stjJv1ZGyJTlNG5-kSHd3r5tyeNlu39k56Bw&usqp=CAc','Quần','ACTIVE','2026-04-14 07:32:27.762097'),(4,'2026-04-14 07:33:10.456198','','https://static.tramdoc.vn/image/img.news/0/0/0/275.jpg?v=1&w=480&h=295&nocache=1','Sách','ACTIVE','2026-04-14 07:33:21.713422'),(5,'2026-04-14 07:34:05.323323','','https://cavathanquoc.com/wp-content/uploads/2024/06/Ao-thun-tron-cotton-mau-trang.jpg','Áo','ACTIVE','2026-04-14 07:34:05.323323');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `discount_percent` int NOT NULL,
  `discount_type` enum('PERCENT','FIXED_AMOUNT') NOT NULL,
  `expiry_date` datetime(6) DEFAULT NULL,
  `fixed_discount_amount` double DEFAULT NULL,
  `max_discount_amount` double NOT NULL,
  `min_order_amount` double DEFAULT NULL,
  `min_rank` enum('BRONZE','SILVER','GOLD','PLATINUM','DIAMOND') NOT NULL,
  `name` varchar(200) NOT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `total_quantity` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_eplt0kkm9yf2of2lnx6c1oy9b` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'VCT4','2026-04-14 07:44:56.266007',10,'PERCENT','2026-04-15 07:44:00.000000',0,0,100000,'BRONZE','Ưu đãi tháng 4','2026-04-14 07:44:00.000000','ACTIVE',5),(2,'BT4','2026-04-14 08:13:19.078543',0,'FIXED_AMOUNT','2026-04-15 08:13:00.000000',10000,10000,10000,'BRONZE','Ưu đãi Đồng trở lên','2026-04-14 08:12:00.000000','ACTIVE',3),(3,'ĐT4','2026-04-14 08:14:01.499221',10,'PERCENT','2026-04-15 08:13:00.000000',0,0,50000,'BRONZE','Đồng','2026-04-14 08:13:00.000000','ACTIVE',2);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_voucher`
--

DROP TABLE IF EXISTS `customer_voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_voucher` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_type` enum('LEVEL','CUSTOMER') NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `target_rank` enum('BRONZE','SILVER','GOLD','PLATINUM','DIAMOND','VIP_A','VIP_S','VIP_SS','VIP_SSS') DEFAULT NULL,
  `coupon_id` bigint NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKru593calo25kg15h33iwumi1m` (`coupon_id`),
  KEY `FK9kb5qbwm7iestct3x6fnd4e8m` (`customer_id`),
  CONSTRAINT `FK9kb5qbwm7iestct3x6fnd4e8m` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `FKru593calo25kg15h33iwumi1m` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_voucher`
--

LOCK TABLES `customer_voucher` WRITE;
/*!40000 ALTER TABLE `customer_voucher` DISABLE KEYS */;
INSERT INTO `customer_voucher` VALUES (1,'LEVEL','2026-04-14 07:44:56.275802','BRONZE',1,NULL),(2,'LEVEL','2026-04-14 07:44:56.283323','SILVER',1,NULL),(3,'LEVEL','2026-04-14 07:44:56.288444','GOLD',1,NULL),(4,'LEVEL','2026-04-14 07:44:56.289482','PLATINUM',1,NULL),(5,'LEVEL','2026-04-14 07:44:56.289482','DIAMOND',1,NULL),(6,'LEVEL','2026-04-14 07:44:56.289482','VIP_A',1,NULL),(7,'LEVEL','2026-04-14 07:44:56.308489','VIP_S',1,NULL),(8,'LEVEL','2026-04-14 07:44:56.310382','VIP_SS',1,NULL),(9,'LEVEL','2026-04-14 07:44:56.310382','VIP_SSS',1,NULL),(10,'LEVEL','2026-04-14 08:13:19.086161','BRONZE',2,NULL),(11,'LEVEL','2026-04-14 08:13:19.089884','SILVER',2,NULL),(12,'LEVEL','2026-04-14 08:13:19.092886','GOLD',2,NULL),(13,'LEVEL','2026-04-14 08:13:19.097279','PLATINUM',2,NULL),(14,'LEVEL','2026-04-14 08:13:19.101309','DIAMOND',2,NULL),(15,'LEVEL','2026-04-14 08:13:19.104951','VIP_A',2,NULL),(16,'LEVEL','2026-04-14 08:13:19.108064','VIP_S',2,NULL),(17,'LEVEL','2026-04-14 08:13:19.111146','VIP_SS',2,NULL),(18,'LEVEL','2026-04-14 08:13:19.114133','VIP_SSS',2,NULL),(19,'LEVEL','2026-04-14 08:14:01.504209','BRONZE',3,NULL),(20,'LEVEL','2026-04-14 08:14:01.508195','SILVER',3,NULL),(21,'LEVEL','2026-04-14 08:14:01.512183','GOLD',3,NULL),(22,'LEVEL','2026-04-14 08:14:01.518267','PLATINUM',3,NULL),(23,'LEVEL','2026-04-14 08:14:01.520317','DIAMOND',3,NULL),(24,'LEVEL','2026-04-14 08:14:01.524593','VIP_A',3,NULL),(25,'LEVEL','2026-04-14 08:14:01.531839','VIP_S',3,NULL),(26,'LEVEL','2026-04-14 08:14:01.533353','VIP_SS',3,NULL),(27,'LEVEL','2026-04-14 08:14:01.533353','VIP_SSS',3,NULL);
/*!40000 ALTER TABLE `customer_voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` text,
  `city` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `district` varchar(50) DEFAULT NULL,
  `total_orders` int DEFAULT NULL,
  `total_spent` double DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `ward` varchar(50) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_euat1oase6eqv195jvb71a93s` (`user_id`),
  CONSTRAINT `FKrh1g1a20omjmn6kurd35o3eit` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Yên Xá','Hà Nội','2026-04-14 07:45:26.562346','Thanh Trì',0,450000,'2026-04-14 07:46:43.746554','',2);
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
  `created_at` datetime(6) DEFAULT NULL,
  `price` double NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` double NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  KEY `FKocimc7dtr037rh4ls4l95nlfi` (`product_id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,'2026-04-14 07:46:20.518564',500000,'Giày adidas VL Court 3.0 \'Black White Gum\'',1,500000,NULL,1,3),(2,'2026-04-14 08:15:22.311965',500000,'Giày adidas VL Court 3.0 \'Black White Gum\'',1,500000,NULL,2,3);
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
  `address` varchar(255) DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `coupon_name` varchar(200) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `discount_amount` double DEFAULT NULL,
  `final_amount` double DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `note` text,
  `order_code` varchar(50) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `shipping_address` text,
  `shipping_phone` varchar(20) DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `total_amount` double NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `coupon_id` bigint DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_dhk2umg8ijjkg4njg6891trit` (`order_code`),
  KEY `FKn1d1gkxckw648m2n2d5gx0yx5` (`coupon_id`),
  KEY `FKpxtb8awmi0dk6smoh2vp1litg` (`customer_id`),
  CONSTRAINT `FKn1d1gkxckw648m2n2d5gx0yx5` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`),
  CONSTRAINT `FKpxtb8awmi0dk6smoh2vp1litg` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'3132, Xã Hương Lung, Huyện Cẩm Khê, Tỉnh Phú Thọ','VCT4','Ưu đãi tháng 4','2026-04-14 07:46:20.503868',50000,450000,'Duy Linh','Gọi sớm','ORD-3A87B23C','0868098812','3132, Xã Hương Lung, Huyện Cẩm Khê, Tỉnh Phú Thọ','0868098812','DELIVERED',500000,'2026-04-14 07:46:43.746554',2,1,1),(2,'Tổ 18, Xã Tam Thanh, Huyện Tân Sơn, Tỉnh Phú Thọ','ĐT4','Đồng','2026-04-14 08:15:22.306401',50000,450000,'Duy Linh','Giao sớm','ORD-141014F0','0868098812','Tổ 18, Xã Tam Thanh, Huyện Tân Sơn, Tỉnh Phú Thọ','0868098812','CANCELLED',500000,'2026-04-14 08:15:34.716957',2,3,1);
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
  `amount` double NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` enum('COD','BANK_TRANSFER','MOMO','VNPAY') DEFAULT NULL,
  `payment_status` enum('PENDING','PAID','FAILED','REFUNDED') DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_8vo36cen604as7etdfwmyjsxt` (`order_id`),
  CONSTRAINT `FK81gagumt0r8y3rmudcgpbk42l` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
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
  `condition_status` enum('NEW','LIKE_NEW','GOOD','FAIR','POOR') DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `original_price` double DEFAULT NULL,
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  `status` enum('AVAILABLE','SOLD','RESERVED','DELETED') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `views` int NOT NULL,
  `category_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`),
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'GOOD','2026-04-14 07:38:27.915033','Áo phông Celine ( size L )\nThiết kế tối giản nhưng đậm chất thời trang cao cấp, áo phông Celine mang đến vẻ ngoài thanh lịch và hiện đại cho người mặc. Sản phẩm được làm từ chất liệu cotton mềm mại, thoáng mát, thấm hút tốt, tạo cảm giác dễ chịu suốt cả ngày. Form áo unisex trẻ trung, dễ phối cùng quần jeans, chân váy hoặc quần short, phù hợp cho nhiều phong cách từ năng động đến sang trọng. Logo Celine nổi bật giúp tăng điểm nhấn thời thượng và khẳng định gu thẩm mỹ tinh tế.\n\nĐặc điểm nổi bật:\n\nChất liệu cotton cao cấp, mềm mại và thoáng khí\nThiết kế form rộng/unisex thời trang\nLogo Celine sang trọng, nổi bật\nDễ phối đồ cho nhiều phong cách khác nhau\nPhù hợp mặc đi chơi, dạo phố, du lịch hằng ngày','https://bizweb.dktcdn.net/100/106/923/products/2-51fe38f1-7a41-448a-8e77-1accd427f504.jpg?v=1720712533843','Áo phông Celine',NULL,1000000,1,'AVAILABLE','2026-04-14 08:14:26.164552',3,5),(2,'GOOD','2026-04-14 07:40:34.186479','Giày chạy bộ adidas Ultrarun 5 Nam - IE8792\nĐược thiết kế dành cho những người yêu thích vận động, adidas Ultrarun 5 mang đến sự kết hợp hoàn hảo giữa hiệu năng thể thao và phong cách hiện đại. Phần thân giày sử dụng chất liệu lưới thoáng khí giúp đôi chân luôn khô thoáng, trong khi đế đệm êm ái hỗ trợ hấp thụ lực tốt, tăng cảm giác thoải mái trong từng bước chạy. Thiết kế năng động cùng phối màu trẻ trung giúp sản phẩm phù hợp cả khi tập luyện lẫn sử dụng hằng ngày.\n\nĐặc điểm nổi bật:\n\nChất liệu upper lưới thoáng khí, nhẹ và ôm chân\nĐệm êm hỗ trợ giảm chấn khi chạy bộ hoặc vận động\nĐế cao su bền bỉ, tăng độ bám trên nhiều bề mặt\nThiết kế thể thao hiện đại, dễ phối đồ\nPhù hợp cho chạy bộ, tập gym và đi lại hằng ngày','https://bizweb.dktcdn.net/thumb/grande/100/340/361/products/ultrarun5runningshoesblueie879-0be54ecf-9f35-4f8a-958a-d391b4952dc0.jpg?v=1742786279653','Giày chạy bộ adidas Ultrarun 5 Nam',1200000,500000,5,'AVAILABLE','2026-04-14 08:14:26.130615',3,1),(3,'GOOD','2026-04-14 07:42:12.777432','Giày adidas VL Court 3.0 \'Black White Gum\'\nMang đậm phong cách streetwear cổ điển kết hợp nét hiện đại, adidas VL Court 3.0 ‘Black White Gum’ là lựa chọn lý tưởng cho những ai yêu thích sự đơn giản nhưng thời thượng. Thiết kế phối màu đen – trắng cùng đế gum nổi bật tạo điểm nhấn cá tính, dễ dàng phối với nhiều outfit khác nhau. Thân giày được hoàn thiện từ chất liệu bền đẹp, kết hợp lớp lót êm ái mang lại cảm giác thoải mái suốt ngày dài.\n\nĐặc điểm nổi bật:\n\nThiết kế cổ điển pha hiện đại, đậm chất streetwear\nPhối màu Black/White/Gum dễ phối đồ, không lỗi mốt\nChất liệu upper bền đẹp, giữ form tốt\nLớp lót và đế êm ái tạo cảm giác thoải mái khi mang\nPhù hợp đi học, đi chơi, dạo phố hằng ngày','https://sneakerdaily.vn/wp-content/uploads/2024/05/Giay-adidas-VL-Court-3.0-Black-White-Gum-ID6286-1.jpg','Giày adidas VL Court 3.0 \'Black White Gum\'',1200000,500000,4,'AVAILABLE','2026-04-14 08:15:34.716957',7,1),(4,'NEW','2026-04-14 07:43:42.612247','Áo Thun Local Brand Unisex Teelab Basic Tshirt\nMang phong cách tối giản hiện đại, Teelab Basic Tshirt là item basic không thể thiếu trong tủ đồ của mọi tín đồ thời trang. Thiết kế unisex trẻ trung cùng form áo rộng thoải mái giúp dễ dàng phù hợp với nhiều dáng người và phong cách khác nhau. Chất liệu cotton mềm mại, thoáng mát mang lại cảm giác dễ chịu khi mặc cả ngày, thích hợp cho cả đi học, đi chơi hay phối outfit streetwear hằng ngày.\nĐặc điểm nổi bật:\n\n\nThiết kế basic tối giản, dễ phối nhiều phong cách\n\n\nForm unisex trẻ trung, phù hợp nam và nữ\n\n\nChất liệu cotton mềm mại, thoáng khí, thấm hút tốt\n\n\nĐường may chắc chắn, giữ form đẹp sau nhiều lần giặt\n\n\nPhù hợp mặc đi học, đi chơi, dạo phố hằng ngày','https://bizweb.dktcdn.net/100/575/016/products/img15121.jpg?v=1773137249200','Áo Thun Local Brand Unisex Teelab Basic Tshirt',120000,120000,100,'AVAILABLE','2026-04-14 07:43:42.612247',0,5),(5,'LIKE_NEW','2026-04-14 07:57:27.102155','Áo Khoác Varsity Teelab Alter Oversize Dạ Phối Da Thêu Teddy Unisex AK143\nNổi bật với thiết kế varsity cá tính và form oversize thời thượng, Teelab Alter Varsity AK143 là item lý tưởng cho những outfit streetwear nổi bật mùa lạnh. Áo được kết hợp chất liệu dạ phối tay da sang trọng, tạo điểm nhấn bằng chi tiết thêu Teddy độc đáo, mang đến vẻ ngoài trẻ trung và năng động. Form unisex rộng rãi dễ mặc, vừa giữ ấm tốt vừa giúp bạn thể hiện phong cách riêng đầy ấn tượng.\n\nĐặc điểm nổi bật:\n\nThiết kế varsity oversize trendy, chuẩn phong cách streetwear\nChất liệu dạ phối da cao cấp, giữ ấm tốt\nHọa tiết thêu Teddy nổi bật, tăng điểm nhấn cá tính\nForm unisex rộng rãi, phù hợp cho cả nam và nữ\nDễ phối cùng jeans, jogger, chân váy hoặc sneaker','https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQx4eLpkXlMujT0Dhqd-TbY9ArPOF8qlNOOfcf4av5YJ_c2ke0MWkglHz-zwUMC5d5yzCXJn5dobOWwsuxZ58dWK9Zjvq_RvphMklKPru1u7B5nVj7ppoXivf2wyLV76WARzS1_oCc&usqp=CAc','Áo Khoác Varsity Teelab Alter Oversize Dạ Phối Da Thêu Teddy Unisex AK143',500000,400000,6,'AVAILABLE','2026-04-14 08:01:43.116372',1,2),(6,'GOOD','2026-04-14 07:59:05.380215','Áo Khoác Blouson Kéo Khóa\nMang phong cách hiện đại pha chút cổ điển, áo khoác blouson kéo khóa là item thời trang lý tưởng cho những ngày se lạnh. Thiết kế form rộng thoải mái cùng phần bo gấu đặc trưng giúp tạo nên vẻ ngoài trẻ trung, năng động và dễ phối đồ. Chất liệu bền đẹp kết hợp khóa kéo tiện lợi mang lại sự thoải mái khi mặc, phù hợp cho cả đi học, đi chơi hay dạo phố.\n\nĐặc điểm nổi bật:\n\nThiết kế blouson thời trang, trẻ trung và hiện đại\nForm rộng thoải mái, dễ mặc cho nhiều dáng người\nKhóa kéo tiện lợi, dễ sử dụng\nChất liệu bền đẹp, giữ form tốt\nDễ phối với áo thun, jeans, quần cargo hoặc sneaker','https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSkWu2FlTgKCWockqDMOL6MP8x4dBNlJLNGQ7qyQ7Gd7EdjMQvgvz5tGG447tJP4mCozro8oLyGezAv47giabdEI1rFKm-O6CHRdhYWbMiK4t51SufFHaZ3&usqp=CAc','Áo Khoác Blouson Kéo Khóa',649998,469000,4,'AVAILABLE','2026-04-14 07:59:05.380215',0,2),(7,'NEW','2026-04-14 08:01:25.033106','Quần Jeans Nam Họa Tiết Vảy Rồng Mỹ Ống Rộng Dáng Rộng\nNổi bật với thiết kế họa tiết vảy rồng cá tính đậm chất streetwear, mẫu quần jeans này mang đến phong cách mạnh mẽ và khác biệt cho người mặc. Form ống rộng thời thượng giúp tạo cảm giác thoải mái khi di chuyển, đồng thời dễ dàng phối cùng áo thun, hoodie hoặc sneaker để hoàn thiện outfit năng động. Chất liệu denim bền đẹp, đứng form tốt, phù hợp cho những ai yêu thích phong cách thời trang phá cách và nổi bật.\n\nĐặc điểm nổi bật:\n\nHọa tiết vảy rồng độc đáo, cá tính, thu hút\nForm ống rộng/dáng rộng chuẩn xu hướng streetwear\nChất liệu denim bền đẹp, giữ form tốt\nThoải mái khi mặc, dễ vận động\nDễ phối với nhiều item thời trang khác nhau','https://bizweb.dktcdn.net/100/502/737/products/o1cn01y9xydo1lbib72lkcs3354954-113f6f90-2c26-404f-a18d-63b3eccf8f9e.jpg?v=1754729438003','Quần jeans nam họa tiết vảy rồng Mỹ ống rộng dáng rộng',670000,499000,7,'AVAILABLE','2026-04-14 08:01:25.033106',0,3),(8,'GOOD','2026-04-14 08:04:04.365721','Quần Shorts Jeans Dáng Baggy\nThiết kế trẻ trung với form baggy thoải mái, quần shorts jeans là lựa chọn hoàn hảo cho những outfit năng động trong ngày hè. Chất liệu denim bền đẹp, đứng form tốt giúp tôn lên vẻ ngoài cá tính nhưng vẫn mang lại cảm giác dễ chịu khi mặc. Kiểu dáng basic dễ phối cùng áo thun, sơ mi hay sneaker, phù hợp cho nhiều phong cách từ casual đến streetwear.\n\nĐặc điểm nổi bật:\n\nForm baggy rộng rãi, thoải mái khi vận động\nChất liệu denim bền đẹp, giữ form tốt\nThiết kế trẻ trung, năng động, dễ phối đồ\nPhù hợp mặc đi học, đi chơi, dạo phố\nDễ kết hợp với nhiều phong cách thời trang khác nhau','https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQC0Svepfvo8iL5ae0b3ky1UFLJv-pimHb0nHPalnibiA7Tws_LXlg6LfL0pnkQOo1BE7TXX58hiKD5zYvE2arlTSpTUalAcaYsQi2d27jKnhgtoG6rLaHnc2Dz_8Usm2Ej0ao&usqp=CAc','Quần Shorts Jeans Dáng Baggy',588000,388000,3,'AVAILABLE','2026-04-14 08:16:39.030952',3,3),(9,'FAIR','2026-04-14 08:06:44.148006','Sách \"Kỷ Luật Bản Thân\"\nLà cuốn sách truyền cảm hứng giúp người đọc rèn luyện tư duy tích cực, xây dựng thói quen tốt và nâng cao khả năng kiểm soát bản thân trong cuộc sống hằng ngày. Nội dung sách tập trung vào việc hướng dẫn cách vượt qua sự trì hoãn, duy trì động lực và phát triển tính kỷ luật để đạt được mục tiêu cá nhân cũng như thành công lâu dài. Với lối viết dễ hiểu và nhiều bài học thực tiễn, đây là cuốn sách phù hợp cho những ai muốn hoàn thiện bản thân và nâng cao hiệu suất trong học tập, công việc.\n\nĐiểm nổi bật:\n\nTruyền cảm hứng xây dựng lối sống kỷ luật và tích cực\nCung cấp phương pháp hình thành thói quen hiệu quả\nHỗ trợ cải thiện tư duy, sự tập trung và tính kiên trì\nNội dung thực tế, dễ áp dụng vào cuộc sống\nPhù hợp cho học sinh, sinh viên và người đi làm','https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSnong2KrQc_sQwB9MG5vj4Yoxqd7K1R8ZEEW2QMPXKrYBfDkFuF79y6gI4AQ--rFD5tGHto3ernLMoMKGpITO1U0Mop1729Ut8AuX7-m8N7fdvvopom_SnqjbOL0uzAN_7Ekl5Jj0&usqp=CAc','Kỷ luật bản thân',149000,79000,5,'AVAILABLE','2026-04-14 08:06:44.148006',0,4),(10,'GOOD','2026-04-14 08:09:57.654645','Bộ sách Harry Potter trọn bộ gồm 7 tập đưa người đọc bước vào thế giới phép thuật đầy kỳ bí và hấp dẫn của cậu bé phù thủy Harry Potter cùng những người bạn tại trường Hogwarts. Với cốt truyện lôi cuốn, nhân vật sống động và thông điệp sâu sắc về tình bạn, lòng dũng cảm và sự trưởng thành, đây là bộ sách kinh điển được yêu thích trên toàn thế giới. Phiên bản bìa mềm đi kèm hộp đựng sang trọng giúp bảo quản sách tốt hơn và là lựa chọn tuyệt vời cho người sưu tầm hoặc làm quà tặng.\n\nĐặc điểm nổi bật:\n\nTrọn bộ đầy đủ 7 tập Harry Potter nổi tiếng\nPhiên bản bìa mềm nhẹ, dễ đọc và dễ bảo quản\nHộp đựng đẹp mắt, phù hợp sưu tầm/quà tặng\nNội dung hấp dẫn, phù hợp nhiều lứa tuổi\nTác phẩm kinh điển dành cho người yêu thích fantasy','https://i.ebayimg.com/images/g/5bcAAeSwqZhpkS6L/s-l1600.webp','Harry Potter Trọn Bộ Phiên Bản Bìa Mềm Hộp Đựng (Tập 1–7)',4500000,3599000,2,'AVAILABLE','2026-04-14 08:16:41.223711',2,4);
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
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ofx66keruapi6vyqpv6f2or37` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'2026-04-14 07:25:30.439589','Administrator','ADMIN','2026-04-14 07:25:30.439589'),(2,'2026-04-14 07:25:30.579615','Customer','CUSTOMER','2026-04-14 07:25:30.579615');
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
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','BLOCKED') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`),
  KEY `FKp56c1712k691lhsyewcssf40f` (`role_id`),
  CONSTRAINT `FKp56c1712k691lhsyewcssf40f` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-04-14 07:25:30.559238','admin@secondhandshop.local','System Administrator','$2a$10$BOJaTVPjel45L.Por02B8eXMCTgAnNH5bJqemFJ8LCUXor4cyuoqa','0123456789','ACTIVE','2026-04-14 07:48:05.442436','admin',1),(2,'2026-04-14 07:45:26.561957','dingpeo482005@gmail.com','Duy Linh','$2a$10$H83JjwKazJEdsuYqtg8zdOILVP6qr17lW6a6YP7C37gd6l1mlfdOG','0868098812','ACTIVE','2026-04-14 07:45:26.561957','dingpeo482005@gmail.com',2);
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

-- Dump completed on 2026-04-14 15:27:49
