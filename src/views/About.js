import React from 'react';
import { StyleSheet, View, Text, Linking, TouchableOpacity, Platform, Image } from 'react-native';
import HeaderButton from '../components/HeaderButton';
import { useStoreState } from 'easy-peasy';
import { t } from '../i18n';
import logo from '../assets/logo.png';

const twitterColor = '#1DA1F2';

const Settings = () => {
  const {
    textcolor
  } = useStoreState(store => store.preferences.theme);
   
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={logo}
      />
      <Text style={styles.title(textcolor)}>
        {t('created_by')}:
      </Text>
      <TouchableOpacity
        onPress={() => Linking.openURL('https://twitter.com/mateosilguero1')}
      >
        <Text style={styles.title(twitterColor)}>
          Mateo Silguero
        </Text>
      </TouchableOpacity>
      <Text style={styles.title(textcolor)}>
        Version: {Platform.OS === 'ios' ? '0.0.0' : '1.3.0'}
      </Text>
      <Text style={styles.title(textcolor)}>
        
      </Text>
    </View>
  );
}

Settings.navigationOptions = ({ screenProps }) => ({
  title: t('about'),
  headerLeft: (
    <HeaderButton
      onPress={screenProps.openDrawer}
      name="menu"
      style={{ marginLeft: 8 }}
    />
  )
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 16
  },
  title: (color) => ({
    height: 48,
    elevation: 2,
    fontSize: 18,
    paddingBottom: 16,
    color,
    textAlignVertical: 'center'
  }),
  image: {
    marginBottom: 24,
    width: 150,
    height: 150
  }
});

export default Settings;