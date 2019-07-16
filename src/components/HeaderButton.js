import React from 'react';
import { TouchableHighlight } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const HeaderButton = ({ underlayColor, onPress, name, style = {}, iconStyle = {} }) =>
	<TouchableHighlight
    underlayColor={underlayColor}
   	onPress={onPress}
    style={{ padding: 8, borderRadius: 32, ...style }}
  >
    <Icon name={name} style={{ fontSize: 28, ...iconStyle }} />
  </TouchableHighlight>;

export default HeaderButton;