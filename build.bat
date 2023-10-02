call npm i || exit
call npm run tauri build -- --target x86_64-pc-windows-msvc || exit
REM call npm run tauri build -- --target aarch64-pc-windows-msvc || exit
wsl --exec ./build.sh
