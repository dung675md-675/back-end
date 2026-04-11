package com.secondhand.shop;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.model.Role;
import com.secondhand.shop.common.model.User;
import com.secondhand.shop.common.repository.CustomerRepository;
import com.secondhand.shop.common.repository.RoleRepository;
import com.secondhand.shop.common.repository.UserRepository;
import com.secondhand.shop.user.dto.AuthDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        customerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registerShouldCreateCustomerAndReturnJwt() throws Exception {
        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest(
                "alice",
                "Password123",
                "alice@example.com",
                "Alice",
                "0123456789",
                "123 Test Street",
                "Hanoi",
                "Ba Dinh",
                "Ward 1");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        Long userId = body.get("userId").asLong();

        User savedUser = userRepository.findById(userId).orElseThrow();
        assertThat(savedUser.getPassword()).isNotEqualTo("Password123");
        assertThat(passwordEncoder.matches("Password123", savedUser.getPassword())).isTrue();
        assertThat(customerRepository.existsByUserId(userId)).isTrue();
    }

    @Test
    void loginShouldReturnJwtForExistingUser() throws Exception {
        User user = createCustomerUser("bob", "Password123", "bob@example.com");

        AuthDTO.LoginRequest request = new AuthDTO.LoginRequest(user.getUsername(), "Password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(user.getId()))
                .andExpect(jsonPath("$.username").value("bob"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void protectedEndpointShouldRequireJwtAndAllowAuthenticatedUser() throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "charlie",
                                  "password": "Password123",
                                  "email": "charlie@example.com",
                                  "fullName": "Charlie",
                                  "phone": "0999999999",
                                  "address": "456 Test Street",
                                  "city": "HCMC",
                                  "district": "District 1",
                                  "ward": "Ward 2"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode registerBody = objectMapper.readTree(registerResult.getResponse().getContentAsString());
        Long userId = registerBody.get("userId").asLong();
        String token = registerBody.get("token").asText();

        mockMvc.perform(get("/api/user/{id}", userId))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/user/{id}", userId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.username").value("charlie"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    private User createCustomerUser(String username, String rawPassword, String email) {
        Role customerRole = roleRepository.findByName("CUSTOMER").orElseThrow();

        User savedUser = userRepository.save(User.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .email(email)
                .fullName(username.toUpperCase())
                .phone("0123456789")
                .role(customerRole)
                .status(User.UserStatus.ACTIVE)
                .build());

        customerRepository.save(Customer.builder()
                .user(savedUser)
                .address("Test address")
                .city("Test city")
                .district("Test district")
                .ward("Test ward")
                .totalOrders(0)
                .totalSpent(0.0)
                .build());

        return savedUser;
    }
}
