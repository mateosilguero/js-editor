import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import I18n from "i18n-js";
import en from './en'; 
import es from './es';

const defaultLocale = "en";

const translationGetters = {
  en,
  es
};

const stringifyKeys = (obj) => JSON.stringify(Object.keys(obj));

if (
	__DEV__ &&
	Object.values(
		translationGetters
	).some(x =>
		stringifyKeys(x) !==
		stringifyKeys(translationGetters[defaultLocale])
	)
) {
	alert("MISSING TRANSLATIONS");
}

I18n.missingTranslation = (key) => __DEV__ && alert("missing translation: " + key);

const findBestAvailableLanguage = () => {
	const deviceLanguage =
	  Platform.OS === 'ios'
	    ? NativeModules.SettingsManager.settings.AppleLocale
	    : NativeModules.I18nManager.localeIdentifier;
	const lang = deviceLanguage.split('_')[0];
	return (
		Object.keys(translationGetters)
			.includes(lang) ?
				lang :
				defaultLocale
	)
}

const setConfig = (locale) => {
	I18n.translations = {
		[locale]: translationGetters[locale]
	};
	I18n.locale = locale;
}

setConfig(findBestAvailableLanguage());

export const t = (key, config) => I18n.t(key, config);
export const setLocale = setConfig;
export const getLocale = () => I18n.locale;
export const availableLanguages = Object.keys(translationGetters);