package com.example.base.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/tables")
public class DatabaseTablesController {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseTablesController.class);

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<List<String>> getAllTables() {
        List<String> tables = new ArrayList<>();
        try (Connection conn = dataSource.getConnection()) {
            logger.info("Successfully connected to database");
            DatabaseMetaData metaData = conn.getMetaData();
            String catalog = conn.getCatalog();
            logger.info("Database catalog: {}", catalog);
            
            ResultSet rs = metaData.getTables(catalog, null, "%", new String[]{"TABLE"});
            while (rs.next()) {
                String tableName = rs.getString("TABLE_NAME");
                tables.add(tableName);
                logger.info("Found table: {}", tableName);
            }
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            logger.error("Error getting tables: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{tableName}")
    public ResponseEntity<List<Map<String, Object>>> getTableData(@PathVariable String tableName) {
        List<Map<String, Object>> data = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            
            logger.info("Attempting to fetch data for table: {}", tableName);
            String catalog = conn.getCatalog();
            logger.info("Database catalog: {}", catalog);
            
            // Get column names
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet columns = metaData.getColumns(catalog, null, tableName, null);
            List<String> columnNames = new ArrayList<>();
            while (columns.next()) {
                String columnName = columns.getString("COLUMN_NAME");
                columnNames.add(columnName);
                logger.info("Found column: {}", columnName);
            }

            // Get table data
            String query = "SELECT * FROM `" + tableName + "`";
            logger.info("Executing query: {}", query);
            ResultSet rs = stmt.executeQuery(query);
            
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (String columnName : columnNames) {
                    Object value = rs.getObject(columnName);
                    row.put(columnName, value);
                }
                data.add(row);
            }
            logger.info("Successfully fetched {} rows from table {}", data.size(), tableName);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            logger.error("Error getting data for table {}: {}", tableName, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 