import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useStoreState } from 'easy-peasy';

const SplashScreen = ({ navigation }) => {
	const {
    primary,
    maincolor
  } = useStoreState(store => store.theme);

  return (
	  <View
	  	style={styles.container(primary)}
	  >
	  	<Text
	  		style={styles.title(maincolor)}
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