package com.secondhand.shop.user.dto;
import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String image;
    private String categoryName;
}