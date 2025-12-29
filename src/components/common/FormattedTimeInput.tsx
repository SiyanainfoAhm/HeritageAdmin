import React, { useRef } from 'react';
import { TextField, TextFieldProps, InputAdornment, IconButton, Box } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDisplayTime } from '@/utils/dateTime.utils';

interface FormattedTimeInputProps extends Omit<TextFieldProps, 'type' | 'value' | 'onChange'> {
  value: string; // HH:MM format (24-hour)
  onChange: (value: string) => void; // Returns HH:MM format (24-hour)
}

/**
 * Custom time input that displays times in 12-hour format (e.g., "2:30 PM")
 * while maintaining HH:MM value internally (24-hour format)
 */
const FormattedTimeInput: React.FC<FormattedTimeInputProps> = ({
  value,
  onChange,
  ...textFieldProps
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Format the display value to 12-hour format
  const displayValue = value ? formatDisplayTime(value) : '';

  const handleClick = () => {
    // Trigger the hidden time input's picker
    hiddenInputRef.current?.showPicker?.();
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <input
        ref={hiddenInputRef}
        type="time"
        value={value || ''}
        onChange={handleTimeChange}
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
        placeholder={textFieldProps.placeholder || 'hh:mm AM/PM'}
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
                <AccessTimeIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default FormattedTimeInput;

