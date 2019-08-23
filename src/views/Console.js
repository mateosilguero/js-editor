import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useStoreState, useStoreActions } from 'easy-peasy';
import HeaderButton from '../components/HeaderButton';
import Code from '../components/Code';

const Console = ({ navigation }) => {
  const {
    backgroundColor
  } = useStoreState(store => store.preferences.themeColors);
  const logs = useStoreState(store => store.audit.logs);
  const clearLogs = useStoreActions(actions => actions.audit.clearLogs);

  useEffect(() => {
    navigation.setParams({
      clearLogs
    });
  }, []);

  return (
    <View style={styles.container(backgroundColor)}>
      <ScrollView
        ref={ ref => this.flatList = ref }
        onContentSizeChange={() => this.flatList.scrollToEnd({animated: true})}
        onLayout={() => this.flatList.scrollToEnd({animated: true})}
      >
        <View style={styles.logsView(backgroundColor)}>
          <Code>
            {
              logs
                .map(s =>
                  `> ${
                    s && typeof s === 'object' ?
                      '\n' : ''
                  }${JSON.stringify(s, null, 2)}`
                )
                .join('\n')
            }
          </Code>
        </View>
      </ScrollView>
    </View>
  );
}

Console.navigationOptions = ({ navigation }) => ({
  title: 'Console',
  headerRight: (
    <HeaderButton
      testID="clear_logs"
      onPress={navigation.getParam('clearLogs')}
      name="notification-clear-all"
      style={{ marginRight: 8 }}
    />
  )
});

const styles = StyleSheet.create({
  container: (backgroundColor) => ({
    flex: 1,    
    justifyContent: 'center',
    backgroundColor
  }),
  logsView: (backgroundColor) => ({
    backgroundColor: 'rgba(0,0,0,0)',
    flex: 1,
    flexDirection: 'row',
    backgroundColor
  })
});

export default Console;