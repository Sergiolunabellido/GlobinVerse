import { renovarToken, Libro3D } from './utils';
import { render } from '@testing-library/react';

jest.mock('@react-three/fiber', () => ({
  useLoader: jest.fn(() => ({})),
}));

jest.mock('three', () => ({
  TextureLoader: function TextureLoader() {},
}));

describe('utils', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
  });

  test('renovarToken stores token on success', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ ok: true, token: 'new-token' }),
    });

    const token = await renovarToken();
    expect(token).toBe('new-token');
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  test('renovarToken returns null on failure', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ ok: false }),
    });

    const token = await renovarToken();
    expect(token).toBeNull();
  });

  test('Libro3D renders without crashing', () => {
    const libro = { url_imagen: 'https://example.com/a.jpg' };
    const { container } = render(<Libro3D libro={libro} />);
    expect(container).toBeTruthy();
  });
});
