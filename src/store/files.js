import AsyncStorage from '@react-native-community/async-storage';
import { action, thunk, actionOn } from "easy-peasy";

export default {
  savedFiles: [],
	openedFiles: [],
	currentTab: 0,
	setFiles: action((state, payload) => {
    state.savedFiles = payload;
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
  		state.openedFiles.push(payload);
  		state.currentTab = state.openedFiles.length - 1;
  	} else {
  		state.currentTab = index;
  	} 	
  }),
  closeOpenFile: action((state, payload) => {
  	let index = state.openedFiles.map(n => n.filename).indexOf(payload);
  	if (index >= 0) {
  		state.openedFiles.splice(index, 1);
  		state.currentTab = (index || 1) - 1;
  	}
  }),
  persistOpenedFiles: actionOn(
    actions => [
      actions.addOpenFile,
      actions.closeOpenFile
    ],
    (state) =>
      AsyncStorage.setItem(
        'openedFiles',
        JSON.stringify(
          state.openedFiles
            .map(o =>
              o.isForeign ?
              ({ filename: o.filename, foreignPath: o.foreignPath }) :
              o.filename
            )
            .filter(n => n && n != 'untitled')
          )
      )
  )
}