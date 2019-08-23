const { filename, consoleLog, untitled, hello } = require('./constants.js');

describe('Code Test', () => {
  it('run code', async () => {
    await expect(element(by.text(untitled)).atIndex(0)).toExist();
    await expect(element(by.id('code_view'))).toExist();
    await element(by.id('code_view')).tap();
    await expect(element(by.id('code_input'))).toExist();
    await expect(element(by.id('code_view'))).toNotExist();
    await element(by.id('code_input')).typeText(consoleLog);
    await element(by.id('comment')).tap();
    await expect(element(by.id('code_input'))).toHaveText(`// ${consoleLog}`);
    await element(by.id('undo')).tap();
    await expect(element(by.id('code_input'))).toHaveText(consoleLog);
    await element(by.id('options_menu')).tap();
    await element(by.text('Run')).tap();
  });

  it('clear console', async () => {
    await expect(element(by.text(hello))).toExist();
    await element(by.id('clear_logs')).tap();
    await expect(element(by.text(hello))).toNotExist();
    await device.pressBack(); // android only
  });
});
