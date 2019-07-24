import React, { useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, TouchableHighlight, ScrollView, Keyboard, Alert, Dimensions } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import OptionsMenu from "react-native-options-menu";
import Prompt from '../components/Prompt';
import Shortcuts from '../components/Shortcut';
import HeaderButton from '../components/HeaderButton';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { saveFile, readFile } from '../utils/FSManager';
import { debounce, openFileSchema } from '../utils/helpers';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TabView, TabBar } from 'react-native-tab-view';

const Home = (props) => {
  const { navigation } = props;
  const {
    theme: {
      styles: themeStyles,
      highlighter,
      primary,
      maincolor,
      primaryDark
    },
    themeColors: {
      backgroundColor,
      color,
      highlightColor
    },
    currentTab,
    openedFiles,
    codeShortcuts
  } = useStoreState(store => store);
  const  {
    setOpenedFiles,
    setCurrentTab,
    closeOpenFile
  } = useStoreActions(actions => actions);
  const [ codeHistory, setCodeHistory ] = useState([]);
  const [ isEditing, setIsEditing ] = useState(false);
  const [ promptVisible, setPromptState ] = useState(false);
  const [ selection, setSelection ] = useState({ start: 0, end: 0 });
  const inputEl = useRef(null);

  const { code = '', filename: currentFile = ''} = openedFiles[currentTab] || {};
  const splitedCode = code.split('\n');

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

  const safeSetCode = (code, replaceInitialState, newName) => {
    const op = [ ...openedFiles ];
    const {
      filename,
      code: oldCode,
      initialState
    } = (op[currentTab] || {});
    op[currentTab] = openFileSchema(
      newName || filename,
      code,
      replaceInitialState ? code : initialState
    )
    setOpenedFiles(op);
  }

  const exec = async () => {
    try {
      setIsEditing(false);
      Keyboard.dismiss();
      let regex = /(\/\/ *)?(import ?.+;?)/g;
      let importedCode = await Promise.all(
        (code.match(regex) || [])
          .filter(x => !x.includes('//'))
          .map(s => {
            const exec = /(import ?['"](.+)['"];?)/g.exec(s);
            const filename = exec && exec[2];
            if (filename) {
              const f = openedFiles.find(o => o.filename === filename);
              return f ? f.code : readFile(filename);
            }
          })
      ).then(filescode =>
        filescode.join('\n') + (filescode.length ? '\n' : '')
      );
      const codeWithoutImports = splitedCode.filter(s => !s.includes('import')).join('\n');
      eval(importedCode + codeWithoutImports);
      navigation.navigate('Console');      
    } catch (e) {
      const match = e.stack.match(/<anonymous>:\d+:\d+/g);
      const [ _, line = 0, position = 0 ] = (match && match[0] || '').split(':');
      Alert.alert(
        e.name,
        `${e.message} \nline: ${line}, position: ${position}`,
        [{ text: 'CANCEL', style: 'cancel' }],
        { cancelable: false }
      );
    }
  }

  useEffect(() => {
    Keyboard.addListener(
      'keyboardDidHide',
      () => setIsEditing(false),
    );
    return () => {
      Keyboard.removeListener('keyboardDidHide')
    }; 
  }, [false]);

  useEffect(() => {
    navigation.setParams({
      exec,
      comment: () => insertText(undefined, 'comment'),
      highlightColor,
      maincolor,
      undo,
      save: () => setPromptState(true),
      saveAll,
      isEditing,
      hasHistory: codeHistory[currentTab] && codeHistory[currentTab].length > 0
    });
  }, [highlightColor, code, codeHistory, openedFiles, isEditing, inputEl]);

  const saveAll = () =>
    setOpenedFiles(
      openedFiles.map((o, i) => {
        if (o.filename) {
          saveFile(o.filename, o.code);
          return openFileSchema(
            o.filename,
            o.code
          )
        } else {
          setCurrentTab(i);
          setPromptState(true);
          return o;
        }
      })
    );

  const undo = () => {        
    const history = [ ...codeHistory ];
    const prevHistory = history[currentTab];
    if (prevHistory && prevHistory.length) {
      const historyCopy = [ ...prevHistory ];
      safeSetCode(historyCopy.shift())
      history[currentTab] = historyCopy;
      setCodeHistory(history);
    }
  }

  const insertText = (key = '', mode) => {
    if (
      inputEl &&
      inputEl.current &&
      inputEl.current._lastNativeSelection &&
      isEditing
    ) {
      const { start, end } = inputEl.current._lastNativeSelection;
      let newcode, position;
      if (mode === 'comment') {
        let initialRow = code.substring(0, start).split("\n").length - 1;    
        let finalRow = code.substring(start, end).split("\n").length - 1 + initialRow;
        newcode = splitedCode.map((l, i) => {
          if (i >= initialRow && i <= finalRow) {
            if (/^(\/\/ *)/g.test(l)) {
              const match = /^(\/\/ *)?/g.exec(l);
              l = l.substring(match[1].length);
            } else {
              l = '// ' + l
            }
          }
          return l;
        }).join('\n');
        position = {  start, end };
      } else {
        newcode = code.substring(0, start) + key + code.substring(end);
        position = {
          start: end + key.length - Math.floor(key.length/2)
        }
      }      
      limitAndSetHistory(code);
      safeSetCode(newcode);  
      setSelection(position);
    }
  }

  const limitAndSetHistory = (newElement) => {
    const history = [ ...codeHistory ];
    const prevHistory = history[currentTab] || [];
    const h = [
      newElement,
      ...prevHistory.slice(0, 9)      
    ];
    history[currentTab] = h;
    setCodeHistory(history);
  }

  const debouncedHistory = debounce(function(code) {
    limitAndSetHistory(code);
  }, 500);

  const hasChanged = (title) => {
    const file = openedFiles.find(op => op.filename === title);
    return file.code !== file.initialState ? '*' : '';
  }

  return (
    <View style={styles.container(backgroundColor)}>    
      <Prompt
        title="Save as:"
        placeholder="Start typing"
        defaultValue={currentFile || '.js'}
        visible={promptVisible}
        onClose={() => setPromptState(false)}
        onSubmit={(filename) => {
          saveFile(filename, code);
          safeSetCode(code, true, filename);
          setPromptState(false);
        }}
      />
      <TabView
        navigationState={{
          index: currentTab,
          routes: openedFiles.map((c, i) => ({
            key: i,
            title: c.filename
          }))
        }}
        renderScene={() => null}
        onIndexChange={index => {
          setCurrentTab(index);
        }}
        sceneContainerStyle={{ height: 0, flex: 1 }}
        style={{ maxHeight: 48 }}
        renderTabBar={props =>
          <TabBar
            {...props}
            scrollEnabled
            onTabLongPress={({ route }) => closeOpenFile(route.title)}
            indicatorStyle={{
              backgroundColor: highlightColor,
              height: 3
            }}
            style={{
              backgroundColor: primary,
              height: 48
            }}
            renderLabel={({ route, focused }) => (
              <Text
                style={{
                  color: maincolor,
                  fontSize: 18,
                  fontWeight: 'bold'
                }}
              >
                {route.title || 'untitled'}{hasChanged(route.title)}
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
              splitedCode
                .map((t, i) =>
                  <Text
                    key={i}
                    style={styles.codeIndex(backgroundColor, color)}
                  >
                    {i + 1}
                  </Text>
                )
            }
          </View>
          <ScrollView horizontal>
            {
              isEditing ?
                <View style={styles.inputView(backgroundColor)}>
                  <TextInput
                    style={styles.input(backgroundColor, color)}
                    ref={inputEl}
                    multiline
                    textBreakStrategy="balanced"
                    textAlignVertical={"top"}
                    autoFocus
                    autoCapitalize="none"
                    onChangeText={(c) => {
                      debouncedHistory(code);
                      safeSetCode(c);                      
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
        onPress={insertText}
        actions={codeShortcuts}
      />
    </View>
  );
}

Home.navigationOptions = ({ navigation, screenProps: { openDrawer } }) => {
  const highlightColor = navigation.getParam('highlightColor');
  return ({
    title: 'JS',
    headerRight: (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <HeaderButton
          underlayColor={highlightColor}
          disabled={!navigation.getParam('isEditing')}
          onPress={navigation.getParam('comment')}
          name="format-quote-close"
          style={{ marginLeft: 8 }}
        />
        <HeaderButton
          underlayColor={highlightColor}
          disabled={
            !navigation.getParam('isEditing') ||
            !navigation.getParam('hasHistory')
          }
          onPress={navigation.getParam('undo')}
          name="undo"
          style={{ marginLeft: 8 }}
        />
        <OptionsMenu
          customButton={
            <Icon
              name="dots-vertical"
              size={28}
              style={{ margin: 8, color: navigation.getParam('maincolor') }}
            />
          }
          options={[
            "Run",
            "Console",
            "Save",
            "Save All"            
          ]}
          actions={[
            navigation.getParam('exec'),
            () => navigation.push('Console'),
            navigation.getParam('save'),
            navigation.getParam('saveAll')            
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
  container: (backgroundColor) => ({
    flex: 1,
    justifyContent: 'center',
    backgroundColor
  }),
  filename: {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 8
  },
  inputView: (backgroundColor) => ({
    backgroundColor,
    flex: 1,
    overflow: 'visible'
  }),
  input: (backgroundColor, color) => ({
    padding: 8,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    width: '100%',
    overflow: 'scroll',
    backgroundColor,
    color
  }),
  codeIndex: (backgroundColor, color) => ({
    paddingHorizontal: 8,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    backgroundColor,
    color
  })
});

export default Home;