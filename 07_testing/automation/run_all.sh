#!/usr/bin/env bash
# Chạy trọn 314 test case trong CDTN2_TestCases.xlsx trên bản Docker local (backend :5000, PostgreSQL, Mailpit :8025)
# và giao diện Vite (:5173). Cần Chrome và playwright-core (NODE_PATH trỏ tới thư mục có playwright-core).
set -u
cd "$(dirname "$0")"
rs() { docker restart jobnest-backend >/dev/null; sleep 8; }   # xóa bộ đếm giới hạn tần suất giữa các bước
rm -f verify_results.json verify_blocked.json final_checks.json cv_checks.json placeholder_checks.json audit_checks.json strict_checks.json
rs; node run_api.cjs            | tail -1
rs; node rerun.cjs              | tail -1
node run_ui.cjs                 | tail -1
rs; node verify_fix.cjs         | tail -1
rs; node verify_blocked.cjs     | tail -1
node final_checks.cjs           | tail -3
node cv_checks.cjs              | tail -4
rs; node placeholder_checks.cjs | tail -6; node reset_emp.cjs
node audit_checks.cjs           | tail -2
rs; node strict_checks.cjs      | tail -1
node merge_results.cjs
