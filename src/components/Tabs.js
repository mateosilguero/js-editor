import React from 'react';
import { Text } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useStoreState, useStoreActions } from 'easy-peasy';

const Tabs = ({ currentTab, openedFiles, setCurrentTab }) => {
  const theme = useStoreState(store => store.preferences.theme);
  const {
    theme: { primary, textcolor },
    themeColors: { highlightColor }
  } = useStoreState(store => store.preferences);
  const closeOpenFile = useStoreActions(actions => actions.files.closeOpenFile);

  const renderTitle = (index) => {
    const {
      code,
      filename,
      foreignPath,
      initialState,
      isForeign,
    } = openedFiles[index];
    const path = isForeign && decodeURIComponent(foreignPath);
    const title = isForeign ?
      '.../'+filename :
      (filename || 'untitled');
    return title + (code !== initialState ? '*' : '');
  }

  return (
  	<TabView
      navigationState={{
        index: currentTab,
        routes: openedFiles.map((c, i) => ({
          key: i,
          title: c.filename
        }))
      }}
      renderScene={() => null}
      onIndexChange={setCurrentTab}
      sceneContainerStyle={{ height: 0, flex: 1 }}
      style={{ maxHeight: 48 }}
      renderTabBar={props =>
        <TabBar
          {...props}
          scrollEnabled
          onTabLongPress={({ route }) => closeOpenFile(route.title)}
          indicatorStyle={{
            backgroundColor: highlightColor,
            height: 3
          }}
          style={{
            backgroundColor: primary,
            height: 48
          }}
          renderLabel={({ route }) => (
            <Text
              style={{
                color: textcolor,
                fontSize: 17,
                fontWeight: 'bold'
              }}
            >
              {renderTitle(route.key)}
            </Text>
          )}
        />
      }
    />
  );
};

export default Tabs;