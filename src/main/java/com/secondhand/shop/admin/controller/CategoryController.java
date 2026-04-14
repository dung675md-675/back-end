package com.secondhand.shop.admin.controller;

import com.secondhand.shop.admin.dto.CategoryDTO;
import com.secondhand.shop.admin.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//Cho phép class nhận HTTP request từ client.
//Tự động convert object Java thành JSON trả về.
@RequestMapping("/api/categories")
//Đặt base URL cho toàn bộ API trong controller này.
@RequiredArgsConstructor
//Tự động tạo constructor cho tất cả field:
@CrossOrigin(origins = "*")
//Cho phép frontend từ domain khác gọi API này.
public class CategoryController {
    
    //public CategoryController(CategoryService categoryService) {
    //this.categoryService = categoryService;}

    private final CategoryService categoryService;
    //Để dùng Dependency Injection gọn hơn, khỏi phải tự viết constructor.

    // GET: Lấy tất cả categories
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // GET: Lấy category theo ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        CategoryDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    // POST: Tạo mới category
    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO categoryDTO) {
        CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    // PUT: Cập nhật category
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO);
        return ResponseEntity.ok(updatedCategory);
    }

    // DELETE: Xóa category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // GET: Lấy categories đang active
    @GetMapping("/active")
    public ResponseEntity<List<CategoryDTO>> getActiveCategories() {
        List<CategoryDTO> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }
}