import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, FlatList, BackHandler, Button, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import HeaderButton from '../components/HeaderButton';
import Prompt from '../components/Prompt';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { getAllFiles, readFile, mkdir, removeFile } from '../utils/FSManager';
import { openFileSchema } from '../utils/helpers.js';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Files = ({ navigation, screenProps }) => {
  const { openDrawer } = screenProps;
  const { files, theme: { primary, maincolor }, themeColors: { highlightColor } } = useStoreState(store => store);
  const setFiles = useStoreActions(actions => actions.setFiles);
  const addOpenFile = useStoreActions(actions => actions.addOpenFile);
  const closeOpenFile = useStoreActions(actions => actions.closeOpenFile);
  const [ currentPath, setCurrentPath ] = useState([]);
  const [ promptVisible, setPromptState ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const joinedPath = currentPath.join('/');

  const getFName = (fname) => joinedPath ? `${joinedPath}/${fname}` : fname;

  const getFiles = (path) => {
    setLoading(true);
    getAllFiles(path)
      .then(f => 
        (f || []).sort((a, b) => a.isFile() ? 1 : -1)
      )
      .then(setFiles)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }

  const handleBack = () => {
    if (joinedPath) {
      let pathCopy = [ ...currentPath ];
      pathCopy.pop();
      setCurrentPath(pathCopy);
      getFiles(pathCopy.join('/'));
      return true;
    }
  };

  const newFile = () => {
    const fname = getFName('');
    addOpenFile(openFileSchema(fname));
    navigation.navigate('Home');
  };

  useEffect(() => {
    navigation.setParams({
      openDrawer,
      newFile,
      newFolder: () => setPromptState(true),
      highlightColor
    });    
  }, [highlightColor, joinedPath]);

  useEffect(() => {
    getFiles();
  }, [highlightColor]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  })  

  const confirmDelete = (filename, isFile) => {
    const fname = getFName(filename);
    Alert.alert(
      'Delete ' + fname,
      `Are you sure ? ${!isFile ? 
        `${filename} is a directory, and this action will remove every file and folder inside.`
        : ''}`,
      [
        {
          text: 'CANCEL',
          style: 'cancel',
        },
        { 
          text: 'DELETE',
          onPress: () =>
            removeFile(fname)
              .then(() => {
                closeOpenFile(fname);
                alert(fname + ' removed.');
                getFiles(joinedPath);
              })
              .catch(() => alert('Error on remove ' + fname))
        },
      ],
      { cancelable: false }
    );
  }

  const countFilesTypes = () => {
    const [
      filesCount,
      foldersCount
    ] = (files || []).reduce((acc, current) => {
      if (current.isFile()) {
        acc[0]++;
      } else {
        acc[1]++;
      }
      return acc;
    }, [0, 0]);
    return `${filesCount} files, ${foldersCount} folders`;
  }

  return (
    <View>
      <Prompt
        title="New Folder:"
        placeholder="folder name"
        visible={promptVisible}
        onClose={() => setPromptState(false)}
        onSubmit={(foldername) => {
          const fname = getFName(foldername);
          mkdir(fname)
            .then(() => getFiles(joinedPath))
            .catch(() =>
              alert('Error creating '+foldername)
            );
          setPromptState(false);          
        }}
      />
      <View 
        style={styles.toolbar(primary)}
      >
        <Text style={styles.toolbarText}>
          / { currentPath.join(' / ') }
        </Text>
        <Text style={styles.toolbarText}>
          { countFilesTypes() }
        </Text>
      </View>
      <FlatList
        data={files}
        contentContainerStyle={{ paddingBottom: 64 }}
        keyExtractor={(item, index) => `${index}`}
        renderItem={({ item: file, index }) =>
          <TouchableOpacity
            key={index}
            style={styles.file(maincolor)}
            onPress={() => {
              const fname = getFName(file.name);
              if (file.isFile()) {
                readFile(fname)
                  .then(code => {
                    addOpenFile(openFileSchema(fname, code));
                    navigation.navigate('Home', { code });
                  })
                  .catch((e) => alert('Error on open ' + fname))
              } else {
                getFiles(fname);
                setCurrentPath([ ...currentPath, file.name ]);
              }
            }}
            onLongPress={() => confirmDelete(file.name, file.isFile())}
          >
            <Icon
              name={
                file.isFile() ?
                  file.name.includes('js') ? 'nodejs': 'file' :
                  'folder'
              }
              style={{ fontSize: 28, marginRight: 16 }}
            />
            <Text style={styles.fileName}>
              {file.name}
            </Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {
              loading ?
                <ActivityIndicator size={64} color={primary} /> :
                <React.Fragment>
                  <Icon name='folder-open' size={52} />
                  <Text style={styles.emptyStatetext}>No Files</Text>
                  <TouchableOpacity
                    onPress={newFile}
                    style={{
                      backgroundColor: primary,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      elevation: 2,
                      borderRadius: 2,
                      marginTop: 16
                    }}>
                    <Text style={{ fontSize: 16, color: maincolor }}>
                      <Icon name='plus-circle-outline' size={16} /> Add new file
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
            }
          </View>
        }
        ListFooterComponent={
          files.length > 0 &&
            <Text style={{ textAlign: 'center', margin: 16 }}>
              <Icon name='delete' size={16} /> Long press to remove
            </Text>
        }
      />
    </View>
  );
}

Files.navigationOptions = ({ navigation, navigationOptions }) => ({
  title: 'Saved Files',
  headerRight: (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <HeaderButton
        underlayColor={navigation.getParam('highlightColor')}
        onPress={navigation.getParam('newFile')}
        name="file-document-edit"
      />
      <HeaderButton
        underlayColor={navigation.getParam('highlightColor')}
        onPress={navigation.getParam('newFolder')}
        name="folder-plus"
        style={{ marginRight: 8, marginLeft: 8 }}
      />
    </View>
  ),
  headerLeft: (
    <HeaderButton
      underlayColor={navigation.getParam('highlightColor')}
      onPress={navigation.getParam('openDrawer')}
      name="menu"
      style={{ marginLeft: 8 }}
    />
  ),
  headerStyle: {
    ...navigationOptions.headerStyle,
    shadowOpacity: 0,
    shadowOffset: {
      height: 0
    },
    shadowRadius: 0,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    elevation: 0
  },
});

const styles = StyleSheet.create({
  toolbar: (backgroundColor) => ({
    height: 48,
    elevation: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor
  }),
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

export default Files;