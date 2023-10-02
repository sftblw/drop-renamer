#!/bin/bash

# https://stackoverflow.com/a/36562128
. ~/.nvm/nvm.sh
. ~/.profile
. ~/.bashrc


nvm use
npm i
npm run tauri build -- --target x86_64-unknown-linux-gnu