import { Box } from '@mui/material';
import { DateRange } from '@/services/reports.service';
import FormattedDateInput from '../common/FormattedDateInput';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onChange: (dateRange: DateRange) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, onChange }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <FormattedDateInput
        label="Start Date"
        value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
        onChange={(value) => {
          onChange({
            ...dateRange,
            startDate: value ? new Date(value) : null,
          });
        }}
        InputLabelProps={{
          shrink: true,
        }}
        size="small"
      />
      <FormattedDateInput
        label="End Date"
        value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
        onChange={(value) => {
          onChange({
            ...dateRange,
            endDate: value ? new Date(value) : null,
          });
        }}
        InputLabelProps={{
          shrink: true,
        }}
        size="small"
      />
    </Box>
  );
};

export default DateRangeFilter;

