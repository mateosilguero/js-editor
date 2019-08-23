const { folder, filename, untitled, consoleLog } = require('./constants.js');

const path = `${folder}/${filename}`;

describe('File System Test', () => {
  it('create folder', async () => {
    await element(by.id('burguer')).tap();
    await element(by.id('Files')).tap();
    await expect(element(by.id('files_counter'))).toHaveText('0 files, 0 folders');
    await element(by.id('new_folder')).tap();
    await element(by.id('modal_input')).clearText();
    await element(by.id('modal_input')).typeText(folder);
    await element(by.id('modal_submit')).tap();
    await expect(element(by.id('files_counter'))).toHaveText('0 files, 1 folders');
  })

  it('create file inside folder', async () => {
    await element(by.text(folder)).tap();
    await expect(element(by.id('files_counter'))).toHaveText('0 files, 0 folders');
    await element(by.id('new_file')).tap();
    await element(by.id('code_view')).tap();
    await expect(element(by.id('code_input'))).toExist();
    await expect(element(by.id('code_view'))).toNotExist();
    await element(by.id('code_input')).typeText(consoleLog);
    await element(by.id('options_menu')).tap();
    await element(by.text('Save')).tap();
    await element(by.id('modal_input')).clearText();
    await element(by.id('modal_input')).typeText(path);
    await element(by.id('modal_submit')).tap();
    await expect(element(by.id(path)).atIndex(0)).toExist();
    await element(by.id('burguer')).tap();
    await element(by.id('Files')).tap();
    await element(by.text(folder)).tap();
    await expect(element(by.id('files_counter'))).toHaveText('1 files, 0 folders');
  });

  it('opened files should persist', async () => {
    await device.reloadReactNative();
    await expect(element(by.text(path)).atIndex(0)).toExist();
    await expect(element(by.text(consoleLog))).toExist();
    await expect(element(by.text(untitled)).atIndex(0)).toNotExist();
  })

  it('open a new file', async () => {
    await element(by.id('burguer')).tap();
    await element(by.id('New File')).tap();
    await expect(element(by.text(untitled)).atIndex(0)).toExist();
  })

  it('test.js will close on longpress', async () => {
    await device.reloadReactNative();
    await element(by.text(path)).atIndex(0).longPress();
    await expect(element(by.text(path)).atIndex(0)).toNotExist();
    await expect(element(by.text(consoleLog))).toNotExist();
    await expect(element(by.text(untitled)).atIndex(0)).toNotExist();    
  })

  it('on remove folder, will remove inner files', async () => {
    await element(by.id('burguer')).tap();
    await element(by.id('Files')).tap();
    await element(by.text(folder)).tap();
    await element(by.text(filename)).tap();
    await element(by.id('burguer')).tap();
    await element(by.id('Files')).tap();
    await element(by.text(folder)).atIndex(0).longPress();
    await element(by.text('DELETE')).tap();
    await element(by.text('OK')).tap();
    await element(by.id('burguer')).atIndex(0).tap();
    await element(by.id('Code')).tap();
    await expect(element(by.text(path)).atIndex(0)).toNotExist();
  })
});