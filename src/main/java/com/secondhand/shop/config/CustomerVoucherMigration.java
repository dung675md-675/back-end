package com.secondhand.shop.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;

@Component
@RequiredArgsConstructor
public class CustomerVoucherMigration {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void migrateLegacyCouponAssignments() {
        try (Connection connection = dataSource.getConnection()) {
            if (!tableExists(connection, "coupon_assignments") || !tableExists(connection, "customer_voucher")) {
                return;
            }

            jdbcTemplate.update("""
                    INSERT INTO customer_voucher (coupon_id, customer_id, target_rank, assignment_type, created_at)
                    SELECT legacy.coupon_id, legacy.customer_id, legacy.target_rank, legacy.assignment_type, legacy.created_at
                    FROM coupon_assignments legacy
                    LEFT JOIN customer_voucher current_table
                        ON current_table.coupon_id = legacy.coupon_id
                        AND ((current_table.customer_id = legacy.customer_id)
                            OR (current_table.customer_id IS NULL AND legacy.customer_id IS NULL))
                        AND ((current_table.target_rank = legacy.target_rank)
                            OR (current_table.target_rank IS NULL AND legacy.target_rank IS NULL))
                        AND current_table.assignment_type = legacy.assignment_type
                    WHERE current_table.id IS NULL
                    """);
        } catch (Exception ignored) {
            // Keep startup resilient even if the legacy table does not exist yet.
        }
    }

    private boolean tableExists(Connection connection, String tableName) throws Exception {
        try (ResultSet resultSet = connection.getMetaData().getTables(connection.getCatalog(), null, tableName, new String[]{"TABLE"})) {
            if (resultSet.next()) {
                return true;
            }
        }

        try (ResultSet resultSet = connection.getMetaData().getTables(connection.getCatalog(), null, tableName.toUpperCase(), new String[]{"TABLE"})) {
            return resultSet.next();
        }
    }
}
