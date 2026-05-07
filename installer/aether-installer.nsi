; Aether AI Installer Script
; NSIS Modern UI

!include "MUI2.nsh"

; Configuration
!define APP_NAME "Aether AI IDE"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "Aether AI"
!define APP_URL "https://aether-ai.com"
!define APP_EXECUTABLE "app.exe"
!define INSTALL_PATH "$PROGRAMFILES\Aether AI IDE"

; Request admin privileges
RequestExecutionLevel admin

; Set compression
SetCompressor /SOLID lzma

; General
Name "${APP_NAME}"
OutFile "AetherAI-Setup.exe"
InstallDir "${INSTALL_PATH}"
InstallDirRegKey HKLM "Software\Aether AI IDE" "InstallPath"
ShowInstDetails show
ShowUnInstDetails show

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "icons\icon.ico"
!define MUI_UNICON "icons\icon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

; Installer Sections
Section "Main Application" SecMain
    SectionIn RO
    
    SetOutPath "$INSTDIR"
    
    ; Download and install main application
    DetailPrint "Downloading Aether AI IDE..."
    nsisdl::download https://releases.aether-ai.com/v${APP_VERSION}/manifest.json "$INSTDIR\manifest.json"
    Pop $0
    StrCmp $0 "success" download_success
        DetailPrint "Failed to download manifest"
        Abort
    
    download_success:
    DetailPrint "Download complete. Installing application files..."
    
    ; Read manifest and download chunks
    FileOpen $0 "$INSTDIR\manifest.json" "r"
    FileRead $0 $1
    FileClose $0
    
    ; Create installation directory structure
    CreateDirectory "$INSTDIR\bin"
    CreateDirectory "$INSTDIR\resources"
    CreateDirectory "$INSTDIR\data"
    
    ; Copy application files (in production, this would be assembled from chunks)
    DetailPrint "Installing application files..."
    File /r "dist\*.*" "$INSTDIR\"
    
    ; Create shortcuts
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0
    CreateShortCut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0
    
    ; Write registry keys
    WriteRegStr HKLM "Software\Aether AI IDE" "InstallPath" "$INSTDIR"
    WriteRegStr HKLM "Software\Aether AI IDE" "Version" "${APP_VERSION}"
    WriteRegStr HKLM "Software\Aether AI IDE" "DisplayName" "${APP_NAME}"
    
    ; Write uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    
    ; Add uninstaller to Add/Remove Programs
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayName" "${APP_NAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayVersion" "${APP_VERSION}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "Publisher" "${APP_PUBLISHER}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "URLInfoAbout" "${APP_URL}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "NoRepair" 1
    
    DetailPrint "Installation complete!"
SectionEnd

; Optional Components
Section "Desktop Shortcut" SecDesktop
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0
SectionEnd

Section "Start Menu Shortcut" SecStartMenu
    CreateShortCut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0
SectionEnd

; Uninstaller Section
Section "Uninstall"
    
    ; Remove shortcuts
    Delete "$DESKTOP\${APP_NAME}.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}.lnk"
    
    ; Remove files and directories
    RMDir /r "$INSTDIR\bin"
    RMDir /r "$INSTDIR\resources"
    RMDir /r "$INSTDIR\data"
    Delete "$INSTDIR\${APP_EXECUTABLE}"
    Delete "$INSTDIR\manifest.json"
    Delete "$INSTDIR\Uninstall.exe"
    RMDir "$INSTDIR"
    
    ; Remove registry keys
    DeleteRegKey HKLM "Software\Aether AI IDE"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
    
    DetailPrint "Uninstallation complete!"
SectionEnd

; Functions
Function .onInit
    ; Check if already installed
    ReadRegStr $0 HKLM "Software\Aether AI IDE" "InstallPath"
    StrCmp $0 "" done
    
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "${APP_NAME} is already installed. $\n$\nClick OK to remove the previous version or Cancel to abort." IDOK uninstall
    Abort
    
    uninstall:
    ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString"
    ExecWait '$0 _?=$INSTDIR'
    
    done:
FunctionEnd

; Language Strings
LangString DESC_SecMain ${LANG_ENGLISH} "Install the main Aether AI IDE application"
LangString DESC_SecDesktop ${LANG_ENGLISH} "Create a desktop shortcut"
LangString DESC_SecStartMenu ${LANG_ENGLISH} "Create a Start Menu shortcut"

; Assign language strings to sections
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} $(DESC_SecMain)
    !insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} $(DESC_SecDesktop)
    !insertmacro MUI_DESCRIPTION_TEXT ${SecStartMenu} $(DESC_SecStartMenu)
!insertmacro MUI_FUNCTION_DESCRIPTION_END
