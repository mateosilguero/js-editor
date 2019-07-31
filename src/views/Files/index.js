import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, BackHandler, ActivityIndicator } from 'react-native';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Prompt from '../../components/Prompt';
import Toolbar from '../../components/Toolbar';
import { getAllFiles, readFile, mkdir, removeFile } from '../../utils/FSManager';
import { openFileSchema } from '../../utils/helpers.js';
import { t } from '../../i18n';
import styles from './styles.js';
import navigationOptions from './navigationOptions.js';

const Files = ({ navigation }) => {
  const {
    primary,
    textcolor
  } = useStoreState(store => store.preferences.theme);
  const { savedFiles: files } = useStoreState(store => store.files);
  const { setFiles, addOpenFile, closeOpenFile } = useStoreActions(actions => actions.files);
  const [ currentPath, setCurrentPath ] = useState([]);
  const [ promptVisible, setPromptState ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ filesCount, setFilesCount ] = useState(0);
  const joinedPath = currentPath.join('/');

  const getFName = (fname) => joinedPath ? `${joinedPath}/${fname}` : fname;

  const getFiles = (path) => {
    setLoading(true);
    getAllFiles(path)
      .then(f => 
        (f || []).sort((a, b) => a.isFile() ? 1 : -1)
      )
      .then(f => {
        setFilesCount(
          f.filter(
            current => current.isFile()
          ).length
        );
        return f;
      })
      .then(setFiles)
      .finally(() => setLoading(false));
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
      newFile,
      newFolder: () => setPromptState(true)
    });
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, [joinedPath]);

  useEffect(() => {
    getFiles();
  }, []);

  const confirmDelete = (filename, isFile) => {
    const fname = getFName(filename);
    Alert.alert(
      t('remove_alert_title', { fname }),
      t(
        isFile ?
          'remove_alert_body' :
          'remove_alert_body_folder',
        { filename }
      ),
      [
        {
          text: t('remove_alert_cancel'),
          style: 'cancel',
        },
        { 
          text: t('remove_alert_delete'),
          onPress: () =>
            removeFile(fname)
              .then(() => {
                closeOpenFile(fname);
                alert(t('remove_alert_deleted', { fname }));
                getFiles(joinedPath);
              })
              .catch(() =>
                alert(t('remove_alert_delete_error', { fname }))
              )
        },
      ],
      { cancelable: false }
    );
  }

  return (
    <View>
      <Prompt
        title={t('folder_prompt_title')}
        placeholder="..."
        visible={promptVisible}
        onClose={() => setPromptState(false)}
        onSubmit={(foldername) => {
          const fname = getFName(foldername);
          mkdir(fname)
            .then(() => getFiles(joinedPath))
            .catch(() =>
              alert(t('remove_alert_creating_error', { foldername }))
            );
          setPromptState(false);          
        }}
      />
      <Toolbar backgroundColor={primary}>
        <Text style={styles.toolbarText}>
          / { currentPath.join(' / ') }
        </Text>
        <Text style={styles.toolbarText}>
          {`${filesCount} ${t('files').toLowerCase()}, ${files.length - filesCount} ${t('folders')}`}
        </Text>
      </Toolbar>
      {
        loading ?
          <View style={styles.emptyState}>
            <ActivityIndicator size={64} color={primary} />
          </View> :
          <FlatList
            data={files}
            contentContainerStyle={{ paddingBottom: 64 }}
            keyExtractor={(item, index) => `${index}`}
            renderItem={({ item: file, index }) =>
              <TouchableOpacity
                key={index}
                style={styles.file(textcolor)}
                onPress={() => {
                  const fname = getFName(file.name);
                  if (file.isFile()) {
                    readFile(fname)
                      .then(code => {
                        addOpenFile(openFileSchema(fname, code));
                        navigation.navigate('Home', { code });
                      })
                      .catch((e) =>
                        alert(t('remove_alert_opening_error', { fname }))
                      )
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
                      file.name.includes('.js') ? 'nodejs': 'file' :
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
                <Icon name='folder-open' size={52} />
                <Text style={styles.emptyStatetext}>{t('no_files')}</Text>
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
                  <Text style={{ fontSize: 16, color: textcolor }}>
                    <Icon name='plus-circle-outline' size={16} /> {t('add_new_file')}
                  </Text>
                </TouchableOpacity>
              </View>
            }
            ListFooterComponent={
              files.length > 0 &&
                <Text style={{ textAlign: 'center', margin: 16 }}>
                  <Icon name='delete' size={16} /> {t('long_press_to_remove')}
                </Text>
            }
          />
        }
    </View>
  );
}

Files.navigationOptions = navigationOptions;

export default Files;