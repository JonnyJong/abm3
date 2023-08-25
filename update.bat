taskkill /f /im abm.exe
xcopy /e /i /y /s .\update .\
start "" ".\abm.exe"
exit
