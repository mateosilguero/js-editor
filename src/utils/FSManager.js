import RNFS from 'react-native-fs';

const docpath = (path = '') => `${RNFS.DocumentDirectoryPath}/${path}`;

export const readFile = (fileName, isForeign) =>
  RNFS.readFile(isForeign ? fileName : docpath(fileName), 'utf8');

export const removeFile = (fileName) => RNFS.unlink(docpath(fileName));

export const mkdir = (dirpath) => RNFS.mkdir(docpath(dirpath));

export const saveFile = (fileName, content, isForeign) =>
  RNFS.writeFile(
    isForeign ? fileName : docpath(fileName),
    content,
    'utf8',
  ).catch((err) => {
    const slash = '/';
    if (fileName.includes(slash)) {
      let arr = fileName.split(slash);
      arr.pop();
      let dirpath;
      Promise.all(
        arr.map((dirName, index) => {
          dirpath = dirpath ? `${dirpath}/${dirName}` : docpath(dirName);
          return RNFS.mkdir(dirpath);
        }),
      )
        .then((res) => {
          saveFile(fileName, content);
        })
        .catch((err) => {
          console.log(err.message, err.code);
        });
    }
  });

const notAllowedfiles = ['ReactNativeDevBundle.js', 'sonar', 'mmkv'];

export const getAllFiles = (path) =>
  RNFS.readDir(docpath(path))
    .then((result) => result.filter((r) => !notAllowedfiles.includes(r.name)))
    .catch((err) => {
      console.log(err.message, err.code);
    });
