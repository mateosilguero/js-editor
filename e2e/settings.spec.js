describe('Settings Test', () => {
  it('change theme', async () => {
    await element(by.id('burguer')).tap();
    await element(by.id('Settings')).tap();
    await expect(element(by.text('obsidian'))).toExist();
    await expect(element(by.text('rainbow'))).toNotExist();
    await element(by.id('theme_select')).tap();
    await element(by.text('rainbow')).tap();
    await expect(element(by.text('rainbow'))).toExist();
    await expect(element(by.text('obsidian'))).toNotExist();
  });

  it('change language', async () => {
    await expect(element(by.text('English'))).toExist();
    await expect(element(by.text('Spanish'))).toNotExist();
    await element(by.id('lang_select')).tap();
    await element(by.text('Spanish')).tap();
    await expect(element(by.text('Español'))).toExist();
    await expect(element(by.text('Inglés'))).toNotExist();
  });

  it('preferences should persist after reload', async () => {
    await device.reloadReactNative();
    await element(by.id('burguer')).tap();
    await expect(element(by.text('Código'))).toExist();
    await expect(element(by.text('Archivos'))).toExist();
    await expect(element(by.text('Ayuda'))).toExist();
    await element(by.text('Ajustes')).tap();
    await expect(element(by.text('Español'))).toExist();
    await expect(element(by.text('rainbow'))).toExist();
  });
});
