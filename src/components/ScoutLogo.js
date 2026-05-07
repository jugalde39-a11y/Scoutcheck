import React from 'react';
import { Image, StyleSheet } from 'react-native';

const ScoutLogo = ({ size = 40, style }) => {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[
        styles.logo,
        { width: size, height: size, borderRadius: size / 2 },
        style
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    // Add default styles if needed, the size overrides handle the main dimensions
  },
});

export default ScoutLogo;
