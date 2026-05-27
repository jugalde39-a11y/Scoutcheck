import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useA11y } from '../screens/A11yContext';

export default function SelectOption({ label, currentValue, onSelect, activeColor }) {
    const { theme } = useA11y();
    const isSelected = currentValue === label;
    
    // Si no se pasa un color activo, usa el secundario del tema por defecto
    const highlightColor = activeColor || theme.secondary;

    return (
        <TouchableOpacity 
            style={[
                styles.statusOption, 
                { backgroundColor: theme.card, borderColor: theme.border }, 
                isSelected && { backgroundColor: highlightColor, borderColor: highlightColor }
            ]}
            onPress={() => onSelect(label)}
        >
            <Text style={[
                styles.statusText, 
                { color: theme.textSub, fontFamily: theme.font }, 
                isSelected && { color: '#fff' }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    statusOption: {
        flex: 1, borderWidth: 1, paddingVertical: 14,
        borderRadius: 10, marginHorizontal: 3, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    statusText: { fontWeight: '600', fontSize: 14 }
});