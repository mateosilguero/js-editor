import React from 'react';
import { View } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import OptionsMenu from "react-native-options-menu";
import { t } from '../../i18n';
import HeaderButton from '../../components/HeaderButton';

export default ({ navigation, screenProps: { openDrawer } }) => {
  return ({
    title: 'JS',
    headerRight: (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <HeaderButton
          disabled={!navigation.getParam('isEditing')}
          onPress={navigation.getParam('comment')}
          name="format-quote-close"
          style={{ marginLeft: 8 }}
        />
        <HeaderButton
          disabled={
            !navigation.getParam('isEditing') ||
            !navigation.getParam('hasHistory')
          }
          onPress={navigation.getParam('undo')}
          name="undo"
          style={{ marginLeft: 8 }}
        />
        <OptionsMenu
          customButton={
            <Icon
              name="dots-vertical"
              size={28}
              style={{ margin: 8, color: navigation.getParam('textcolor') }}
            />
          }
          options={[
            t('run'),
            t('console'),
            t('save'),
            t('save_all')
          ]}
          actions={[
            navigation.getParam('exec'),
            () => navigation.push('Console'),
            navigation.getParam('save'),
            navigation.getParam('saveAll')            
          ]}/>
      </View>
    ),
    headerLeft: (
      <HeaderButton
        onPress={openDrawer}
        name="menu"
        style={{ marginLeft: 8 }}
      />
    )
  });
}