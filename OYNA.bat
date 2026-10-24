@echo off
rem Gelistirme surumunu masaustu penceresinde acar (kurulum gerekmez)
cd /d "%~dp0"
if exist "node_modules\electron\dist\electron.exe" (
  start "" "node_modules\electron\dist\electron.exe" .
) else (
  echo Electron kurulu degil. Once bu klasorde "npm install" calistirilmali.
  pause
)
