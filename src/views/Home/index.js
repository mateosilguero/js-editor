import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TextInput, TouchableHighlight, ScrollView, Keyboard, Alert, Share } from 'react-native';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Prompt from '../../components/Prompt';
import Shortcuts from '../../components/Shortcut';
import Code from '../../components/Code';
import Tabs from '../../components/Tabs';
import { saveFile, readFile } from '../../utils/FSManager';
import { debounce, openFileSchema } from '../../utils/helpers';
import styles from './styles.js';
import navigationOptions from './navigationOptions.js';
import { t } from '../../i18n';

const Home = ({ navigation }) => {
  const {
    theme: { textcolor },
    themeColors: {
      backgroundColor,
      color
    },
    codeShortcuts
  } = useStoreState(store => store.preferences);
  const {
    currentTab,
    openedFiles
  } = useStoreState(store => store.files);
  const  {
    setOpenedFiles,
    setCurrentTab,
    addOpenFile
  } = useStoreActions(actions => actions.files);
  const [ codeHistory, setCodeHistory ] = useState([]);
  const [ isEditing, setIsEditing ] = useState(false);
  const [ promptVisible, setPromptState ] = useState(false);
  const [ selection, setSelection ] = useState({ start: 0, end: 0 });
  const inputEl = useRef(null);

  const {
    code = '',
    filename: currentFile = '',
    isForeign,
    foreignPath
  } = openedFiles[currentTab] || {};
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
      initialState,
      isForeign,
      foreignPath
    } = (op[currentTab] || {});
    op[currentTab] = openFileSchema(
      newName || filename,
      code,
      replaceInitialState ? code : initialState,
      isForeign,
      foreignPath
    )
    setOpenedFiles(op);
  }

  const asyncStringReplace = (str, regex, aReplacer) => {
    let match = regex.exec(str);
    if (match) {
      str = str
        .split(match[0])
        .filter(x => x)
        .join("")
        .trim();
      return aReplacer(...match).then(res => res + "\n" + str)
    }
    return "";
  };

  const replaceIncludePlaceholdersWithFileContents = async str => {
    if (str.includes("import")) {
      const placeholderRe = /(\/\/ *)?import ?['"]*(.*)['"];*/g;
      const replacedCode = await asyncStringReplace(
        str,
        placeholderRe,
        (placeholder, isCommented, filename) => {
          if (isCommented) {
            return Promise.resolve("");
          }
          const f = openedFiles.find(o => o.filename === filename);
          return f ? Promise.resolve(f.code) : readFile(filename);
        }
      );
      return await replaceIncludePlaceholdersWithFileContents(replacedCode);
    }
    return str;
  };

  const exec = async () => {
    try {
      setIsEditing(false);
      Keyboard.dismiss();
      const codeToExecute = await replaceIncludePlaceholdersWithFileContents(code);
      eval(codeToExecute);
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

  const share = async () => {
    setIsEditing(false);
    Keyboard.dismiss();
    const codeToShare = await replaceIncludePlaceholdersWithFileContents(code);
    Share.share({
      message: codeToShare
    });
  }

  useEffect(() => {
    Keyboard.addListener(
      'keyboardDidHide',
      () => setIsEditing(false),
    );
    return () => {
      Keyboard.removeListener('keyboardDidHide')
    }; 
  }, []);

  useEffect(() => {
    navigation.setParams({
      exec,
      share,
      comment: () => insertText('comment'),
      textcolor,
      undo,
      save,
      saveAll,
      setIsEditing,
      isEditing,
      hasHistory: codeHistory[currentTab] && codeHistory[currentTab].length > 0
    });
  }, [code, isForeign, codeHistory, openedFiles, isEditing, inputEl]);

  const save = () => {
    if (isForeign) {
      saveFile(foreignPath, code, isForeign);
      safeSetCode(code, true);
    } else {
      setPromptState(true)
    }    
  }

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

  const insertText = async (key = '') => {
    if (
      inputEl &&
      inputEl.current &&
      inputEl.current._lastNativeSelection &&
      isEditing
    ) {
      const { start, end } = inputEl.current._lastNativeSelection;
      let newcode, position;
      if (key === 'comment') {
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
      await safeSetCode(newcode);  
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

  return (
    <View style={styles.container(backgroundColor)}>    
      <Prompt
        title={t('file_prompt_title')}
        placeholder=".js"
        defaultValue={currentFile || '.js'}
        visible={promptVisible}
        onClose={() => setPromptState(false)}
        onSubmit={(filename) => {
          saveFile(filename, code);
          safeSetCode(code, true, filename);
          addOpenFile(openFileSchema(filename));
          setPromptState(false);
        }}
      />
      <Tabs
        currentTab={currentTab}
        openedFiles={openedFiles}
        setCurrentTab={setCurrentTab}
      />      
      <ScrollView>
        <View style={styles.codeContainer(color)}>
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
                  <Code>
                    {code}
                  </Code>
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

Home.navigationOptions = navigationOptions;

export default Home;