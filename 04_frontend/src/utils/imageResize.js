// Thu nhỏ ảnh trên trình duyệt trước khi tải lên (giữ tỉ lệ), trả về data URL JPEG.

export const ACCEPTED_IMAGE_TYPES = /^image\/(jpeg|png|webp)$/;
export const MAX_INPUT_IMAGE_BYTES = 10 * 1024 * 1024;

/** Kiểm tra file ảnh người dùng chọn. Trả về thông báo lỗi hoặc null. */
export function checkImageFile(file) {
  if (!file) return 'Chưa chọn ảnh.';
  if (!ACCEPTED_IMAGE_TYPES.test(file.type)) return 'Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.';
  if (file.size > MAX_INPUT_IMAGE_BYTES) return 'Ảnh quá lớn (tối đa 10MB).';
  return null;
}

/** Giữ tỉ lệ, cạnh dài không vượt maxWidth × maxHeight. */
export function resizeImageFile(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh.')); };
    img.src = url;
  });
}
