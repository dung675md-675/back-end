package com.secondhand.shop.common.repository;

import com.secondhand.shop.common.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByUserIdAndOrderIsNull(Long userId);
    void deleteByUserId(Long userId);
}