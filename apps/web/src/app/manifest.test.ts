import manifest from '@/app/manifest';

describe('PWA manifest', () => {
  it('exports installable fields', () => {
    const data = manifest();
    expect(data.name).toBe('PURA PMS');
    expect(data.display).toBe('standalone');
    expect(data.start_url).toBe('/');
    expect(data.icons?.length).toBeGreaterThanOrEqual(3);
    expect(data.theme_color).toBe('#1E4B8E');
  });
});
