/** RecruitFlow design tokens — Warm Obsidian theme */
export const theme = {
  chart: {
    primary: '#E8653A',
    secondary: '#3DAA8D',
    tertiary: '#5B8DEF',
    quaternary: '#C4A35A',
    grid: '#E8E2D9',
    axis: '#9C958A',
    tooltip: { bg: '#FFFCF7', border: '#D9D3C7' },
  },
  pipeline: {
    APPLIED: '#5B8DEF',
    SCREENING: '#9B7EDE',
    INTERVIEW: '#3DAA8D',
    FINAL_INTERVIEW: '#C4A35A',
    OFFER: '#E8653A',
    HIRED: '#2D8A6E',
    REJECTED: '#C45C5C',
  } as Record<string, string>,
};

export const CHART_TOOLTIP_STYLE = {
  borderRadius: '10px',
  border: '1px solid #D9D3C7',
  background: '#FFFCF7',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(15,20,25,0.08)',
};
