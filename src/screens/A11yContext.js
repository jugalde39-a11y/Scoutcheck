import React, { createContext, useState, useContext } from 'react';
import { Platform } from 'react-native';

export const A11yContext = createContext();

export const A11yProvider = ({ children }) => {
    const [isHighContrast, setIsHighContrast] = useState(false);
    const [textScale, setTextScale] = useState(1);
    const [isDyslexiaMode, setIsDyslexiaMode] = useState(false);
    const [colorBlindMode, setColorBlindMode] = useState('none'); // none, protanopia, tritanopia

    // Paleta Base
    let primary = '#00264d';
    let secondary = '#4338ca';
    let success = '#10b981'; // Verde por defecto
    let danger = '#ef4444';  // Rojo por defecto
    let background = '#f7f9fc';
    let card = '#ffffff';
    let textMain = '#00264d';
    let textSub = '#5c738a';
    let border = '#e1e8f0';

    // Tema dinámico basado en estados de A11Y
    if (isHighContrast) {
        background = '#000000'; card = '#111111'; textMain = '#FFFF00';
        textSub = '#FFFFFF'; border = '#FFFF00'; primary = '#FFFF00';
        secondary = '#FFFF00'; success = '#FFFF00'; danger = '#FF3333';
    } else {
        if (colorBlindMode === 'protanopia') { // Daltónicos Rojo-Verde
            success = '#3b82f6'; // Reemplaza verde por azul vibrante
            danger = '#f59e0b';  // Reemplaza rojo por naranja/ámbar
        } else if (colorBlindMode === 'tritanopia') { // Daltónicos Azul-Amarillo
            primary = '#ef4444'; // Reemplaza azules por rojos
            success = '#06b6d4'; // Reemplaza verdes amarillentos por cian
        }
    }

    const theme = {
        bg: background, card, textMain, textSub, border,
        primary, secondary, success, danger,
        font: isDyslexiaMode ? (Platform.OS === 'ios' ? 'Trebuchet MS' : 'sans-serif-medium') : undefined,
    };

    return (
        <A11yContext.Provider value={{
            isHighContrast, setIsHighContrast,
            textScale, setTextScale,
            isDyslexiaMode, setIsDyslexiaMode,
            colorBlindMode, setColorBlindMode,
            theme
        }}>
            {children}
        </A11yContext.Provider>
    );
};

export const useA11y = () => useContext(A11yContext);