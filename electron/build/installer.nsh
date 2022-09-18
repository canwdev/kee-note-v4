!macro customUnInstall
   RMDir /r /REBOOTOK "$PROFILE\AppData\Roaming\__YOUR_PACKAGE_NAME__\public"
   RMDir /r /REBOOTOK "$PROFILE\AppData\Roaming\__YOUR_PACKAGE_NAME__\static"
   Delete /REBOOTOK "$PROFILE\AppData\Roaming\__YOUR_PACKAGE_NAME__\config.ini"
!macroend
