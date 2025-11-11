import { Box, TextField } from '@mui/material';
import { DateRange } from '@/services/reports.service';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onChange: (dateRange: DateRange) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, onChange }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <TextField
        label="Start Date"
        type="date"
        value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          onChange({
            ...dateRange,
            startDate: e.target.value ? new Date(e.target.value) : null,
          });
        }}
        InputLabelProps={{
          shrink: true,
        }}
        size="small"
      />
      <TextField
        label="End Date"
        type="date"
        value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          onChange({
            ...dateRange,
            endDate: e.target.value ? new Date(e.target.value) : null,
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

