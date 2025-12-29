import React, { useRef } from 'react';
import { TextField, TextFieldProps, InputAdornment, IconButton, Box } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { formatDisplayDate } from '@/utils/dateTime.utils';

interface FormattedDateInputProps extends Omit<TextFieldProps, 'type' | 'value' | 'onChange'> {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void; // Returns YYYY-MM-DD format
}

/**
 * Custom date input that displays dates in "dd Mon YYYY" format
 * while maintaining YYYY-MM-DD value internally
 */
const FormattedDateInput: React.FC<FormattedDateInputProps> = ({
  value,
  onChange,
  ...textFieldProps
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Format the display value
  const displayValue = value ? formatDisplayDate(value) : '';

  const handleClick = () => {
    // Trigger the hidden date input's picker
    hiddenInputRef.current?.showPicker?.();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <input
        ref={hiddenInputRef}
        type="date"
        value={value || ''}
        onChange={handleDateChange}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
        }}
      />
      <TextField
        {...textFieldProps}
        inputRef={textInputRef}
        type="text"
        value={displayValue}
        onClick={handleClick}
        onFocus={handleClick}
        placeholder={textFieldProps.placeholder || 'dd Mon yyyy'}
        InputProps={{
          ...textFieldProps.InputProps,
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={handleClick}
                size="small"
                sx={{ mr: -1 }}
              >
                <CalendarTodayIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default FormattedDateInput;

