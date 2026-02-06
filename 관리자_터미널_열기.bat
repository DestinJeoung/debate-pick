@echo off
setlocal
chcp 65001 >nul

:: 1. 관리자 권한 확인 (net session 명령어로 체크)
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin_tasks
) else (
    echo 관리자 권한으로 다시 실행하는 중입니다...
    :: PowerShell을 사용하여 현재 파일을 관리자 권한으로 실행
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

:admin_tasks
:: 2. 프로젝트 폴더로 강제 이동 (한글 경로 대응)
cd /d "c:\Users\정태범\Desktop\DDING\debate-pick"

echo.
echo ========================================================
echo    Debate Pick 관리자 터미널 (관리자 모드 활성화)
echo ========================================================
echo.
echo  - 현재 위치: %CD%
echo  - 이제 여기서 git push 나 prisma 명령어를 입력하세요.
echo.
echo ========================================================
echo.

:: 3. 터미널이 닫히지 않도록 실행 유지
cmd /k
