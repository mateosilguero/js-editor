import React, { useEffect } from 'react';
import { StyleSheet, View, Picker, Text, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import HeaderButton from '../components/HeaderButton';
import { useStoreState, useStoreActions } from 'easy-peasy';

const Settings = ({ navigation, screenProps }) => {
  const { openDrawer } = screenProps;
  const { theme, themeColors: { highlightColor, backgroundColor } } = useStoreState(store => store);

  useEffect(() => {
    navigation.setParams({
      openDrawer,
      highlightColor
    });
  }, [highlightColor]);

  return (
    <View style={styles.container}>
        <Text style={styles.title}>
          Create new file:
        </Text>
        <Text style={styles.subtitle}>
          new file button
        </Text>
        <Text style={styles.title}>
          How import files ?
        </Text>
        <View
          style={{
            backgroundColor,
            padding: 8
          }}
        >
          <SyntaxHighlighter 
            language='javascript' 
            style={theme.styles}
            fontSize={16}
            highlighter={theme.highlighter}                
          >
            {`import "path/to/file.js";`}
          </SyntaxHighlighter>          
        </View>
        <Text style={styles.subtitle}>
          this action...
        </Text>
    </View>
  );
}

Settings.navigationOptions = ({ navigation }) => ({
  title: 'Help',
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
  title: {
    height: 48,
    elevation: 2,
    fontSize: 18,
    color: '#000',
    textAlignVertical: 'center'
  },
  subtitle: {
    fontSize: 18,
    paddingLeft: 8,
    marginBottom: 16
  }
});

export default Settings;