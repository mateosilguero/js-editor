// Rename this sample file to main.js to use on your project.
// The main.js file will be overwritten in updates/reinstalls.

const rn_bridge = require('rn-bridge');
const vm = require('vm');

// Echo every message received from react-native.

let filesPath = __dirname.split("/");
filesPath.pop()
filesPath = filesPath.join("/");

global.alert = (message) => rn_bridge.channel.post('alert', message);
global.console.log = function () {
	rn_bridge.channel.post('log', Object.values(arguments));
}
global.customRequire = (filename) => require(`${filesPath}/${filename}`);

rn_bridge.channel.on('message', (msg) => {
  const sandbox = {
  	console,
  	require: global.customRequire,
  	alert: global.alert
  };
  vm.createContext(sandbox); // Contextify the sandbox.
  try {
  	vm.runInContext(msg.code, sandbox, msg.currentFile || 'anonymous');
  	rn_bridge.channel.post('executed_successfully');
  } catch (e) {
  	console.log(e.stack);
  	rn_bridge.channel.post('codeerror', {
  		name: e.name,
  		message: e.message,
  		stack: e.stack
  	});
  }
});