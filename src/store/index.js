import AsyncStorage from '@react-native-community/async-storage';
import { action, computed } from 'easy-peasy';
import themes from '../utils/themes';

const storeModel = {
	files: [],
	openedFiles: [],
	currentTab: 0,
	setFiles: action((state, payload) => {
    state.files = payload;
  }),
  setOpenedFiles: action((state, payload) => {
    state.openedFiles = payload;
  }),
  setCurrentTab: action((state, payload) => {  	
    state.currentTab = payload;
  }),
  addOpenFile: action((state, payload) => {
  	let index = state.openedFiles.map(n => n.filename).indexOf(payload.filename);
  	if (index < 0) {
  		state.openedFiles = [ ...state.openedFiles, payload ];
  		state.currentTab = state.openedFiles.length - 1;
  		AsyncStorage.setItem(
  			'openedFiles',
  			JSON.stringify(
  				state.openedFiles
  					.map(o => o.filename)
  					.filter(n => n && n != 'untitled')
  				)
  		);
  	} else {
  		state.currentTab = index;
  	} 	
  }),
  closeOpenFile: action((state, payload) => {
  	let index = state.openedFiles.map(n => n.filename).indexOf(payload);
  	if (index >= 0) {
  		state.openedFiles.splice(index, 1);
  		state.currentTab = (index || 1) - 1;
  		AsyncStorage.setItem(
  			'openedFiles',
  			JSON.stringify(
  				state.openedFiles
  					.map(o => o.filename)
  					.filter(n => n && n != 'untitled')
  				)
  		);
  	}
  }),
  logs: [],
  log: action((state, payload) => {
    state.logs.push(payload);
  }),
  clearLogs: action((state) => {
    state.logs.length = 0;
  }),
	themeColors: computed(state => {
		const { theme: { highlighter, selectedTheme, pre } } = state;
		const styles = themes[highlighter][selectedTheme];
		const { background, backgroundColor, color } = styles['hljs'] || styles[pre];
		const { color: keywordColor } = styles['hljs-keyword'] || styles['keyword'];
		return ({
			color,
			backgroundColor: background || backgroundColor,
			highlightColor: keywordColor
		})
	}),
	setTheme: action((state, { highlighter, selectedTheme }) => {
		AsyncStorage.multiSet([['theme', selectedTheme], ['highlighter', highlighter]]);
		const styles = themes[highlighter][selectedTheme];			
		if (styles[state.theme.pre]) {
			styles[state.theme.pre].padding = '0em';
		}
    state.theme = {
    	...state.theme,
    	highlighter,
    	selectedTheme,
    	styles,
    };
  }),
  theme: {
		primary: '#ffe45e',
		primaryDark: '#fdd835',
		maincolor: '#222',
		styles: themes['hljs']['obsidian'],
		highlighter: 'hljs',
		selectedTheme: 'tomorrow',
		pre: 'pre[class*="language-"]'
	},
	codeShortcuts: [
    { key: '	', label: 'TAB' },
    { key: '{\n}', label: '{ }' },
    { key: '[]', label: '[ ]' },
    { key: '()', label: '( )' },
    { key: ';', label: ';' },
    { key: ':', label: ':' },
    { key: '.', label: '.' },
    { key: '""', label: '"' },
    { key: '// ', label: '//' },
    { key: '!', label: '!' }
  ]
};

export default storeModel;