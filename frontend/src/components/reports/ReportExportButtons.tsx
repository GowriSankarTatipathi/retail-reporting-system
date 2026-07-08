import { useState } from 'react';
import { Button, Stack } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { useSnackbar } from 'notistack';
import { useExportReport } from '@/hooks/useReports';
import { toApiError } from '@/services/api';
import type { ExportFormat } from '@/types';

type ExportableReport = 'revenue-trend' | 'top-products' | 'top-customers' | 'low-stock';

interface ReportExportButtonsProps {
  report: ExportableReport;
  params: Record<string, string | number | undefined>;
  disabled?: boolean;
}

/**
 * CSV/PDF export controls shared by every report panel. Delegates to
 * GET /api/v1/reports/{report}?format=csv|pdf (see reportsApi.exportReport),
 * which triggers a real browser file download - no client-side CSV/PDF
 * generation, since the backend is the source of truth for report content.
 */
export function ReportExportButtons({ report, params, disabled }: ReportExportButtonsProps) {
  const { enqueueSnackbar } = useSnackbar();
  const exportReport = useExportReport();
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);
    try {
      await exportReport.mutateAsync({ report, format, params });
    } catch (error) {
      enqueueSnackbar(toApiError(error).message, { variant: 'error' });
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
        onClick={() => handleExport('csv')}
        loading={exportingFormat === 'csv'}
        disabled={disabled || exportingFormat !== null}
      >
        CSV
      </Button>
      <Button
        size="small"
        startIcon={<PictureAsPdfOutlinedIcon fontSize="small" />}
        onClick={() => handleExport('pdf')}
        loading={exportingFormat === 'pdf'}
        disabled={disabled || exportingFormat !== null}
      >
        PDF
      </Button>
    </Stack>
  );
}
