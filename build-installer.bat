@echo off
echo === Building frontend ===
cd frontend
call npm run build
if errorlevel 1 goto :error
cd ..

echo === Copying static files ===
if exist backend\src\main\resources\static rmdir /s /q backend\src\main\resources\static
mkdir backend\src\main\resources\static
xcopy /E /I /Y frontend\out\* backend\src\main\resources\static\ >nul

echo === Packaging JAR ===
cd backend
call mvnw.cmd clean package -DskipTests
if errorlevel 1 goto :error

echo === Building trimmed runtime ===
if exist target\runtime rmdir /s /q target\runtime
jlink --add-modules java.base,java.logging,java.management,java.naming,java.desktop,java.instrument,java.security.jgss,java.sql,java.transaction.xa,java.xml,java.compiler,jdk.unsupported,jdk.crypto.ec --strip-debug --no-header-files --no-man-pages --compress=2 --output target\runtime
if errorlevel 1 goto :error

echo === Building installer ===
jpackage --type exe --name "Habit Tracker" --app-version 1.0.0 --vendor "Aakash" --input target --main-jar habit-tracker-api-0.0.1-SNAPSHOT.jar --runtime-image target\runtime --java-options "-Xmx256m -Dapp.open-browser=true" --icon src\main\resources\icon.ico --win-shortcut --win-menu --win-dir-chooser --dest target\installer
if errorlevel 1 goto :error

echo.
echo === DONE: backend\target\installer ===
cd ..
goto :eof

:error
echo BUILD FAILED
cd ..
exit /b 1