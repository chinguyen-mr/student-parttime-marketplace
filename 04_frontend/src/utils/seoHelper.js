/**
 * ==============================================================================
 * JOBNEST — Dynamic SEO Metadata & Canonical URL Manager
 * Findings Addressed: SEO-02 (Title), SEO-03 (Canonical URL), SEO-06 (Meta Description)
 * Option B Strategy: Fully decoupled utility, zero-touch App.jsx
 * ==============================================================================
 */

export const BASE_CANONICAL_HOST = 'https://jobnest.edu.vn';

export const DEFAULT_SEO = {
  title: 'JobNest - Nền tảng Việc làm Part-time & Full-time cho Sinh viên',
  description: 'JobNest là nền tảng kết nối sinh viên với các công việc part-time và full-time uy tín, minh bạch thù lao, tích lũy kinh nghiệm và phát triển nghề nghiệp.',
  canonical: `${BASE_CANONICAL_HOST}/`,
  robots: 'index, follow'
};

export const PAGE_SEO_CONFIGS = {
  home: {
    title: 'JobNest - Nền tảng Việc làm Part-time & Full-time cho Sinh viên',
    description: 'JobNest là nền tảng kết nối sinh viên với các công việc part-time và full-time uy tín, minh bạch thù lao, tích lũy kinh nghiệm và phát triển nghề nghiệp.',
    canonical: `${BASE_CANONICAL_HOST}/`,
    robots: 'index, follow'
  },
  jobs: {
    title: 'Tìm kiếm việc làm Part-time & Full-time | JobNest',
    description: 'Khám phá hàng trăm tin tuyển dụng part-time và full-time phù hợp với lịch học sinh viên. Đăng ký ứng tuyển ngay trên JobNest.',
    canonical: `${BASE_CANONICAL_HOST}/?tab=jobs`,
    robots: 'index, follow'
  },
  about: {
    title: 'Giới thiệu & Quy chế hoạt động | Nền tảng JobNest',
    description: 'Tìm hiểu về sứ mệnh JobNest, thuật toán so khớp lịch học, cẩm nang 5 bước tìm việc làm part-time và quy chế bảo vệ sinh viên.',
    canonical: `${BASE_CANONICAL_HOST}/?tab=about`,
    robots: 'index, follow'
  },
  admin: {
    title: 'Quản trị hệ thống | JobNest',
    description: 'Cổng quản trị nội dung, duyệt tin tuyển dụng và báo cáo vận hành JobNest.',
    canonical: `${BASE_CANONICAL_HOST}/`,
    robots: 'noindex, nofollow'
  },
  employer: {
    title: 'Kênh Nhà tuyển dụng | JobNest',
    description: 'Quản lý tin đăng tuyển dụng, ứng viên sinh viên và đánh giá tiến độ công việc trên JobNest.',
    canonical: `${BASE_CANONICAL_HOST}/`,
    robots: 'noindex, nofollow'
  },
  student_workspace: {
    title: 'Không gian Sinh viên | JobNest',
    description: 'Theo dõi tiến trình ứng tuyển, ca làm việc và đề xuất việc làm cá nhân hóa trên JobNest.',
    canonical: `${BASE_CANONICAL_HOST}/`,
    robots: 'noindex, nofollow'
  },
  auth: {
    title: 'Đăng nhập & Đăng ký tài khoản | JobNest',
    description: 'Đăng nhập JobNest để tìm kiếm việc làm bán thời gian phù hợp hoặc kết nối nhân tài sinh viên.',
    canonical: `${BASE_CANONICAL_HOST}/`,
    robots: 'noindex, nofollow'
  }
};

/**
 * Strips tracking/session parameters while strictly preserving resource-identifying params
 * (such as jobId or tab).
 */
