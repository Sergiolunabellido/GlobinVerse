import { render, screen, fireEvent } from '@testing-library/react';
import Login from './login';

jest.mock('../../Components/Login-Registro/Botones-Enviar/Enviar-Login', () => () => (
  <button data-testid="login-submit" type="button">Login</button>
));

jest.mock('../../Components/Login-Registro/Botones-Enviar/Enviar-Registro', () => () => (
  <button data-testid="register-submit" type="button">Registro</button>
));

describe('Login page', () => {
  test('renders login form by default', () => {
    render(<Login />);
    expect(screen.getByText('Bienvenido a GoblinVerse')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();

    const formRegistro = document.getElementById('form-registro');
    const formLogin = document.getElementById('form-login');
    expect(formLogin.className).not.toContain('hidden');
    expect(formRegistro.className).toContain('hidden');
  });

  test('toggles to register form', () => {
    render(<Login />);
    fireEvent.click(screen.getByText('Regístrate'));

    const formRegistro = document.getElementById('form-registro');
    const formLogin = document.getElementById('form-login');
    expect(formRegistro.className).not.toContain('hidden');
    expect(formLogin.className).toContain('hidden');
    expect(screen.getByTestId('register-submit')).toBeInTheDocument();
  });

  test('toggles back to login form', () => {
    render(<Login />);
    fireEvent.click(screen.getByText('Regístrate'));
    fireEvent.click(screen.getByText('Inicia Sesión'));

    const formRegistro = document.getElementById('form-registro');
    const formLogin = document.getElementById('form-login');
    expect(formLogin.className).not.toContain('hidden');
    expect(formRegistro.className).toContain('hidden');
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
  });
});
