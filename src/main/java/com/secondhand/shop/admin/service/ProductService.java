package com.secondhand.shop.admin.service;

import com.secondhand.shop.admin.dto.ProductDTO;
import java.util.List;

public interface ProductService {

    List<ProductDTO> getAllProducts();

    ProductDTO getProductById(Long id);

    ProductDTO createProduct(ProductDTO productDTO);

    ProductDTO updateProduct(Long id, ProductDTO productDTO);

    void deleteProduct(Long id);

    List<ProductDTO> getProductsByCategory(Long categoryId);
    
    List<ProductDTO> searchProducts(String keyword);

    List<ProductDTO> getAvailableProducts();

    List<ProductDTO> getLatestProducts();

    void incrementViews(Long productId);
}