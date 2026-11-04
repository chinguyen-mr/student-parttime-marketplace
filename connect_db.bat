@echo off
chcp 65001 >nul
title KẾT NỐI VÀ KHỞI TẠO CSDL JOBNEST
echo =====================================================================
echo    JOBNEST - CÔNG CỤ TỰ ĐỘNG KẾT NỐI & KHỞI TẠO CSDL CHO MÁY MỚI
echo =====================================================================
echo.
echo Đang kiểm tra và kết nối với PostgreSQL...
echo.

node connect_db.js

echo.
pause

