import React from 'react';
import { View } from 'react-native';
import HeaderButton from '../../components/HeaderButton';
import { t } from '../../i18n';

export default ({ navigation, navigationOptions, screenProps }) => ({
  title: t('saved_files'),
  headerRight: (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <HeaderButton
        onPress={navigation.getParam('newFile')}
        name="file-document-edit"
      />
      <HeaderButton
        onPress={navigation.getParam('newFolder')}
        name="folder-plus"
        style={{ marginRight: 8, marginLeft: 8 }}
      />
    </View>
  ),
  headerLeft: (
    <HeaderButton
      onPress={screenProps.openDrawer}
      name="menu"
      style={{ marginLeft: 8 }}
    />
  ),
  headerStyle: {
    ...navigationOptions.headerStyle,
    shadowOpacity: 0,
    shadowOffset: {
      height: 0
    },
    shadowRadius: 0,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    elevation: 0
  },
});