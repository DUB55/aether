@echo off
cd /d "%~dp0"
node node_modules\jest\bin\jest.js clipboard-preservation.test.js --verbose
