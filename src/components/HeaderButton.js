import React from 'react';
import { TouchableHighlight } from 'react-native';
import { useStoreState } from 'easy-peasy';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const HeaderButton = ({ onPress, name, style = {}, iconStyle = {}, disabled, testID }) => {
  const {
    theme: { textcolor },
    themeColors: { highlightColor }
  } = useStoreState(store => store.preferences);
  return (
  	<TouchableHighlight
      testID={testID}
  		disabled={disabled}
      underlayColor={highlightColor}
     	onPress={onPress}
      style={{ padding: 8, borderRadius: 32, ...style }}
    >
      <Icon
      	name={name}
      	style={{
      		fontSize: 28,
      		color: disabled ? '#777' : textcolor,
      		...iconStyle
      	}}
      />
    </TouchableHighlight>
  )
};

export default HeaderButton;