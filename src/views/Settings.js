import React from 'react';
import { StyleSheet, View, Picker, Text, ScrollView } from 'react-native';
import { useStoreState, useStoreActions } from 'easy-peasy';
import HeaderButton from '../components/HeaderButton';
import Toolbar from '../components/Toolbar';
import Code from '../components/Code';
import { t, availableLanguages } from '../i18n';

const Settings = ({ screenProps }) => {
  const { themeOptions, updateDrawerContent } = screenProps;
  const {
    locale,
    theme,
    themeColors: { backgroundColor }
  } = useStoreState(store => store.preferences);
  const { setTheme, setLocale } = useStoreActions(actions => actions.preferences);

  return (
    <View style={styles.container}>
      <Toolbar backgroundColor={theme.primary}>
        <Text style={styles.title}>{t('language')}:</Text>
      </Toolbar>
      <Picker
        style={styles.picker}
        mode="dialog"
        onValueChange={(locale) => {
          setLocale(locale);
          updateDrawerContent(locale);
        }}
        selectedValue={locale}
      >
        {
          availableLanguages
            .map(lang =>
              <Picker.Item
                key={lang}
                label={t(lang)}
                value={lang}
              />
            )
        }
      </Picker>
      <Toolbar backgroundColor={theme.primary}>
        <Text style={styles.title}>
          {t('select_your_theme')}:
        </Text>
      </Toolbar>
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
        {t('preview')}:
      </Text>
      <View
        style={{
          backgroundColor,
          padding: 8,
          paddingBottom: 16
        }}
      >
        <Code>
          {`console.log("hello world");\nconst f = n => n+1;`}
        </Code>
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

Settings.navigationOptions = ({ screenProps }) => ({
  title: t('settings'),
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
    justifyContent: 'center',
    textAlign: 'center'
  },
  title: {
    height: 48,
    elevation: 2,
    fontSize: 18,
    paddingHorizontal: 16,
    color: '#000',
    textAlignVertical: 'center'
  },
  picker: {
    height: 50,
    margin: 8
  }
});

export default Settings;