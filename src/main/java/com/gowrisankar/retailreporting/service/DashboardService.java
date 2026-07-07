package com.gowrisankar.retailreporting.service;

import com.gowrisankar.retailreporting.dto.report.DashboardSummary;

public interface DashboardService {

    /** KPI snapshot over the trailing {@code lookbackDays} (e.g. 30). */
    DashboardSummary getSummary(int lookbackDays);
}
