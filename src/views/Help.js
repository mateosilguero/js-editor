import React from 'react';
import { StyleSheet, View, Picker, Text, ScrollView } from 'react-native';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HeaderButton from '../components/HeaderButton';
import Code from '../components/Code';
import { t } from '../i18n';

const Settings = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { fontSize: 36 }]}>
        {t('how_to')}...
      </Text>
      <Text style={styles.title}>
        ...{t('create_new_file')} ?
      </Text>
      <Text style={styles.subtitle}>
        {
          t('new_file_tutorial')(
            ([first, second]) =>
              <>
                <Text style={styles.subtitle}>{first}</Text>
                <Icon
                  name={'file-document-edit'}
                  size={24}
                />
                <Text style={styles.subtitle}>{second}</Text>
              </>
          )
        }
      </Text>        
      <Text style={styles.title}>
        ...{t('execute_code')} ?
      </Text>
      <Text style={styles.subtitle}>
        {t('run_code_tutorial')(
          ([first, second]) =>
            <>
              <Text style={styles.subtitle}>{first}</Text>
              <Icon
                name={'dots-vertical'}
                size={24}
              />
              <Text style={styles.subtitle}>{second}</Text>
            </>
        )}
      </Text>
      <Text style={styles.title}>
        ...{t('save_new_file')} ?
      </Text>
      <Text style={styles.subtitle}>
        {t('save_file_tutorial')(
          ([first, second]) =>
            <>
              <Text style={styles.subtitle}>{first}</Text>
              <Icon
                name={'dots-vertical'}
                size={24}
              />
              <Text style={styles.subtitle}>{second}</Text>
            </>
        )}
      </Text>
      <Text style={styles.title}>
        ...{t('import_files')} ?
      </Text>
      <Code>
        {`import "path/to/file.js";`}
      </Code>
      <Text style={styles.subtitle}>
        {t('import_files_disclaimer')}
      </Text>      
    </ScrollView>
  );
}

Settings.navigationOptions = ({ screenProps }) => ({
  title: t('help'),
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
    marginBottom: 8
  }
});

export default Settings;