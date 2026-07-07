package com.gowrisankar.retailreporting.service.export.impl;

import com.gowrisankar.retailreporting.exception.ReportGenerationException;
import com.gowrisankar.retailreporting.service.export.ReportExportService;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

/**
 * Renders report data as CSV (Apache Commons CSV) or PDF (hand-built XHTML fed through
 * openhtmltopdf). PDF generation intentionally avoids a templating engine - openhtmltopdf
 * requires well-formed XHTML, and a small hand-rolled builder with explicit escaping is
 * easier to keep correct than relying on a template engine's HTML5 output being strict
 * XHTML (see docs/architecture.md Decision Log).
 */
@Service
public class ReportExportServiceImpl implements ReportExportService {

    private static final DateTimeFormatter GENERATED_AT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public byte[] toCsv(List<String> headers, List<List<String>> rows) {
        StringWriter writer = new StringWriter();
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader(headers.toArray(new String[0]))
                .build();

        try (CSVPrinter printer = new CSVPrinter(writer, format)) {
            for (List<String> row : rows) {
                printer.printRecord(row);
            }
            printer.flush();
        } catch (IOException ex) {
            throw new ReportGenerationException("Failed to generate CSV report", ex);
        }
        return writer.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] toPdf(String title, List<String> headers, List<List<String>> rows) {
        String html = buildHtml(title, headers, rows);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(outputStream);
            builder.run();
        } catch (Exception ex) {
            throw new ReportGenerationException("Failed to generate PDF report", ex);
        }
        return outputStream.toByteArray();
    }

    private String buildHtml(String title, List<String> headers, List<List<String>> rows) {
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<!DOCTYPE html>\n");
        sb.append("<html xmlns=\"http://www.w3.org/1999/xhtml\">\n<head>\n<meta charset=\"UTF-8\"/>\n");
        sb.append("<style>\n");
        sb.append("body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #1a1a1a; }\n");
        sb.append("h1 { font-size: 18px; margin-bottom: 4px; }\n");
        sb.append(".meta { color: #666; margin-bottom: 16px; }\n");
        sb.append("table { width: 100%; border-collapse: collapse; }\n");
        sb.append("th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }\n");
        sb.append("th { background-color: #2b2b2b; color: #ffffff; }\n");
        sb.append("tr:nth-child(even) { background-color: #f5f5f5; }\n");
        sb.append("</style>\n</head>\n<body>\n");
        sb.append("<h1>").append(escape(title)).append("</h1>\n");
        sb.append("<div class=\"meta\">Retail Reporting System &#8226; Generated ")
                .append(escape(LocalDateTime.now().format(GENERATED_AT_FORMAT)))
                .append("</div>\n");
        sb.append("<table>\n<thead>\n<tr>\n");
        for (String header : headers) {
            sb.append("<th>").append(escape(header)).append("</th>\n");
        }
        sb.append("</tr>\n</thead>\n<tbody>\n");
        for (List<String> row : rows) {
            sb.append("<tr>\n");
            for (String cell : row) {
                sb.append("<td>").append(escape(cell)).append("</td>\n");
            }
            sb.append("</tr>\n");
        }
        sb.append("</tbody>\n</table>\n</body>\n</html>");
        return sb.toString();
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
