package com.gowrisankar.retailreporting.service.reporting;

import com.gowrisankar.retailreporting.dto.report.LowStockItem;
import java.util.List;

public interface InventoryReportService {

    List<LowStockItem> getLowStockItems();
}
