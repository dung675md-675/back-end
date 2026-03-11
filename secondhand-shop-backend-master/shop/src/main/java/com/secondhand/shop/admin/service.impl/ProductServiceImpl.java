package com.secondhand.shop.admin.service.impl;

import com.secondhand.shop.admin.dto.ProductDTO;
import com.secondhand.shop.common.model.Category;
import com.secondhand.shop.common.model.Product;
import com.secondhand.shop.common.repository.CategoryRepository;
import com.secondhand.shop.common.repository.ProductRepository;
import com.secondhand.shop.admin.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return ProductDTO.fromEntity(product);
    }

    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        // Validate category exists
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategoryId()));

        // ❌ BỎ SELLER VALIDATION

        Product product = Product.builder()
                .name(productDTO.getName())
                .description(productDTO.getDescription())
                .price(productDTO.getPrice())
                .originalPrice(productDTO.getOriginalPrice())
                .conditionStatus(productDTO.getConditionStatus() != null ?
                        Product.ProductCondition.valueOf(productDTO.getConditionStatus()) :
                        Product.ProductCondition.GOOD)
                .quantity(productDTO.getQuantity())
                .category(category)
                // ❌ BỎ SELLER
                .imageUrl(productDTO.getImageUrl())
                .status(productDTO.getStatus() != null ?
                        Product.ProductStatus.valueOf(productDTO.getStatus()) :
                        Product.ProductStatus.AVAILABLE)
                .views(0)
                .build();

        Product savedProduct = productRepository.save(product);
        return ProductDTO.fromEntity(savedProduct);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Update category if changed
        if (productDTO.getCategoryId() != null && !product.getCategory().getId().equals(productDTO.getCategoryId())) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setOriginalPrice(productDTO.getOriginalPrice());
        product.setQuantity(productDTO.getQuantity());
        product.setImageUrl(productDTO.getImageUrl());

        if (productDTO.getConditionStatus() != null) {
            product.setConditionStatus(Product.ProductCondition.valueOf(productDTO.getConditionStatus()));
        }
        if (productDTO.getStatus() != null) {
            product.setStatus(Product.ProductStatus.valueOf(productDTO.getStatus()));
        }

        Product updatedProduct = productRepository.save(product);
        return ProductDTO.fromEntity(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Soft delete
        productRepository.deleteById(id);

    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ❌ BỎ getProductsBySeller

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAvailableProducts() {
        return productRepository.findByStatus(Product.ProductStatus.AVAILABLE).stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getLatestProducts() {
        return productRepository.findLatestProducts(Product.ProductStatus.AVAILABLE).stream()
                .limit(10)
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void incrementViews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        product.setViews(product.getViews() + 1);
        productRepository.save(product);
    }
}