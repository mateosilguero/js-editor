import React from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import C, {apply} from 'consistencss';

const FabButton = ({
  onPress,
  name,
  style = {},
  iconStyle = {},
  disabled,
  testID,
}) => {
  return (
    <TouchableOpacity
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={apply(
        C.p2,
        C.radius8,
        C.bgPrimary,
        C.w14,
        C.h14,
        C.justifyCenter,
        C.itemsCenter,
        C.absolute,
        C.bottom16,
        C.right4,
        C.borderBlack,
        C.borderHairline,
        C.elevation3,
        {
          ...style,
        },
      )}
    >
      <Icon
        name={name}
        style={apply(C.font8, C.textTextcolor, {
          ...iconStyle,
        })}
      />
    </TouchableOpacity>
  );
};

export default FabButton;
