// js/ui/icons.js
// 심플한 인라인 SVG 아이콘들 (currentColor 사용)

export const ICONS = {
  bullet: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10h10a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H3v-8z" fill="currentColor"/>
      <path d="M14 10c0-3 2-5 4-5s4 2 4 5-2 5-4 5-4-2-4-5z" fill="currentColor" opacity="0.8"/>
      <rect x="3" y="9" width="2" height="10" rx="1" fill="currentColor" opacity="0.6"/>
    </svg>
  `,
  bible: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V7a4 4 0 0 1 2-3.464V19a2 2 0 0 0 2 2h12" fill="currentColor" opacity="0.2"/>
      <path d="M6 3h8a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V7a4 4 0 0 1 2-3.464" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M12 7v6M9 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  lock: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" fill="currentColor"/>
      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="12" cy="15" r="1.6" fill="#000" opacity="0.3"/>
    </svg>
  `,
};
