!macro customInstall
  ; Create desktop shortcut with custom icon from resources
  SetShellVarContext current
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_NAME}.exe" "" "$INSTDIR\resources\icon.ico" 0
!macroend

!macro customUnInstall
  ; Remove desktop shortcut
  SetShellVarContext current
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
!macroend
