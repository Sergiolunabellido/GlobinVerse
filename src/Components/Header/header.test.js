import { render, screen, fireEvent } from '@testing-library/react';
import Header from './header';

const mockNavigate = jest.fn();
let mockPath = '/';

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: mockPath }),
  }),
  { virtual: true }
);

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('shows search input only on /catalogo', () => {
    mockPath = '/';
    const { rerender } = render(<Header onSearchChange={() => {}} />);
    expect(
      screen.queryByPlaceholderText('Buscar por nombre, categoria, etc...')
    ).not.toBeInTheDocument();

    mockPath = '/catalogo';
    rerender(<Header onSearchChange={() => {}} />);
    expect(
      screen.getByPlaceholderText('Buscar por nombre, categoria, etc...')
    ).toBeInTheDocument();
  });

  test('navigates to /login when user button clicked without token', () => {
    render(<Header onSearchChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    const userButton = buttons[buttons.length - 1];
    fireEvent.click(userButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navigates to /perfil when user button clicked with token', () => {
    localStorage.setItem('token', 'test-token');
    render(<Header onSearchChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    const userButton = buttons[buttons.length - 1];
    fireEvent.click(userButton);
    expect(mockNavigate).toHaveBeenCalledWith('/perfil');
  });
});
