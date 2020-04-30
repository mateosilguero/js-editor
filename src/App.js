import React, {useState, useRef, useEffect} from 'react';
import {StatusBar, DeviceEventEmitter} from 'react-native';
import FastStorage from 'react-native-fast-storage';
import Drawer from 'react-native-drawer';
import SplashScreen from 'react-native-splash-screen';
import Home from './views/Home';
import Console from './views/Console';
import Settings from './views/Settings';
import Files from './views/Files';
import About from './views/About';
import Help from './views/Help';
import DrawerContent from './components/DrawerContent';
import {StoreProvider, createStore} from 'easy-peasy';
import storeModel from './store';
import {openFileSchema} from './utils/helpers.js';
import {readFile} from './utils/FSManager';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HeaderButton from './components/HeaderButton';
import C from 'consistencss';

const Stack = createStackNavigator();
const store = createStore(storeModel);

const {log, clearLogs} = store.getActions().audit;

const oldLog = console.log;
console.log = function() {
  Object.values(arguments).forEach((m) =>
    //null
    log(m),
  );
  __DEV__ && oldLog.apply(console, arguments);
};

const {primary, primaryDark, textcolor} = store.getState().preferences.theme;

function App() {
  const _navigator = useRef(null);
  const _drawer = useRef(null);
  const [_, updateDrawerContent] = useState('');
  const {setTheme, setLocale} = store.getActions().preferences;
  const {addOpenFile} = store.getActions().files;

  const navigate = (routeName, params = {}) => {
    _navigator.current?.navigate(routeName, params);
    setTimeout(_drawer.current.close, 300);
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('openFile', function(
      e,
    ) {
      readFile(e.path, true)
        .then((code) =>
          addOpenFile(openFileSchema(e.name, code, code, true, e.path)),
        )
        .catch(console.log);
    });
    Promise.all([
      FastStorage.getItem('theme'),
      FastStorage.getItem('highlighter'),
      FastStorage.getItem('openedFiles'),
      FastStorage.getItem('locale'),
    ])
      .then((array) => {
        const [theme, highlighter, openedFiles, locale] = array || [];
        setTheme({
          selectedTheme: theme || 'obsidian',
          highlighter: highlighter || 'hljs',
        });
        const opf = JSON.parse(openedFiles || '[]');
        if (locale) {
          setLocale(locale);
          updateDrawerContent(locale);
        }
        if (opf && opf.length > 0) {
          Promise.all(
            opf.map((f) =>
              readFile(f.foreignPath || f, f.foreignPath !== undefined).catch(
                () => null,
              ),
            ),
          )
            .then((codeArray) => codeArray.filter((x) => x))
            .then((codeArray) => {
              if (codeArray.length) {
                codeArray.map((code, i) =>
                  addOpenFile(
                    openFileSchema(
                      opf[i].filename || opf[i],
                      code,
                      code,
                      opf[i].foreignPath !== undefined,
                      opf[i].foreignPath,
                    ),
                  ),
                );
              } else {
                addOpenFile(openFileSchema());
              }
            })
            .catch((e) => FastStorage.removeItem('openedFiles'))
            .finally(() => SplashScreen.hide());
        } else {
          addOpenFile(openFileSchema());
          SplashScreen.hide();
        }
      })
      .finally(clearLogs);
    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <StoreProvider store={store}>
      <StatusBar backgroundColor={primaryDark} barStyle="dark-content" />
      <Drawer
        ref={_drawer}
        content={
          <DrawerContent
            onPress={navigate}
            addNewFile={() => addOpenFile(openFileSchema())}
          />
        }
        openDrawerOffset={(viewport) => viewport.width - 206}
        tapToClose
        type="static"
      >
        <NavigationContainer ref={_navigator}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: primary,
              },

              headerTintColor: textcolor,
              headerLeft: () => (
                <HeaderButton
                  testID="burguer"
                  onPress={() => {
                    _drawer.current.open();
                  }}
                  name="menu"
                  style={C.ml2}
                />
              ),
            }}
          >
            <Stack.Screen name="JSand" component={Home} />
            <Stack.Screen
              name="Console"
              component={Console}
              options={{
                headerLeft: () => (
                  <HeaderButton
                    testID="burguer"
                    onPress={() => {
                      _navigator.current?.goBack();
                    }}
                    name="arrow-left"
                    style={C.ml2}
                  />
                ),
              }}
            />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Files" component={Files} />
            <Stack.Screen name="About" component={About} />
            <Stack.Screen name="Help" component={Help} />
          </Stack.Navigator>
        </NavigationContainer>
      </Drawer>
    </StoreProvider>
  );
}

export default App;
