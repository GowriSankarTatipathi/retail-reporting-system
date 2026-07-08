import { TextField, type TextFieldProps } from '@mui/material';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

interface FormTextFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'name' | 'error'> {
  name: Path<T>;
  control: Control<T>;
}

/**
 * Wires an MUI TextField to react-hook-form via Controller, wiring up error
 * display from Zod's resolver automatically. Used by every form in the app
 * so validation error styling/messaging is consistent everywhere.
 */
export function FormTextField<T extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: FormTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...textFieldProps}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? textFieldProps.helperText}
          fullWidth
        />
      )}
    />
  );
}
