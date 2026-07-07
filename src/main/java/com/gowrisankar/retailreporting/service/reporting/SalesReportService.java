package com.gowrisankar.retailreporting.service.reporting;

import com.gowrisankar.retailreporting.dto.report.ReportGranularity;
import com.gowrisankar.retailreporting.dto.report.RevenueTrendPoint;
import com.gowrisankar.retailreporting.dto.report.SalesSummary;
import com.gowrisankar.retailreporting.dto.report.TopProductPoint;
import java.time.LocalDateTime;
import java.util.List;

public interface SalesReportService {

    SalesSummary getSummary(LocalDateTime start, LocalDateTime end);

    List<RevenueTrendPoint> getRevenueTrend(LocalDateTime start, LocalDateTime end, ReportGranularity granularity);

    List<TopProductPoint> getTopProductsByQuantity(LocalDateTime start, LocalDateTime end, int limit);

    List<TopProductPoint> getTopProductsByRevenue(LocalDateTime start, LocalDateTime end, int limit);
}