export function cleanCanonicalUrl(rawUrl = '') {
  if (!rawUrl) return `${BASE_CANONICAL_HOST}/`;
  try {
    const urlObj = new URL(rawUrl, BASE_CANONICAL_HOST);
    urlObj.protocol = 'https:';
    urlObj.host = 'jobnest.edu.vn';
    urlObj.port = '';

    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'fbclid', 'gclid', 'session', 'token', '_gl', '_ga'
    ];
    trackingParams.forEach((param) => urlObj.searchParams.delete(param));

    // Normalize empty path
    if (urlObj.pathname === '' || urlObj.pathname === '/') {
      const searchStr = urlObj.searchParams.toString();
      return searchStr ? `${BASE_CANONICAL_HOST}/?${searchStr}` : `${BASE_CANONICAL_HOST}/`;
    }

    const searchStr = urlObj.searchParams.toString();
    return searchStr ? `${urlObj.origin}${urlObj.pathname}?${searchStr}` : `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    return `${BASE_CANONICAL_HOST}/`;
  }
}

/**
 * Ensures clean DOM node creation or update without duplicates
 */
function setMetaTag(nameOrProperty, keyName, value) {
  if (typeof document === 'undefined') return;
  const selector = `meta[${keyName}="${nameOrProperty}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(keyName, nameOrProperty);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value || '');
}

/**
 * Applies Canonical link safely: removes duplicate canonical tags and sets exact href
 */
export function setCanonicalUrl(url) {
  if (typeof document === 'undefined') return;
  const canonicalUrl = cleanCanonicalUrl(url);

  // Find all existing canonical links
  const existingLinks = document.head.querySelectorAll('link[rel="canonical"]');
  let primaryLink = document.getElementById('canonical-url');

  if (!primaryLink && existingLinks.length > 0) {
    primaryLink = existingLinks[0];
    primaryLink.id = 'canonical-url';
  }

  // Remove any redundant canonical duplicates
  existingLinks.forEach((link) => {
    if (link !== primaryLink) {
      link.remove();
    }
  });

  if (!primaryLink) {
    primaryLink = document.createElement('link');
    primaryLink.rel = 'canonical';
    primaryLink.id = 'canonical-url';
    document.head.appendChild(primaryLink);
  }

  primaryLink.href = canonicalUrl;
  setMetaTag('og:url', 'property', canonicalUrl);
  return canonicalUrl;
}

/**
 * Sets document title and synchronized OpenGraph/Twitter titles
 */
export function setDocumentTitle(title) {
  if (typeof document === 'undefined') return;
  const cleanTitle = (title || DEFAULT_SEO.title).trim();
  document.title = cleanTitle;
  setMetaTag('title', 'name', cleanTitle);
  setMetaTag('og:title', 'property', cleanTitle);
  setMetaTag('twitter:title', 'name', cleanTitle);
  return cleanTitle;
}

/**
 * Sets meta description and synchronized OpenGraph/Twitter descriptions
 */
export function setMetaDescription(description) {
  if (typeof document === 'undefined') return;
  const cleanDesc = (description || DEFAULT_SEO.description).trim();
  setMetaTag('description', 'name', cleanDesc);
  setMetaTag('og:description', 'property', cleanDesc);
  setMetaTag('twitter:description', 'name', cleanDesc);
  return cleanDesc;
}

/**
 * Sets or updates Robots meta tag for indexing / noindex policies
 */
export function setRobotsDirective(directive = 'index, follow') {
  if (typeof document === 'undefined') return;
  let robotsMeta = document.getElementById('jobnest-robots-meta');
  if (!robotsMeta) {
    robotsMeta = document.head.querySelector('meta[name="robots"]');
  }
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.name = 'robots';
    robotsMeta.id = 'jobnest-robots-meta';
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.content = directive;
  return directive;
}

/**
 * Formats a clean job description snippet without breaking words
 */
export function formatJobDescription(job) {
  if (!job) return DEFAULT_SEO.description;
  if (job.description && typeof job.description === 'string' && job.description.trim().length > 20) {
    const raw = job.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    if (raw.length <= 155) return raw;
    const truncated = raw.slice(0, 152);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated}...`;
  }

  // Synthesize from job attributes
  const title = job.title || 'Việc làm Part-time';
  const employer = job.employer_name || job.company_name || 'Doanh nghiệp uy tín';
  const location = job.location || 'TP.HCM';
  const salary = job.salary_range || (job.salary ? `${job.salary} VNĐ` : 'Thỏa thuận');
  return `${title} tại ${employer}. Mức lương: ${salary}. Khu vực: ${location}. Ứng tuyển ngay trên JobNest.`;
}

/**
 * Resolves SEO configuration for a Job Detail page with real data
 */
export function getJobDetailSEO(job) {
  // Resilience: Missing or invalid job data must not produce fabricated metadata
  if (!job || (!job.id && !job.title)) {
    return {
      title: 'Không tìm thấy việc làm | JobNest',
      description: 'Thông tin việc làm không tồn tại hoặc đã ngừng tuyển dụng trên hệ thống JobNest.',
      canonical: `${BASE_CANONICAL_HOST}/?tab=jobs`,
      robots: 'noindex, nofollow'
    };
  }

  const title = `${job.title} | Tuyển dụng Part-time JobNest`;
  const description = formatJobDescription(job);
  const canonical = `${BASE_CANONICAL_HOST}/?jobId=${job.id}`;
  return {
    title,
    description,
    canonical,
    robots: 'index, follow'
  };
}

let explicitSEOActive = false;
let currentActiveView = 'home';
let observerInstance = null;
let debounceTimeout = null;

/**
 * Updates full SEO metadata (Title, Description, Canonical URL, Robots)
 */
export function updateSEO(view = 'home', data = null) {
  if (typeof document === 'undefined') return;

  let config;
  if (view === 'job_detail') {
    explicitSEOActive = true;
    currentActiveView = 'job_detail';
    config = getJobDetailSEO(data);
  } else {
    config = PAGE_SEO_CONFIGS[view] || DEFAULT_SEO;
    currentActiveView = view;
  }

  setDocumentTitle(config.title);
  setMetaDescription(config.description);
  setCanonicalUrl(config.canonical);
  setRobotsDirective(config.robots || 'index, follow');

  return config;
}

/**
 * Cleans up page-specific metadata and restores parent or default metadata
 */
export function cleanupSEO(fallbackView = 'jobs') {
  explicitSEOActive = false;
  // If restoring to an authorized static view:
  const config = PAGE_SEO_CONFIGS[fallbackView] || DEFAULT_SEO;
  currentActiveView = fallbackView;
  setDocumentTitle(config.title);
  setMetaDescription(config.description);
  setCanonicalUrl(config.canonical);
  setRobotsDirective(config.robots || 'index, follow');
  return config;
}

/**
 * DOM Inspector: Detects visible active view in the React SPA without modifying App.jsx
 */
export function detectVisibleSPAView() {
  if (typeof document === 'undefined') return 'home';

  // 1. If Job Detail page is mounted with visible job container
  if (document.querySelector('.job-detail-container, .job-detail-page-container, [data-page="job-detail"]')) {
    return 'job_detail';
  }

  // 2. If AboutPage is mounted (has specific breadcrumb / about headings)
  const aboutHeading = document.evaluate(
    "//h1[contains(text(), 'Giới thiệu & Quy chế') or contains(text(), 'Về JobNest')]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  if (aboutHeading || document.querySelector('[data-page="about"]')) {
    return 'about';
  }

  // 3. Admin workspace
  if (document.querySelector('[data-page="admin"], .admin-portal-container')) {
    return 'admin';
  }

  // 4. Employer workspace
  if (document.querySelector('[data-page="employer"], .employer-portal-container')) {
    return 'employer';
  }

  // 5. Jobs Search Hero / Feed (Screen 6)
  const jobSearchHero = document.evaluate(
    "//h1[contains(text(), 'Tìm kiếm việc làm') or contains(text(), 'Cơ hội việc làm')]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  if (jobSearchHero || document.querySelector('[data-page="jobs-feed"]')) {
    return 'jobs';
  }

  // 6. Home page
  if (document.querySelector('.home-page-container, .home-hero-section')) {
    return 'home';
  }

  return 'home';
}

/**
 * Lightweight MutationObserver to keep metadata synchronized during SPA tab navigation
 * while App.jsx remains completely untouched (Option B).
 */
export function initSPAMetadataObserver() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  if (observerInstance) return observerInstance;

  const handleDOMChange = () => {
    // If JobDetailPage explicitly controls metadata, do not overwrite it
    if (explicitSEOActive) return;

    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (explicitSEOActive) return;
      const detectedView = detectVisibleSPAView();
      if (detectedView && detectedView !== currentActiveView && detectedView !== 'job_detail') {
        updateSEO(detectedView);
      }
    }, 50);
  };

  observerInstance = new MutationObserver(handleDOMChange);
  const targetNode = document.getElementById('root') || document.body;
  if (targetNode) {
    observerInstance.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }

  window.addEventListener('popstate', handleDOMChange);
  return observerInstance;
}

export function teardownSPAMetadataObserver() {
  if (observerInstance) {
    observerInstance.disconnect();
    observerInstance = null;
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', () => {});
  }
}

// Auto-boot observer in browser environments
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initSPAMetadataObserver());
  } else {
    initSPAMetadataObserver();
  }
}
