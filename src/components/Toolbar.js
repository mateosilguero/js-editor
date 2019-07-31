import React from 'react';
import { View, StyleSheet } from 'react-native';

const Toolbar = ({ children, backgroundColor }) =>
	<View 
    style={styles.toolbar(backgroundColor)}
  >
    {children}
  </View>;

const styles = StyleSheet.create({
 	toolbar: (backgroundColor) => ({
    height: 48,
    elevation: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor
  })
});

export default Toolbar;