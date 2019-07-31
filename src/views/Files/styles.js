import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  toolbarText: {
    fontSize: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    textAlignVertical: 'center'
  },
  file: (borderBottomColor) => ({
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor,
    height: 56,
    paddingVertical: 4,
    paddingHorizontal: 16
  }),
  fileName: {
    fontSize: 22
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 128
  },
  emptyStatetext: {
    fontSize: 28
  } 
});