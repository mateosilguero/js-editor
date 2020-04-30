import FastStorage from 'react-native-fast-storage';
import {action, computed} from 'easy-peasy';
import {extend} from 'consistencss';
import themes from '../utils/themes';
import {getLocale, setLocale} from '../i18n';

extend({
  colors: {
    color: '#000',
    primary: '#ffe45e',
    primarydark: '#fdd835',
    textcolor: '#222',
  },
});

export default {
  locale: getLocale(),
  setLocale: action((state, payload) => {
    FastStorage.setItem('locale', payload);
    setLocale(payload);
    state.locale = payload;
  }),
  themeColors: computed((state) => {
    const {
      theme: {highlighter, selectedTheme, pre},
    } = state;
    const styles = themes[highlighter][selectedTheme];
    const {background, backgroundColor, color} = styles['hljs'] || styles[pre];
    const {color: keywordColor} = styles['hljs-keyword'] || styles['keyword'];
    extend({
      colors: {
        color,
        backgroundcolor: background || backgroundColor,
        highlightColor: keywordColor,
      },
    });
    return {
      color,
      backgroundColor: background || backgroundColor,
      highlightColor: keywordColor,
    };
  }),
  setTheme: action((state, {highlighter, selectedTheme}) => {
    FastStorage.setItem('theme', selectedTheme);
    FastStorage.setItem('highlighter', highlighter);
    const styles = themes[highlighter][selectedTheme];
    if (styles[state.theme.pre]) {
      styles[state.theme.pre].padding = '0em';
    }
    // can't use destructuring here
    // https://easy-peasy.now.sh/docs/api/action.html#don-t-destructure-the-state-argument
    state.theme.highlighter = highlighter;
    state.theme.selectedTheme = selectedTheme;
    state.theme.styles = styles;
  }),
  theme: {
    primary: '#ffe45e',
    primaryDark: '#fdd835',
    textcolor: '#222',
    styles: themes['hljs']['obsidian'],
    highlighter: 'hljs',
    selectedTheme: 'tomorrow',
    pre: 'pre[class*="language-"]',
  },
  codeShortcuts: [
    {key: '	', label: 'TAB'},
    {key: '{\n}', label: '{ }'},
    {key: '[]', label: '[ ]'},
    {key: '()', label: '( )'},
    {key: ';', label: ';'},
    {key: ':', label: ':'},
    {key: '.', label: '.'},
    {key: '""', label: '"'},
    {key: '``', label: '`'},
    {key: '/', label: '/'},
    {key: '// ', label: '//'},
    {key: '!', label: '!'},
  ],
};
