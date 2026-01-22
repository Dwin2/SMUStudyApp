import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { COLORS } from '../../constants';

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  multiline = false,
  numberOfLines = 1,
  style,
  autoFocus = false,
}) => {
  return (
    <PaperTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      label={label}
      mode="outlined"
      multiline={multiline}
      numberOfLines={numberOfLines}
      style={[styles.input, multiline && styles.multiline, style]}
      outlineColor={COLORS.border}
      activeOutlineColor={COLORS.primary}
      autoFocus={autoFocus}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.surface,
    marginVertical: 8,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
