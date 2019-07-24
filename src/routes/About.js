import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Linking, TouchableOpacity } from 'react-native';
import HeaderButton from '../components/HeaderButton';
import { useStoreState } from 'easy-peasy';

const twitterColor = '#1DA1F2';

const Settings = ({ navigation, screenProps }) => {
  const { openDrawer } = screenProps;
  const { theme: { maincolor }, themeColors: { highlightColor } } = useStoreState(store => store);

  useEffect(() => {
    navigation.setParams({
      openDrawer,
      highlightColor
    });
  }, [highlightColor]);

  return (
    <View style={styles.container}>
      <Text style={styles.title(maincolor)}>
        Created by:
      </Text>
      <TouchableOpacity
        onPress={() => Linking.openURL('https://twitter.com/mateosilguero1')}
      >
        <Text style={styles.title(twitterColor)}>
          Mateo Silguero
        </Text>
      </TouchableOpacity>
      <Text style={styles.title(maincolor)}>
        v0.0.0
      </Text>
    </View>
  );
}

Settings.navigationOptions = ({ navigation }) => ({
  title: 'About',
  headerLeft: (
    <HeaderButton
      underlayColor={navigation.getParam('highlightColor')}
      onPress={navigation.getParam('openDrawer')}
      name="menu"
      style={{ marginLeft: 8 }}
    />
  )
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
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
  })
});

export default Settings;