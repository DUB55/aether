@echo off
cd /d "%~dp0"
node node_modules\jest\bin\jest.js ai-chat-preservation.test.js --verbose
