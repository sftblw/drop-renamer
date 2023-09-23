call npm i || exit
call npm run tauri build || exit
wsl --exec ./build.sh
