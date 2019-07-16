import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import HeaderButton from '../components/HeaderButton';
import { useStoreState, useStoreActions } from 'easy-peasy';

const Console = ({ navigation }) => {
  const { logs, theme, themeColors: { highlightColor, backgroundColor } } = useStoreState(store => store);
  const clearLogs = useStoreActions(actions => actions.clearLogs);

  useEffect(() => {
    navigation.setParams({
      highlightColor,
      clearLogs
    });
  }, [highlightColor]);

  return (
    <View style={{
      ...styles.container,
      backgroundColor
    }}>
      <ScrollView
        ref={ ref => this.flatList = ref }
        onContentSizeChange={() => this.flatList.scrollToEnd({animated: true})}
        onLayout={() => this.flatList.scrollToEnd({animated: true})}
      >
        <View style={{
          ...styles.inputView,
          backgroundColor
        }}>
          <SyntaxHighlighter 
            language='javascript' 
            style={theme.styles}
            fontSize={16}
            highlighter={theme.highlighter}                
          >
            {
              logs
                .map(s => `> ${JSON.stringify(s, null, 2)}`)
                .join('\n')
            }
          </SyntaxHighlighter>
        </View>
      </ScrollView>
    </View>
  );
}

Console.navigationOptions = ({ navigation }) => ({
  title: 'Console',
  headerRight: (
    <HeaderButton
      underlayColor={navigation.getParam('highlightColor')}
      onPress={navigation.getParam('clearLogs')}
      name="notification-clear-all"
      style={{ marginRight: 8 }}
    />
  )
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  inputView: {
    backgroundColor: 'rgba(0,0,0,0)',
    flex: 1
  }
});

export default Console;