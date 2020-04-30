import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Alert,
  Share,
} from 'react-native';
import {useStoreState, useStoreActions} from 'easy-peasy';
import Prompt from '../../components/Prompt';
import Shortcuts from '../../components/Shortcut';
import Code from '../../components/Code';
import Tabs from '../../components/Tabs';
import HeaderButton from '../../components/HeaderButton';
import FabButton from '../../components/FabButton';
import {saveFile, readFile} from '../../utils/FSManager';
import {debounce, openFileSchema} from '../../utils/helpers';
import {t} from '../../i18n';
import OptionsMenu from 'react-native-options-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import C, {apply} from 'consistencss';

const Home = ({navigation}) => {
  const {
    themeColors: {backgroundColor, color},
    codeShortcuts,
  } = useStoreState((store) => store.preferences);
  const {currentTab, openedFiles} = useStoreState((store) => store.files);
  const {setOpenedFiles, setCurrentTab, addOpenFile} = useStoreActions(
    (actions) => actions.files,
  );
  const [codeHistory, setCodeHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [promptVisible, setPromptState] = useState(false);
  const [selection, setSelection] = useState({start: 0, end: 0});

  const {code = '', filename: currentFile = '', isForeign, foreignPath} =
    openedFiles[currentTab] || {};
  const splitedCode = code.split('\n');

  const safeSetCode = (code, replaceInitialState, newName) => {
    const op = [...openedFiles];
    const {filename, initialState, isForeign, foreignPath} =
      op[currentTab] || {};
    op[currentTab] = openFileSchema(
      newName || filename,
      code,
      replaceInitialState ? code : initialState,
      isForeign,
      foreignPath,
    );
    setOpenedFiles(op);
  };

  const asyncStringReplace = (str, regex, aReplacer) => {
    let match = regex.exec(str);
    if (match) {
      str = str
        .split(match[0])
        .filter((x) => x)
        .join('')
        .trim();
      return aReplacer(...match).then((res) => res + '\n' + str);
    }
    return '';
  };

  const replaceIncludePlaceholdersWithFileContents = async (str) => {
    if (str.includes('import')) {
      const placeholderRe = /(\/\/ *)?import ?['"]*(.*)['"];*/g;
      const replacedCode = await asyncStringReplace(
        str,
        placeholderRe,
        (_, isCommented, filename) => {
          if (isCommented) {
            return Promise.resolve('');
          }
          const f = openedFiles.find((o) => o.filename === filename);
          return f ? Promise.resolve(f.code) : readFile(filename);
        },
      );
      return await replaceIncludePlaceholdersWithFileContents(replacedCode);
    }
    return str;
  };

  const exec = async () => {
    try {
      setIsEditing(false);
      Keyboard.dismiss();
      const codeToExecute = await replaceIncludePlaceholdersWithFileContents(
        code,
      );
      eval(codeToExecute);
      navigation.navigate('Console');
    } catch (e) {
      const match = e.stack.match(/<anonymous>:\d+:\d+/g);
      const [_, line = 0, position = 0] = ((match && match[0]) || '').split(
        ':',
      );
      Alert.alert(
        e.name,
        `${e.message} \nline: ${line}, position: ${position}`,
        [{text: 'CANCEL', style: 'cancel'}],
        {cancelable: false},
      );
    }
  };

  const share = async () => {
    setIsEditing(false);
    Keyboard.dismiss();
    const codeToShare = await replaceIncludePlaceholdersWithFileContents(code);
    Share.share({
      message: codeToShare,
    });
  };

  useEffect(() => {
    const editingFalse = () => setIsEditing(false);
    Keyboard.addListener('keyboardDidHide', editingFalse);
    return () => {
      Keyboard.removeListener('keyboardDidHide', editingFalse);
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={apply(C.row, C.mt1)}>
          <HeaderButton
            testID="comment"
            disabled={!isEditing}
            onPress={() => insertText('comment')}
            name="format-quote-close"
            style={C.ml2}
          />
          <HeaderButton
            testID="undo"
            disabled={
              !isEditing ||
              !(codeHistory[currentTab] && codeHistory[currentTab].length > 0)
            }
            onPress={undo}
            name="undo"
            style={C.ml2}
          />
          <OptionsMenu
            customButton={
              <Icon
                testID="options_menu"
                name="dots-vertical"
                size={28}
                style={apply(C.m2, C.textTextcolor)}
              />
            }
            options={[
              t('run'),
              t('console'),
              t('share'),
              t('save'),
              t('save_all'),
            ]}
            actions={[
              exec,
              () => navigation.push('Console'),
              share,
              save,
              saveAll,
            ]}
          />
        </View>
      ),
    });
  }, [code, isForeign, codeHistory, openedFiles, isEditing]);

  const save = () => {
    if (isForeign) {
      saveFile(foreignPath, code, isForeign);
      safeSetCode(code, true);
    } else {
      setPromptState(true);
    }
  };

  const saveAll = () =>
    setOpenedFiles(
      openedFiles.map((o, i) => {
        if (o.filename) {
          saveFile(
            o.isForeign ? o.foreignPath : o.filename,
            o.code,
            o.isForeign,
          );
          return openFileSchema(
            o.filename,
            o.code,
            o.code,
            o.isForeign,
            o.foreignPath,
          );
        } else {
          setCurrentTab(i);
          setPromptState(true);
          return o;
        }
      }),
    );

  const undo = () => {
    const history = [...codeHistory];
    const prevHistory = history[currentTab];
    if (prevHistory && prevHistory.length) {
      const historyCopy = [...prevHistory];
      safeSetCode(historyCopy.shift());
      history[currentTab] = historyCopy;
      setCodeHistory(history);
    }
  };

  const insertText = async (key = '') => {
    if (selection && isEditing) {
      const {start, end} = selection;
      let newcode, position;
      if (key === 'comment') {
        let initialRow = code.substring(0, start).split('\n').length - 1;
        let finalRow =
          code.substring(start, end).split('\n').length - 1 + initialRow;
        newcode = splitedCode
          .map((l, i) => {
            if (i >= initialRow && i <= finalRow) {
              if (/^(\/\/ *)/g.test(l)) {
                const match = /^(\/\/ *)?/g.exec(l);
                l = l.substring(match[1].length);
              } else {
                l = '// ' + l;
              }
            }
            return l;
          })
          .join('\n');
        position = {start, end};
      } else {
        newcode = code.substring(0, start) + key + code.substring(end);
        position = {
          start: end + key.length - Math.floor(key.length / 2),
        };
      }
      limitAndSetHistory(code);
      await safeSetCode(newcode);
      setSelection(position);
    }
  };

  const limitAndSetHistory = (newElement) => {
    const history = [...codeHistory];
    const prevHistory = history[currentTab] || [];
    const h = [newElement, ...prevHistory.slice(0, 9)];
    history[currentTab] = h;
    setCodeHistory(history);
  };

  const debouncedHistory = debounce(function(code) {
    limitAndSetHistory(code);
  }, 500);

  return (
    <View style={apply(C.bgBackgroundcolor, C.justifyCenter, C.flex)}>
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
      <Tabs />
      <TouchableOpacity
        style={C.flex}
        testID="code_view"
        onPress={() => setIsEditing(true)}
      >
        <ScrollView onPress={() => setIsEditing(true)}>
          <View
            style={apply(
              C.row,
              C.radius1,
              C.borderTop1,
              C.borderTopColor,
              C.flex,
            )}
          >
            <View style={apply(C.pt2, C.bgBackgroundcolor)}>
              {splitedCode.map((t, i) => (
                <Text
                  key={i}
                  style={apply(C.px2, C.bgBackgroundColor, C.textColor, {
                    fontSize: 15,
                    lineHeight: 22,
                    fontFamily:
                      Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
                  })}
                >
                  {i + 1}
                </Text>
              ))}
            </View>
            <ScrollView horizontal>
              {isEditing ? (
                <View
                  style={apply(C.bgBackgroundColor, C.flex, C.overflowVisible)}
                >
                  <TextInput
                    style={apply(
                      C.p2,
                      C.font4,
                      C.wFull,
                      C.bgBackgroundColor,
                      C.textColor,
                      {
                        lineHeight: 22,
                        fontFamily:
                          Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
                        overflow: 'scroll',
                      },
                    )}
                    multiline
                    textBreakStrategy="balanced"
                    textAlignVertical={'top'}
                    autoFocus
                    autoCapitalize="none"
                    onSelectionChange={(e) =>
                      setSelection(e.nativeEvent.selection)
                    }
                    onChangeText={(c) => {
                      debouncedHistory(code);
                      safeSetCode(c);
                    }}
                    onBlur={() => {
                      setIsEditing(false);
                      Keyboard.dismiss();
                    }}
                    value={code}
                    testID="code_input"
                  />
                </View>
              ) : (
                <Code>{code}</Code>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </TouchableOpacity>
      <FabButton testID="fab-exec" onPress={exec} name="flash" />
      <Shortcuts color={color} onPress={insertText} actions={codeShortcuts} />
    </View>
  );
};

export default Home;
