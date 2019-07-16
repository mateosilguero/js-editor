/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { createStackNavigator, createAppContainer, NavigationActions } from 'react-navigation';
import { fromRight } from 'react-navigation-transitions';
import Drawer from 'react-native-drawer'
import Home from './routes/Home';
import Console from './routes/Console';
import Settings from './routes/Settings';
import Files from './routes/Files';
import DrawerContent from './components/DrawerContent';
import { StoreProvider, createStore } from 'easy-peasy';
import storeModel from './store';
import themes from './utils/themes';
import { readFile } from './utils/FSManager';

const store = createStore(storeModel);

var oldLog = console.log;
console.log = function (message) {
  Object.values(arguments)
    .forEach(m => 
    	null
    	//store.getActions().log(m)
   	)
  oldLog.apply(console, arguments);
}

const MainNavigator = createStackNavigator({
  Home: { screen: Home },
  Console: { screen: Console },
  Settings: { screen: Settings },
  Files: { screen: Files }
},
{
  initialRouteName: 'Home',
  transitionConfig: () => fromRight(),
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: store.getState().theme.primary,
    },
    headerTintColor: store.getState().theme.maincolor,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  },
});

const Navigator = createAppContainer(MainNavigator);

function App() {
	const _navigator = useRef(null);
	const _drawer = useRef(null);
	const { currentFile, theme, themeColors } = store.getState();
	const setTheme = store.getActions().setTheme;
	const setCurrentFile = store.getActions().setCurrentFile;

  const navigate = (routeName, params = {}) => {
	  _navigator.current.dispatch(
	    NavigationActions.navigate({ routeName, params })
	  );
	  _drawer.current.close();
	}

	useEffect(() => {
		AsyncStorage.multiGet([
			'theme',
			'highlighter',
			'currentFile'
		])
			.then(array => {
				const {
					theme: t,
					highlighter,
					currentFile
				} = (array || []).reduce((acc, [ key, value ]) => ({
					...acc,
					[key]: value
				}), {});
				setTheme({ selectedTheme: t || 'obsidian', highlighter: highlighter || 'hljs' });
				if (currentFile) {
	      	setCurrentFile(currentFile);
					readFile(currentFile)
	          .then(code => {
	            navigate('Home', { code });
	          })
	          .catch(() => 
	          	AsyncStorage.removeItem('currentFile')
	          )
	      }
			});
	}, [theme]);	

	const getThemesFromStyles = (style) => {
		const forbidden = ['cb', 'hopscotch', 'funky', 'pojoaque', 'schoolBook', 'xonokai', 'xt256'];
		return (
			Object.keys(themes[style])
	  		.filter(t => !forbidden.includes(t))
	  		.map(t => ({ value: t, theme: style }))
  	)
	}

  return (
  	<StoreProvider store={store}>
    	<Drawer
        ref={_drawer}
        content={
        	<DrawerContent
        		menuItems={[
        			{ key: 'Home', label: 'Code', icon: 'code-tags' },
        			{ key: 'Files', label: 'Files', icon: 'file-document-box' },
	            {
	            	key: 'Home',
	            	label: 'New File',
	            	icon: 'file-document-edit',
	            	params: { code: '' },
	            	onPress: () => {
	            		AsyncStorage.removeItem('currentFile');
	            		setCurrentFile();
	            	}
	            },
	            { key: 'Settings', label: 'Settings', icon: 'settings' },
	            { key: 'Settings', label: 'About', icon: 'information' },
	            { key: 'Settings', label: 'Help', icon: 'lifebuoy' }
        		]}
        		onPress={navigate}
        	/>
        }
        openDrawerOffset={(viewport) => viewport.width - 200}
        tapToClose
        type="static"
       >
	      <Navigator
	      	ref={_navigator}
	        screenProps={{
	          openDrawer: () => _drawer.current.open(),
	          themeOptions: [
	          	...getThemesFromStyles('hljs'),
	          	...getThemesFromStyles('prism'),
	          ]
	        }}
	      />
		  </Drawer>
		 </StoreProvider>
  )
}

export default App;