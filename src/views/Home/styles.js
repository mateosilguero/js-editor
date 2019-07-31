import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: (backgroundColor) => ({
    flex: 1,
    justifyContent: 'center',
    backgroundColor
  }),
  codeContainer: (color) => ({
    flex: 1,
    flexDirection: 'row',
    borderTopRadius: 4,
    borderTopWidth: 0.5,
    borderTopColor: color
  }),
  filename: {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 8
  },
  inputView: (backgroundColor) => ({
    backgroundColor,
    flex: 1,
    overflow: 'visible'
  }),
  input: (backgroundColor, color) => ({
    padding: 8,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    width: '100%',
    overflow: 'scroll',
    backgroundColor,
    color
  }),
  codeIndex: (backgroundColor, color) => ({
    paddingHorizontal: 8,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    backgroundColor,
    color
  })
});