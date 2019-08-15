/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState, useRef, useEffect } from 'react';
import { StatusBar, DeviceEventEmitter } from 'react-native';
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

const { log, clearLogs } = store.getActions().audit;

const oldLog = console.log;
console.log = function (message) {
  Object.values(arguments)
    .forEach(m => 
    	//null
    	log(m)
   	)
  __DEV__ && oldLog.apply(console, arguments);
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
	const [subscription, setSubscription] = useState(null);
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
		setSubscription(
			DeviceEventEmitter.addListener('openFile', function(e) {
		    readFile(e.path, true)
		    	.then(code =>
		    		addOpenFile(
			    		openFileSchema(
			    			e.name,
							  code,
							  code,
							  true,
							  e.path
			    		)
			    	)
		    	)
		    	.catch(console.log)
		  })
		);
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
	      			readFile(
	      				f.foreignPath || f,
	      				f.foreignPath !== undefined
	      			)
	      			.catch(() => null)
	      		)
	      	)
	      		.then(codeArray => codeArray.filter(x => x))	      			      		
	      		.then(codeArray => {
	      			if (codeArray.length) {
		      			codeArray.map((code, i) =>
		      				addOpenFile(
		      					openFileSchema(
			      					opf[i].filename || opf[i],
			      					code,
			      					code,
			      					opf[i].foreignPath,
			      					opf[i].foreignPath
			      				)
			      			)
		      			)
		      		} else {
		      			addOpenFile(openFileSchema())
		      		}
	      		})
	      		.catch((e) =>
	          	AsyncStorage.removeItem('openedFiles')
	      		)
	      		.finally(navigateOnLoad);
	      } else {
	      	addOpenFile(openFileSchema());
	      	navigateOnLoad();
	      }
			})
			.finally(clearLogs);
			return () => {
				subscription && subscription.remove();
			}
	}, []);

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