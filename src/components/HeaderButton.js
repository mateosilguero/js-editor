import React from 'react';
import {TouchableHighlight} from 'react-native';
import {useStoreState} from 'easy-peasy';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import C, {apply} from 'consistencss';

const HeaderButton = ({
  onPress,
  name,
  style = {},
  iconStyle = {},
  disabled,
  testID,
}) => {
  const {
    themeColors: {highlightColor},
  } = useStoreState((store) => store.preferences);
  return (
    <TouchableHighlight
      testID={testID}
      disabled={disabled}
      underlayColor={highlightColor}
      onPress={onPress}
      style={apply(C.p2, C.radius8, {...style})}
    >
      <Icon
        name={name}
        style={apply(C.font7, disabled ? C.textGrey : C.textTextcolor, {
          ...iconStyle,
        })}
      />
    </TouchableHighlight>
  );
};

export default HeaderButton;
