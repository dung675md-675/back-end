package com.secondhand.shop.common.repository;

import com.secondhand.shop.common.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Tìm theo category
    List<Product> findByCategoryId(Long categoryId);


    // Tìm theo status
    List<Product> findByStatus(Product.ProductStatus status);

    // Tìm theo tên (search)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Tìm theo khoảng giá
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);

    // Tìm theo category và status
    List<Product> findByCategoryIdAndStatus(Long categoryId, Product.ProductStatus status);

    // Lấy sản phẩm mới nhất
    @Query("SELECT p FROM Product p WHERE p.status = :status ORDER BY p.createdAt DESC")
    List<Product> findLatestProducts(@Param("status") Product.ProductStatus status);

    // Lấy sản phẩm xem nhiều nhất
    @Query("SELECT p FROM Product p WHERE p.status = :status ORDER BY p.views DESC")
    List<Product> findMostViewedProducts(@Param("status") Product.ProductStatus status);
}