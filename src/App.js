/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { createStackNavigator, createAppContainer, NavigationActions, StackActions } from 'react-navigation';
import { fromRight } from 'react-navigation-transitions';
import Drawer from 'react-native-drawer';
import SplashScreen from './views/SplashScreen';
import Home from './views/Home';
import Console from './views/Console';
import Settings from './views/Settings';
import Files from './views/Files';
import About from './views/About';
import Help from './views/Help';
import DrawerContent from './components/DrawerContent';
import { StoreProvider, createStore } from 'easy-peasy';
import storeModel from './store';
import themes from './utils/themes';
import { openFileSchema } from './utils/helpers.js';
import { readFile } from './utils/FSManager';
import { t } from './i18n';

const store = createStore(storeModel);

var oldLog = console.log;
console.log = function (message) {
	const log = store.getActions().audit.log;
  Object.values(arguments)
    .forEach(m => 
    	//null
    	log(m)
   	)
  oldLog.apply(console, arguments);
}

const { primary, primaryDark, textcolor } = store.getState().preferences.theme;

const MainNavigator = createStackNavigator({
	SplashScreen: { screen: SplashScreen },
  Home: { screen: Home },
  Console: { screen: Console },
  Settings: { screen: Settings },
  Files: { screen: Files },
  About: { screen: About },
  Help: { screen: Help }
},
{
  initialRouteName: 'SplashScreen',
  transitionConfig: () => fromRight(),
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: primary,
    },
    headerTintColor: textcolor,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  },
});

const Navigator = createAppContainer(MainNavigator);

function App() {
	const _navigator = useRef(null);
	const _drawer = useRef(null);
	const [_, updateDrawerContent] = useState('');
	const { setTheme, setLocale } = store.getActions().preferences;
	const { addOpenFile, setOpenedFiles } = store.getActions().files;

  const navigate = (routeName, params = {}) => {
	  _navigator.current.dispatch(
	    NavigationActions.navigate({ routeName, params })
	  );
	  _drawer.current.close();
	}

	const navigateOnLoad = () => {
		const resetAction = StackActions.reset({
		  index: 0,
		  actions: [NavigationActions.navigate({ routeName: 'Home' })],
		});
		_navigator.current.dispatch(resetAction);
	}

	useEffect(() => {
		AsyncStorage.multiGet([
			'theme',
			'highlighter',
			'openedFiles',
			'locale'
		])
			.then(array => {
				const {
					theme,
					highlighter,
					openedFiles,
					locale
				} = (array || []).reduce((acc, [ key, value ]) => ({
					...acc,
					[key]: value
				}), {});				
				setTheme({
					selectedTheme: theme || 'obsidian',
					highlighter: highlighter || 'hljs'
				});
				const opf = JSON.parse(openedFiles);
				if (locale) {
					setLocale(locale);
					updateDrawerContent(locale);
				}
	      if (opf && opf.length > 0) {
	      	Promise.all(
	      		opf.map((f, i) =>
	      			readFile(f)
	      				.catch(e => null)
	      		)
	      	)
	      		.then(codeArray => codeArray.filter(x => x))	      		
	      		.then(codeArray =>
	      			codeArray.map((code, i) =>
	      				openFileSchema(
	      					opf[i],
	      					code
	      				)
	      			)
	      		)
	      		.then(op => {
	      			setOpenedFiles(op);
	      			if (op.length != opf.length) {
		      			AsyncStorage.setItem(
					  			'openedFiles',
					  			JSON.stringify(
					  				op.map(o => o.filename)
					  			)
					  		);
					  	}
					  	navigateOnLoad();
	      		})
	      		.catch((e) => {
	      			navigateOnLoad();
	          	AsyncStorage.removeItem('openedFiles');
	      		});
	      } else {
	      	addOpenFile(openFileSchema());
	      	navigateOnLoad();
	      }	      
			});
	}, [false]);	

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
  		<StatusBar
  			backgroundColor={primaryDark}
  			barStyle="dark-content"
  		/>
    	<Drawer
        ref={_drawer}
        content={
        	<DrawerContent
        		menuItems={[
        			{ key: 'Home', label: t('code'), icon: 'code-tags' },
        			{ key: 'Files', label: t('files'), icon: 'file-document-box' },
	            {
	            	key: 'Home',
	            	label: t('new_file'),
	            	icon: 'file-document-edit',
	            	params: { code: '' },
	            	onPress: () => {
	            		addOpenFile(openFileSchema());
	            	}
	            },
	            { key: 'Settings', label: t('settings'), icon: 'settings' },
	            { key: 'About', label: t('about'), icon: 'information' },
	            { key: 'Help', label: t('help'), icon: 'lifebuoy' }
        		]}
        		onPress={navigate}
        	/>
        }
        openDrawerOffset={(viewport) => viewport.width - 206}
        tapToClose
        type="static"
       >
	      <Navigator
	      	ref={_navigator}
	        screenProps={{
	          openDrawer: () => _drawer.current.open(),
	          updateDrawerContent,
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