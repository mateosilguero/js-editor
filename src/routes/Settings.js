import React, { useEffect } from 'react';
import { StyleSheet, View, Picker, Text, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import HeaderButton from '../components/HeaderButton';
import { useStoreState, useStoreActions } from 'easy-peasy';

const Settings = ({ navigation, screenProps }) => {
  const { openDrawer, themeOptions } = screenProps;
  const { theme, themeColors: { highlightColor, backgroundColor }, codeShortcuts } = useStoreState(store => store);
  const setTheme = useStoreActions(actions => actions.setTheme);

  useEffect(() => {
    navigation.setParams({
      openDrawer,
      highlightColor
    });
  }, [highlightColor]);

  return (
    <View style={styles.container}>
        <Text style={{
          ...styles.title,
          backgroundColor: theme.primary
        }}>
          Select your favorite theme:
        </Text>
        <Picker
          selectedValue={theme.selectedTheme}
          style={styles.picker}
          mode="dialog"
          onValueChange={(selectdValue, index) => {
            const { value, theme: t } = themeOptions[index];
            setTheme({ selectedTheme: value, highlighter: t });
          }}>
          {
            themeOptions.map((option, index) =>
              <Picker.Item
                key={index}
                label={option.value}
                value={option.value}
              />
            )
          }
        </Picker>
        <Text style={{ margin: 8 }}>
          Preview:
        </Text>
        <View
          style={{
            backgroundColor,
            padding: 8,
            paddingBottom: 16
          }}
        >
          <SyntaxHighlighter 
            language='javascript' 
            style={theme.styles}
            fontSize={16}
            highlighter={theme.highlighter}                
          >
            {`console.log("hello world");\nconst f = n => n+1;`}
          </SyntaxHighlighter>
        </View>
        {/*<Text style={{
          ...styles.title,
          backgroundColor: theme.primary
        }}>
          Shortcuts:
        </Text>*/}
    </View>
  );
}

Settings.navigationOptions = ({ navigation }) => ({
  title: 'Settings',
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
    textAlign: 'center'
  },
  title: {
    fontSize: 18,
    padding: 16,
    color: '#000'
  },
  picker: {
    height: 50,
    margin: 8
  }
});

export default Settings;