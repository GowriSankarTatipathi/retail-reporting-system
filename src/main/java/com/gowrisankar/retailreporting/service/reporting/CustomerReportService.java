package com.gowrisankar.retailreporting.service.reporting;

import com.gowrisankar.retailreporting.dto.report.TopCustomerPoint;
import java.time.LocalDateTime;
import java.util.List;

public interface CustomerReportService {

    List<TopCustomerPoint> getTopCustomers(LocalDateTime start, LocalDateTime end, int limit);
}
