package com.secondhand.shop.admin.controller;

import com.secondhand.shop.admin.dto.CustomerDTO;
import com.secondhand.shop.admin.service.CustomerService;
import com.secondhand.shop.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    // GET: Lấy tất cả customers
    @GetMapping
    public ResponseEntity<List<CustomerDTO>> getAllCustomers() {
        List<CustomerDTO> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    // GET: Lấy customer theo ID
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        CustomerDTO customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    // GET: Lấy customer theo User ID
    @GetMapping("/me")
    public ResponseEntity<CustomerDTO> getCurrentCustomer(Authentication authentication) {
        Long currentUserId = extractCurrentUserId(authentication);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        CustomerDTO customer = customerService.getCustomerByUserId(currentUserId);
        return ResponseEntity.ok(customer);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CustomerDTO> getCustomerByUserId(@PathVariable Long userId, Authentication authentication) {
        if (!canAccessCustomerByUserId(userId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        CustomerDTO customer = customerService.getCustomerByUserId(userId);
        return ResponseEntity.ok(customer);
    }

    // POST: Tạo customer mới với user đã tồn tại
    @PostMapping
    public ResponseEntity<CustomerDTO> createCustomer(@RequestBody CustomerDTO customerDTO) {
        CustomerDTO createdCustomer = customerService.createCustomerWithUser(
                customerDTO.getUserId(),
                customerDTO
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCustomer);
    }

    // PUT: Cập nhật customer
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(
            @PathVariable Long id,
            @RequestBody CustomerDTO customerDTO) {
        CustomerDTO updatedCustomer = customerService.updateCustomer(id, customerDTO);
        return ResponseEntity.ok(updatedCustomer);
    }

    // DELETE: Xóa customer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    private boolean canAccessCustomerByUserId(Long userId, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (isAdmin) {
            return true;
        }

        Long currentUserId = extractCurrentUserId(authentication);
        return currentUserId != null && userId.equals(currentUserId);
    }

    private Long extractCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.getUser().getId();
        }

        return null;
    }
}
