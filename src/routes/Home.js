import React, { useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, TouchableHighlight, ScrollView, Keyboard, Alert, Dimensions } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import OptionsMenu from "react-native-options-menu";
import Prompt from '../components/Prompt';
import Shortcuts from '../components/Shortcut';
import HeaderButton from '../components/HeaderButton';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { saveFile, readFile } from '../utils/FSManager';
import { debounce } from '../utils/helpers';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TabView, TabBar } from 'react-native-tab-view';

const Home = (props) => {
  const { navigation } = props;
  const {
    theme: {
      styles: themeStyles,
      highlighter,
      primary
    },
    themeColors: {
      backgroundColor,
      color,
      highlightColor
    },
    currentFile,
    tabsCount,
    codeShortcuts
  } = useStoreState(store => store);
  const setCurrentFile = useStoreActions(actions => actions.setCurrentFile);
  const [ code, setCode ] = useState("");
  const [ codeHistory, setCodeHistory ] = useState([""]);
  const [ isEditing, setIsEditing ] = useState(false);
  const [ promptVisible, setPromptState ] = useState(false);
  const [ selection, setSelection ] = useState({ start: 0, end: 0 });
  const inputEl = useRef(null);

  useEffect(() => {
    if (inputEl && inputEl.current) {
      const { start: s, end: e = s } = selection;
      const codel = code.length;
      const end = 
        e > codel ?
          codel :
          e;
      const start = 
        s > codel ?
          codel :
          s;
      inputEl.current.setNativeProps({
        selection: { start, end }
      });
    }
  }, [selection])

  const exec = async () => {
    try {
      setIsEditing(false);
      Keyboard.dismiss();
      let regex = /(\/\/ *)?(use\(.+\);?)/g;
      let importedCode = await Promise.all(
        (code.match(regex) || [])
          .filter(x => !x.includes('//'))
          .map(s => eval(s))
      ).then(filescode => filescode.join('\n'));
      const codeWithoutImports = code.split('\n').filter(s => !s.includes('use(')).join('\n');
      eval(importedCode + '\n' + codeWithoutImports);
      navigation.navigate('Console');      
    } catch (e) {
      const match = e.stack.match(/<anonymous>:\d+:\d+/g);
      const [ _, line = 0, position = 0 ] = (match && match[0] || '').split(':');
      Alert.alert(
        e.name,
        `${e.message} \nline: ${line}, position: ${position}`,
        [
          {
            text: 'CANCEL',
            style: 'cancel',
          }
        ],
        { cancelable: false }
      );
    }
  }

  const comment = () => {
    if (inputEl && inputEl.current && inputEl.current._lastNativeSelection) {
      const { start, end } = inputEl.current._lastNativeSelection;
      let initialRow = code.substring(0, start).split("\n").length - 1;    
      let finalRow = code.substring(start, end).split("\n").length - 1 + initialRow;
      let newCode = code
        .split("\n")
        .map((l, i) => {
          if (i >= initialRow && i <= finalRow) {
            if (l.includes('//')) {
              const match = /(\/\/ *)?/g.exec(l);
              l = l.substring(match[1].length);
            } else {
              l = '// ' + l
            }
          }
          return l;
        }).join('\n');
      limitAndSetHistory(code);
      setCode(newCode);    
      setSelection({ start, end });
    }
  }

  useEffect(() => {
    const c = navigation.getParam('code');
    if (c !== undefined) {
      setCode(c);
      setCodeHistory([c]);
    }
    Keyboard.addListener(
      'keyboardDidHide',
      () => setIsEditing(false),
    );
    return () => {
       Keyboard.removeListener('keyboardDidHide')
    }; 
  }, [navigation.getParam('code')]);

  useEffect(() => {
    navigation.setParams({
      exec,
      comment,
      highlightColor,
      undo: () => {
        if (codeHistory.length) {
          const historyCopy = [ ...codeHistory ];
          setCode(historyCopy.shift())
          setCodeHistory(historyCopy);
        }
      },
      save: () => setPromptState(true)
    });
  }, [highlightColor, code, inputEl, codeHistory]);  

  const insertKey = (key = "") => {
    if (inputEl && inputEl.current && inputEl.current._lastNativeSelection) {
      const { start, end } = inputEl.current._lastNativeSelection;
      if (isEditing) {
        const newcode = code.substring(0, start) + key + code.substring(end);
        let position = end + key.length - Math.floor(key.length/2);
        limitAndSetHistory(code);
        setCode(newcode);
        setSelection({ start: position });
      }
    }
  }

  const limitAndSetHistory = (newElement) => {
    var h = [
      newElement,
      ...codeHistory.slice(0, 9)      
    ];
    setCodeHistory(h);
  }

  const debouncedHistory = debounce(function(code) {
    limitAndSetHistory(code);
  }, 500);

  return (
    <View style={{
      ...styles.container,
      backgroundColor
    }}>    
      <Prompt
        title="Save as:"
        placeholder="Start typing"
        defaultValue={currentFile || '.js'}
        visible={promptVisible}
        onClose={() => setPromptState(false)}
        onSubmit={(filename) => {
          if (filename !== currentFile) {
            setCurrentFile(filename);
          }
          saveFile(filename, code);
          setPromptState(false);
          navigation.navigate('Home', { code });
        }}
      />
      <TabView
        navigationState={{
          index: 0,
          routes: [(currentFile || "untitled")].map(c => ({ key: c, title: c }))
        }}
        renderScene={() => null}
        onIndexChange={index => console.log(index)}
        sceneContainerStyle={{ height: 0, flex: 1 }}
        style={{ maxHeight: 48 }}
        renderTabBar={props =>
          <TabBar
            {...props}
            scrollEnabled
            onTabLongPress={console.log}
            indicatorStyle={{
              backgroundColor: highlightColor,
              height: 6
            }}
            tabStyle={{
              width: Dimensions.get('window').width / tabsCount
            }}
            style={{
              backgroundColor: primary,
              height: 48
            }}
            renderLabel={({ route, focused }) => (
              <Text
                style={{
                  color: '#000',
                  fontSize: 18,
                  fontWeight: 'bold'
                }}
              >
                {route.title}{code !== navigation.getParam('code') ? '*' : ''}
              </Text>
            )}
          />
        }
      />
      <ScrollView>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          borderTopRadius: 4,
          borderTopWidth: 0.5,
          borderTopColor: color
        }}>
          <View style={{ paddingTop: 8, backgroundColor }}>
            {
              code.split('\n')
                .map((t, i) =>
                  <Text
                    key={i}
                    style={{
                      ...styles.codeIndex,
                      backgroundColor,
                      color
                    }}
                  >
                    {i + 1}
                  </Text>
                )
            }
          </View>
          <ScrollView horizontal>
            {
              (isEditing || !code) ?
                <View style={{
                  ...styles.inputView,
                  backgroundColor,
                  overflow: 'visible'
                }}>
                  <TextInput
                    style={{
                      ...styles.input,
                      backgroundColor,
                      color,
                      overflow: 'scroll'
                    }}
                    ref={inputEl}
                    multiline
                    textBreakStrategy="balanced"
                    textAlignVertical={"top"}
                    autoFocus
                    autoCapitalize="none"
                    onChangeText={(code) => {
                      setCode(code);
                      debouncedHistory(code);
                    }}
                    onBlur={() => {
                      setIsEditing(false);
                      Keyboard.dismiss();
                    }}
                    value={code}
                  />
                </View> :
                <TouchableHighlight
                  style={styles.inputView}
                  onPress={() => setIsEditing(true)}
                >
                  <SyntaxHighlighter 
                    language='javascript' 
                    style={themeStyles}
                    fontSize={17}
                    highlighter={highlighter}                
                  >
                    {code}
                  </SyntaxHighlighter>
                </TouchableHighlight>
            }
          </ScrollView>
        </View>
      </ScrollView>
      <Shortcuts
        color={color}
        onPress={insertKey}
        actions={codeShortcuts}
      />
    </View>
  );
}

