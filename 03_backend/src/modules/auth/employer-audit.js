/** Lịch sử thay đổi các thông tin quan trọng của hồ sơ nhà tuyển dụng (bảng employer_profile_changes). */

const norm = (v) => (v === undefined || v === '' ? null : v);
const same = (a, b) => JSON.stringify(norm(a)) === JSON.stringify(norm(b));
const numOrSelf = (v) => (v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v)) && typeof v !== 'object' ? Number(v) : v);

/**
 * So sánh trước/sau. `fields`: ghi giá trị cũ → mới. `longFields`: chỉ ghi "đã cập nhật" (văn bản dài).
 * Tọa độ/năm lưu dạng NUMERIC (chuỗi) nên so sánh theo số.
 */
function diffFields(before = {}, after = {}, fields = [], longFields = []) {
    const changes = {};
    for (const f of fields) {
        const a = ['latitude', 'longitude', 'founded_year'].includes(f) ? numOrSelf(before[f]) : before[f];
        if (!same(a, after[f])) changes[f] = { from: norm(a) ?? null, to: norm(after[f]) ?? null };
    }
    for (const f of longFields) {
        if (!same(before[f], after[f])) changes[f] = { updated: true };
    }
    return changes;
}

/** Ghi 1 dòng lịch sử nếu có thay đổi. `q` là db hoặc client trong transaction. Không chặn thao tác chính nếu bảng chưa có. */
async function logProfileChange(q, employerId, changedBy, section, changes) {
    if (!changes || !Object.keys(changes).length) return;
    try {
        await q.query(
            `INSERT INTO employer_profile_changes (employer_id, changed_by, section, changes) VALUES ($1, $2, $3, $4)`,
            [employerId, changedBy, section, JSON.stringify(changes)]
        );
    } catch (err) {
        // 42P01 = bảng chưa tồn tại (chưa chạy migration 017) → bỏ qua, các lỗi khác vẫn báo
        if (err.code !== '42P01') throw err;
        console.warn('[employer-audit] Bảng employer_profile_changes chưa có, bỏ qua ghi lịch sử. Hãy chạy npm run migrate.');
    }
}

module.exports = { diffFields, logProfileChange };
