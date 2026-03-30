package com.secondhand.shop.admin.dto;

import com.secondhand.shop.common.model.Category;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private String status;

    // Convert từ Entity sang DTO
    public static CategoryDTO fromEntity(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .status(category.getStatus().name())
                .build();
    }

    // Convert từ DTO sang Entity
    public Category toEntity() {
        return Category.builder()
                .id(this.id)
                .name(this.name)
                .description(this.description)
                .imageUrl(this.imageUrl)
                .status(this.status != null ?
                        Category.CategoryStatus.valueOf(this.status) :
                        Category.CategoryStatus.ACTIVE)
                .build();
    }
}