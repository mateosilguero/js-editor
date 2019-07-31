import React from 'react';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { useStoreState } from 'easy-peasy';

const Code = ({ children }) => {
  const theme = useStoreState(store => store.preferences.theme);
  return (
  	<SyntaxHighlighter 
      language='javascript' 
      style={theme.styles}
      fontSize={17}
      highlighter={theme.highlighter}                
    >
      {children}
    </SyntaxHighlighter>
  );
};

export default Code;