import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import C, {apply} from 'consistencss';
import {useStoreState} from 'easy-peasy';
import {t} from '../i18n';

const DrawerContent = ({addNewFile, onPress}) => {
  useStoreState((store) => store.preferences);
  const menuItems = [
    {key: 'JSand', label: t('code'), icon: 'code-tags'},
    {key: 'Files', label: t('files'), icon: 'file-document-box'},
    {
      key: 'JSand',
      label: t('new_file'),
      icon: 'file-document-edit',
      params: {code: ''},
      onPress: addNewFile,
    },
    {key: 'Settings', label: t('settings'), icon: 'settings'},
    {key: 'About', label: t('about'), icon: 'information'},
    {key: 'Help', label: t('help'), icon: 'lifebuoy'},
  ];
  return (
    <View>
      <Text
        style={apply(
          C.textTextcolor,
          C.bgPrimary,
          C.alignRight,
          C.elevation3,
          C.weightBold,
          C.h26,
          C.font6,
          C.py3,
          C.px4,
          {textAlignVertical: 'bottom'},
        )}
      >
        JS
      </Text>
      <View style={C.p4}>
        {menuItems.map((m, index) => (
          <TouchableOpacity
            testID={m.label}
            key={index}
            style={apply(C.h12, C.row)}
            onPress={() => (m.onPress && m.onPress(), onPress(m.key, m.params))}
          >
            <Icon
              name={m.icon}
              style={apply(C.font5, C.pr4, C.pt1, C.textTextcolor)}
            />
            <Text style={apply(C.font5, C.textTextcolor)}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default DrawerContent;
