describe('Foreign File Test', () => {
  it('open foreign file', async () => {
  	// can't open file from detox. files must be open from Files app
  	// but i can test open the app using the correct extension
		const url = 'content://com.android.externalstorage.documents/document/primary%3Aindex.js';
		await device.launchApp({newInstance: true});
		await device.sendToHome();
		await device.openURL({ url });
  });

  it('cant open app from random extension (asd)', async () => {
  	// can't open file from detox. files must be open from Files app
  	// but i can test open the app using the correct extension
		const url = 'content://com.android.externalstorage.documents/document/primary%3Aindex.asd';
		await device.launchApp({newInstance: true});
		await device.sendToHome();
		try {
	    await device.openURL({ url });
	  } catch (err) {
	  	await expectValue(err.message).toEqual(
	  		'No Activity found to handle Intent { act=android.intent.action.VIEW dat=content://com.android.externalstorage.documents/document/primary:index.asd }'
	  	);
	  }
  });  
});