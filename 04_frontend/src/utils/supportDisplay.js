/** Nội dung thông báo SUPPORT_REQUEST do backend ghi: "Họ tên (email): nội dung" (03_backend .../support.service.js) */
export function parseSupportBody(body = '') {
  const m = String(body ?? '').match(/^(.*?) \(([^()\s]+@[^()\s]+)\): ([\s\S]*)$/);
  return m ? { name: m[1], email: m[2], message: m[3] } : { name: '', email: '', message: String(body ?? '') };
}
