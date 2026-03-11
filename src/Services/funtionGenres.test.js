import generosArray from './funtionGenres';

describe('funtionGenres', () => {
  test('exports a non-empty genres array', () => {
    expect(Array.isArray(generosArray)).toBe(true);
    expect(generosArray.length).toBeGreaterThan(0);
  });

  test('each genre has name and image', () => {
    generosArray.forEach((g) => {
      expect(g.nombre).toBeTruthy();
      expect(g.img).toBeTruthy();
    });
  });
});
