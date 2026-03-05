package com.secondhand.shop.user.controller;

import com.secondhand.shop.user.dto.AuthDTO;
import com.secondhand.shop.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth API is working!");
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {
        try {
            System.out.println("=== LOGIN REQUEST ===");
            System.out.println("Username: " + request.getUsername());

            AuthDTO.LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("Login error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO.RegisterRequest request) {
        try {
            System.out.println("=== REGISTER REQUEST ===");
            System.out.println("Username: " + request.getUsername());
            System.out.println("Email: " + request.getEmail());
            System.out.println("FullName: " + request.getFullName());

            AuthDTO.LoginResponse response = authService.register(request);

            System.out.println("=== REGISTER SUCCESS ===");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            System.err.println("=== REGISTER ERROR ===");
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            System.err.println("=== UNEXPECTED ERROR ===");
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}