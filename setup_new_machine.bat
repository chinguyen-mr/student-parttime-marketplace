@echo off
chcp 65001 >nul
title THIẾT LẬP TỰ ĐỘNG DỰ ÁN CHO MÁY MỚI (MÁY B)
echo =========================================================================
echo       JOBNEST - CÔNG CỤ TỰ ĐỘNG CÀI ĐẶT & KẾT NỐI CHO MÁY MỚI
echo =========================================================================
echo.

:: 1. Kiểm tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] CHƯA CÀI ĐẶT NODE.JS!
    echo Vui lòng tải và cài đặt Node.js phiên bản LTS từ: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Đã phát hiện Node.js:
node -v
echo.

:: 2. Cài đặt toàn bộ thư viện dependencies cho Backend và Frontend nếu chưa có
echo =========================================================================
echo 📦 BƯỚC 1: CÀI ĐẶT CÁC GÓI THƯ VIỆN (NODE_MODULES)...
echo =========================================================================
call npm run install:all
if %errorlevel% neq 0 (
    echo [X] Cài đặt thư viện thất bại. Vui lòng kiểm tra kết nối mạng.
    pause
    exit /b 1
)

:: 3. Quét kết nối PostgreSQL, tạo DB, migrations, seed, admin
echo.
echo =========================================================================
echo 🔄 BƯỚC 2: KẾT NỐI VÀ ĐỒNG BỘ CƠ SỞ DỮ LIỆU POSTGRESQL...
echo =========================================================================
node connect_db.js
if %errorlevel% neq 0 (
    echo.
    echo [!] Quá trình kết nối CSDL chưa hoàn tất. Vui lòng làm theo hướng dẫn phía trên.
    pause
    exit /b 1
)

echo.
echo =========================================================================
echo ✨ CHÚC MỪNG! MÁY MỚI ĐÃ SẴN SÀNG CHẠY DỰ ÁN 100%!
echo =========================================================================
echo Để bắt đầu chạy hệ thống:
echo   - Chạy Backend:  npm run dev:backend
echo   - Chạy Frontend: npm run dev:frontend
echo.
pause
