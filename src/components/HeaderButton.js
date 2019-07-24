import React from 'react';
import { TouchableHighlight } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const HeaderButton = ({ underlayColor, onPress, name, style = {}, iconStyle = {}, disabled }) =>
	<TouchableHighlight
		disabled={disabled}
    underlayColor={underlayColor}
   	onPress={onPress}
    style={{ padding: 8, borderRadius: 32, ...style }}
  >
    <Icon
    	name={name}
    	style={{
    		fontSize: 28,
    		color: disabled ? '#777' : '#222',
    		...iconStyle
    	}}
    />
  </TouchableHighlight>;

export default HeaderButton;