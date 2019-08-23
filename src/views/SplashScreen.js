import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useStoreState } from 'easy-peasy';
import logo from '../assets/logo.png';

const SplashScreen = () => {
	const {
    primary,
    textcolor
  } = useStoreState(store => store.preferences.theme);

  return (
	  <View
	  	style={styles.container(primary)}
	  >
      <Image        
        style={styles.image}
        source={logo}
      />
	  	<Text
	  		style={styles.title(textcolor)}
	  	>
	  		JSand
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
  	fontSize: 32,
  	fontWeight: 'bold',
  	color
  }),
  image: {
    marginBottom: 16,
    width: 180,
    height: 180
  }
});

export default SplashScreen;