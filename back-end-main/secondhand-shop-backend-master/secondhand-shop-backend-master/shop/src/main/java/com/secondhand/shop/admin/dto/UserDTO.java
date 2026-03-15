package com.secondhand.shop.admin.dto;

import com.secondhand.shop.common.model.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;
    private String username;
    private String password; // Only for creation, never return in response
    private String email;
    private String fullName;
    private String phone;
    private Long roleId;
    private String roleName;
    private String status;

    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .roleId(user.getRole().getId())
                .roleName(user.getRole().getName())
                .status(user.getStatus().name())
                .build();
    }
}