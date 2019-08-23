package com.JSand;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "JSand";
  }

  @Override
  protected void onResume() {
    super.onResume();
    Uri data = getIntent().getData();
    if(data != null) {
      try {
        importData(data);
      } catch (Exception e) {
        Log.e("File Import Error", e.getMessage());
      }
    }
  }

  private void importData(Uri data) {
    final String scheme = data.getScheme();

    if (ContentResolver.SCHEME_CONTENT.equals(scheme)) {
      try {
        ContentResolver cr = getApplicationContext().getContentResolver();

        String name = getContentName(cr, data);

        WritableMap resultData = new WritableNativeMap();
        resultData.putString("name", name);
        resultData.putString("path", data.toString());

        getReactInstanceManager().getCurrentReactContext()
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("openFile", resultData);
      } catch (Exception e) {
        Log.e("File Import Error", e.getMessage());
      }
    }
  }

  private String getContentName(ContentResolver resolver, Uri uri) {
    String name = null;
    Cursor cursor = resolver.query(uri, null, null, null, null);     
    cursor.moveToFirst();
    int nameIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME);    
    if (nameIndex >= 0) {
      name = cursor.getString(nameIndex);
    }
    cursor.close();
    return name;   
  }
}
