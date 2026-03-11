import { CerrarSesion } from './cerrarSesion';

describe('CerrarSesion', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
    localStorage.setItem('token', 'old');
  });

  test('calls backend and removes token', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    await CerrarSesion();
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/cerrarSesion', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(localStorage.getItem('token')).toBeNull();
  });
});
