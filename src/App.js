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
import { createStackNavigator, createAppContainer, createSwitchNavigator, NavigationActions, StackActions } from 'react-navigation';
import { fromRight } from 'react-navigation-transitions';
import Drawer from 'react-native-drawer';
import SplashScreen from './routes/SplashScreen';
import Home from './routes/Home';
import Console from './routes/Console';
import Settings from './routes/Settings';
import Files from './routes/Files';
import About from './routes/About';
import Help from './routes/Help';
import DrawerContent from './components/DrawerContent';
import { StoreProvider, createStore } from 'easy-peasy';
import storeModel from './store';
import themes from './utils/themes';
import { openFileSchema } from './utils/helpers.js';
import { readFile } from './utils/FSManager';

const store = createStore(storeModel);

var oldLog = console.log;
console.log = function (message) {
  Object.values(arguments)
    .forEach(m => 
    	//null
    	store.getActions().log(m)
   	)
  oldLog.apply(console, arguments);
}

const { primary, primaryDark, maincolor } = store.getState().theme;

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
    headerTintColor: maincolor,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  },
});

const Navigator = createAppContainer(MainNavigator);

function App() {
	const _navigator = useRef(null);
	const _drawer = useRef(null);
	const setTheme = store.getActions().setTheme;
	const addOpenFile = store.getActions().addOpenFile;
	const setOpenedFiles = store.getActions().setOpenedFiles;

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
			'openedFiles'
		])
			.then(array => {
				const {
					theme: t,
					highlighter,
					openedFiles
				} = (array || []).reduce((acc, [ key, value ]) => ({
					...acc,
					[key]: value
				}), {});				
				setTheme({
					selectedTheme: t || 'obsidian',
					highlighter: highlighter || 'hljs'
				});
				const opf = JSON.parse(openedFiles);
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
        			{ key: 'Home', label: 'Code', icon: 'code-tags' },
        			{ key: 'Files', label: 'Files', icon: 'file-document-box' },
	            {
	            	key: 'Home',
	            	label: 'New File',
	            	icon: 'file-document-edit',
	            	params: { code: '' },
	            	onPress: () => {
	            		addOpenFile(openFileSchema());
	            	}
	            },
	            { key: 'Settings', label: 'Settings', icon: 'settings' },
	            { key: 'About', label: 'About', icon: 'information' },
	            { key: 'Help', label: 'Help', icon: 'lifebuoy' }
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