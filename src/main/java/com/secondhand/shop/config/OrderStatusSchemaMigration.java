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
public class OrderStatusSchemaMigration {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureOrderStatusColumnSupportsNewValues() {
        try (Connection connection = dataSource.getConnection()) {
            String databaseProduct = connection.getMetaData().getDatabaseProductName();
            if (databaseProduct == null || !databaseProduct.toLowerCase().contains("mysql")) {
                return;
            }

            if (!tableExists(connection, "orders")) {
                return;
            }

            ColumnTypeInfo columnTypeInfo = jdbcTemplate.query(
                    """
                    SELECT DATA_TYPE, COLUMN_TYPE, IS_NULLABLE
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'orders'
                      AND COLUMN_NAME = 'status'
                    """,
                    rs -> rs.next()
                            ? new ColumnTypeInfo(
                                    rs.getString("DATA_TYPE"),
                                    rs.getString("COLUMN_TYPE"),
                                    rs.getString("IS_NULLABLE")
                            )
                            : null
            );

            if (columnTypeInfo == null) {
                return;
            }

            if ("enum".equalsIgnoreCase(columnTypeInfo.dataType())) {
                String nullClause = "NO".equalsIgnoreCase(columnTypeInfo.isNullable()) ? "NOT NULL" : "NULL";
                jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(30) " + nullClause);
            }
        } catch (Exception ignored) {
            // Keep startup resilient if schema introspection fails.
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

    private record ColumnTypeInfo(String dataType, String columnType, String isNullable) {
    }
}
