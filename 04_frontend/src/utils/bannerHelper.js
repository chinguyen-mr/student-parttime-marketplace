// High-resolution Unsplash CDN fallback maps by category
export const CATEGORY_BANNERS = {
  'Công nghệ thông tin': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  'Thiết kế đồ họa': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
  'F&B / Dịch vụ ăn uống': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  'Bán lẻ': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  'Logistics / Giao nhận': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  'Sản xuất / Kỹ thuật': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
  'Giáo dục / Đào tạo': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
  'Hàng tiêu dùng / FMCG': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
};

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';

/**
 * Returns a working high-resolution Unsplash banner URL.
 * If the input URL is from the discontinued source.unsplash.com service or empty,
 * it maps to a beautiful category-matched HD Unsplash photograph.
 */
export function getJobBannerUrl(bannerUrl, category) {
  // Nếu là URL online hợp lệ (không phải source.unsplash.com đã đóng)
  if (bannerUrl && (bannerUrl.startsWith('http://') || bannerUrl.startsWith('https://')) && !bannerUrl.includes('source.unsplash.com')) {
    return bannerUrl;
  }
  // Nếu là đường dẫn giả lập nội bộ (uploads/banners/...) hoặc trống -> map sang ảnh Unsplash HD theo ngành
  if (category && CATEGORY_BANNERS[category]) {
    return CATEGORY_BANNERS[category];
  }
  return DEFAULT_BANNER;
}
