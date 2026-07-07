package com.gowrisankar.retailreporting.controller;

import com.gowrisankar.retailreporting.dto.report.DashboardSummary;
import com.gowrisankar.retailreporting.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Available to every authenticated role, including VIEWER - this is the "at a glance"
 * KPI snapshot described in docs/requirements.md user stories. Backed by a 5-minute
 * Redis cache (see {@code CacheConfig}/{@code DashboardServiceImpl}).
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Cached KPI summary, available to all authenticated roles")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "KPI snapshot over the trailing N days (default 30)")
    public ResponseEntity<DashboardSummary> summary(@RequestParam(defaultValue = "30") int lookbackDays) {
        return ResponseEntity.ok(dashboardService.getSummary(lookbackDays));
    }
}
