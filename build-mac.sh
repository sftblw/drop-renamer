#!/bin/bash

# https://stackoverflow.com/a/36562128
. ~/.nvm/nvm.sh
. ~/.profile
. ~/.bashrc


nvm use
npm i

rustup target add aarch64-apple-darwin
rustup target add x86_64-apple-darwin

# npm run tauri build -- --target aarch64-apple-darwin
# npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target universal-apple-darwin