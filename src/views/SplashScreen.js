import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useStoreState } from 'easy-peasy';

const SplashScreen = () => {
	const {
    primary,
    textcolor
  } = useStoreState(store => store.preferences.theme);

  return (
	  <View
	  	style={styles.container(primary)}
	  >
	  	<Text
	  		style={styles.title(textcolor)}
	  	>
	  		JS
	  	</Text>
	  </View>
	);
}

SplashScreen.navigationOptions = {
	header: null
};

const styles = StyleSheet.create({
  container: (backgroundColor) => ({
  	flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor
  }),
  title: (color) => ({
  	fontSize: 48,
  	fontWeight: 'bold',
  	color
  })
});

export default SplashScreen;