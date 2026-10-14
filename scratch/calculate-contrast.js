function hexToLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrast(hex1, hex2) {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const backgrounds = {
  'brand-bg (#050816)': '#050816',
  'brand-bg-secondary (#0B1120)': '#0B1120',
  'brand-surface (#0F172A)': '#0F172A',
  'brand-surface-hover (#111C32)': '#111C32',
};

const textColors = {
  'brand-accent (#2563EB)': '#2563EB',
  'brand-accent-hover (#3B82F6)': '#3B82F6',
  'brand-accent-light (#60A5FA)': '#60A5FA',
  'brand-text-muted (#94A3B8)': '#94A3B8',
  'brand-text-secondary (#CBD5E1)': '#CBD5E1',
  'brand-text-primary (#F8FAFC)': '#F8FAFC',
};

console.log('=== WCAG 2.2 AA Contrast Analysis ===');
for (const [bgName, bgHex] of Object.entries(backgrounds)) {
  console.log(`\nBackground: ${bgName}`);
  for (const [textName, textHex] of Object.entries(textColors)) {
    const ratio = contrast(bgHex, textHex);
    const passNormal = ratio >= 4.5 ? 'PASS (AA normal >= 4.5)' : (ratio >= 3.0 ? 'FAIL (normal) / PASS (large >= 3.0)' : 'FAIL');
    console.log(`  ${textName}: ${ratio.toFixed(2)}:1 -> ${passNormal}`);
  }
}