Home.navigationOptions = ({ navigation, screenProps: { openDrawer } }) => {
  const highlightColor = navigation.getParam('highlightColor');
  return ({
    title: 'JSeditor',
    headerRight: (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <HeaderButton
          underlayColor={highlightColor}
          onPress={navigation.getParam('comment')}
          name="format-quote-close"
          style={{ marginLeft: 8 }}
        />
        <HeaderButton
          underlayColor={highlightColor}
          onPress={navigation.getParam('undo')}
          name="undo"
          style={{ marginLeft: 8 }}
        />
        <OptionsMenu
          customButton={
            <Icon name="dots-vertical" size={28} style={{ margin: 8 }} />
          }
          options={[
            "Run",
            "Save",
            "Console"
          ]}
          actions={[
            navigation.getParam('exec'),
            navigation.getParam('save'),
            () => navigation.push('Console')
          ]}/>
      </View>
    ),
    headerLeft: (
      <HeaderButton
        underlayColor={highlightColor}
        onPress={openDrawer}
        name="menu"
        style={{ marginLeft: 8 }}
      />
    )
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  filename: {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 8
  },
  inputView: {
    backgroundColor: 'rgba(0,0,0,0)',
    flex: 1
  },
  input: {
    padding: 8,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    width: '100%'
  },
  codeIndex: {
    paddingHorizontal: 8,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace'
  }
});

export default Home;