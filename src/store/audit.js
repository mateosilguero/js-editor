import { action } from "easy-peasy";

export default {
  logs: [],
  log: action((state, payload) => {
    state.logs.push(payload);
  }),
  clearLogs: action((state) => {
    state.logs.length = 0;
  }),
};