/**
 * Enter đang dùng để xác nhận chữ của bộ gõ (IME: Telex/VNI của Windows/macOS, tiếng Trung/Nhật/Hàn…)
 * → không được coi là "gửi". keyCode 229 bắt trường hợp Safari báo isComposing = false quá sớm.
 */
export const isImeComposing = (e) => Boolean(e.nativeEvent?.isComposing || e.isComposing || e.keyCode === 229);
