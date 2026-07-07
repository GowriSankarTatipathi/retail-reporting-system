package com.gowrisankar.retailreporting.controller;

import com.gowrisankar.retailreporting.dto.report.LowStockItem;
import com.gowrisankar.retailreporting.dto.report.ReportGranularity;
import com.gowrisankar.retailreporting.dto.report.RevenueTrendPoint;
import com.gowrisankar.retailreporting.dto.report.SalesSummary;
import com.gowrisankar.retailreporting.dto.report.TopCustomerPoint;
import com.gowrisankar.retailreporting.dto.report.TopProductPoint;
import com.gowrisankar.retailreporting.service.export.ReportExportService;
import com.gowrisankar.retailreporting.service.reporting.CustomerReportService;
import com.gowrisankar.retailreporting.service.reporting.InventoryReportService;
import com.gowrisankar.retailreporting.service.reporting.SalesReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * The reporting engine's HTTP surface. Every report endpoint accepts an optional
 * {@code format=csv|pdf} query parameter; omitting it returns JSON. Restricted to
 * ADMIN/MANAGER/ANALYST - VIEWER gets the dashboard KPI summary only (see
 * {@link DashboardController}), consistent with the role matrix in docs/requirements.md.
 */
@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Sales, inventory, and customer analytics with CSV/PDF export")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ANALYST')")
public class ReportController {

    private final SalesReportService salesReportService;
    private final InventoryReportService inventoryReportService;
    private final CustomerReportService customerReportService;
    private final ReportExportService exportService;

    public ReportController(SalesReportService salesReportService,
                             InventoryReportService inventoryReportService,
                             CustomerReportService customerReportService,
                             ReportExportService exportService) {
        this.salesReportService = salesReportService;
        this.inventoryReportService = inventoryReportService;
        this.customerReportService = customerReportService;
        this.exportService = exportService;
    }

    @GetMapping("/sales-summary")
    @Operation(summary = "Total revenue, order count, and average order value over a date range")
    public ResponseEntity<SalesSummary> salesSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(salesReportService.getSummary(start, end));
    }

    @GetMapping("/revenue-trend")
    @Operation(summary = "Revenue and order count bucketed by day or month")
    public ResponseEntity<?> revenueTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "MONTHLY") ReportGranularity granularity,
            @RequestParam(required = false) @Parameter(description = "csv or pdf; omit for JSON") String format) {
        List<RevenueTrendPoint> data = salesReportService.getRevenueTrend(start, end, granularity);
        if (format == null) {
            return ResponseEntity.ok(data);
        }
        List<String> headers = List.of("Period", "Revenue", "Order Count");
        List<List<String>> rows = data.stream()
                .map(p -> List.of(p.period(), p.revenue().toPlainString(), String.valueOf(p.orderCount())))
                .toList();
        return export("revenue-trend", "Revenue Trend Report", format, headers, rows);
    }

    @GetMapping("/top-products")
    @Operation(summary = "Top-selling products by quantity or revenue over a date range")
    public ResponseEntity<?> topProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "quantity") String sortBy,
            @RequestParam(required = false) String format) {
        List<TopProductPoint> data = "revenue".equalsIgnoreCase(sortBy)
                ? salesReportService.getTopProductsByRevenue(start, end, limit)
                : salesReportService.getTopProductsByQuantity(start, end, limit);
        if (format == null) {
            return ResponseEntity.ok(data);
        }
        List<String> headers = List.of("SKU", "Product Name", "Quantity Sold", "Revenue");
        List<List<String>> rows = data.stream()
                .map(p -> List.of(p.sku(), p.productName(), String.valueOf(p.quantitySold()), p.revenue().toPlainString()))
                .toList();
        return export("top-products", "Top-Selling Products Report", format, headers, rows);
    }

    @GetMapping("/top-customers")
    @Operation(summary = "Top customers by total spend over a date range")
    public ResponseEntity<?> topCustomers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String format) {
        List<TopCustomerPoint> data = customerReportService.getTopCustomers(start, end, limit);
        if (format == null) {
            return ResponseEntity.ok(data);
        }
        List<String> headers = List.of("Customer", "Email", "Total Spent", "Order Count");
        List<List<String>> rows = data.stream()
                .map(p -> List.of(p.customerName(), p.email(), p.totalSpent().toPlainString(), String.valueOf(p.orderCount())))
                .toList();
        return export("top-customers", "Top Customers Report", format, headers, rows);
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Products at or below their reorder level")
    public ResponseEntity<?> lowStock(@RequestParam(required = false) String format) {
        List<LowStockItem> data = inventoryReportService.getLowStockItems();
        if (format == null) {
            return ResponseEntity.ok(data);
        }
        List<String> headers = List.of("SKU", "Product Name", "Category", "On Hand", "Reorder Level", "Warehouse");
        List<List<String>> rows = data.stream()
                .map(i -> List.of(i.sku(), i.productName(), i.categoryName(),
                        String.valueOf(i.quantityOnHand()), String.valueOf(i.reorderLevel()),
                        i.warehouseLocation() == null ? "" : i.warehouseLocation()))
                .toList();
        return export("low-stock", "Low Stock Alert Report", format, headers, rows);
    }

    private ResponseEntity<byte[]> export(String filenamePrefix, String title, String format,
                                           List<String> headers, List<List<String>> rows) {
        byte[] content;
        MediaType mediaType;
        String extension;

        if ("csv".equalsIgnoreCase(format)) {
            content = exportService.toCsv(headers, rows);
            mediaType = MediaType.parseMediaType("text/csv");
            extension = "csv";
        } else if ("pdf".equalsIgnoreCase(format)) {
            content = exportService.toPdf(title, headers, rows);
            mediaType = MediaType.APPLICATION_PDF;
            extension = "pdf";
        } else {
            throw new IllegalArgumentException("Unsupported export format: " + format + " (expected 'csv' or 'pdf')");
        }

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentDisposition(ContentDisposition.attachment()
                .filename(filenamePrefix + "." + extension)
                .build());

        return ResponseEntity.ok()
                .headers(responseHeaders)
                .contentType(mediaType)
                .body(content);
    }
}
