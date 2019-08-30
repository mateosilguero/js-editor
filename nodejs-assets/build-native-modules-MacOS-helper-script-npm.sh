#!/bin/bash
      # Helper script for Gradle to call npm on macOS in case it is not found
      export PATH=$PATH:/Users/mateosilguero/.nvm/versions/node/v11.4.0/lib/node_modules/npm/node_modules/npm-lifecycle/node-gyp-bin:/Users/mateosilguero/Documents/jseditor/node_modules/nodejs-mobile-react-native/node_modules/.bin:/Users/mateosilguero/Documents/jseditor/node_modules/.bin:/Users/mateosilguero/.nvm/versions/node/v11.4.0/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/go/bin:/usr/local/share/dotnet:/opt/X11/bin:~/.dotnet/tools:/Users/mateosilguero/Library/Android/sdk/emulator:/Users/mateosilguero/Library/Android/sdk/tools:/Users/mateosilguero/Library/Android/sdk/tools/bin:/Users/mateosilguero/Library/Android/sdk/platform-tools
      npm $@
    