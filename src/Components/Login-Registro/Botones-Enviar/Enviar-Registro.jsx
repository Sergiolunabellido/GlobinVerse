import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * @brief Valida los datos del formulario de registro.
 * @fecha 2026-04-16
 * @param {string} nombre - Nombre completo del usuario.
 * @param {string} email - Correo electrónico.
 * @param {string} password - Contraseña.
 * @returns {boolean} True si la validación pasa, false si falla.
 */
function validarRegistro(nombre, email, password) {
    if (!nombre || nombre.trim().length < 2) {
        toast.error('El nombre debe tener al menos 2 caracteres');
        return false;
    }
    if (!email || email.trim().length === 0) {
        toast.error('El email es obligatorio');
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast.error('El formato del email no es válido');
        return false;
    }
    if (!password || password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);
    if (!tieneMayuscula || !tieneNumero) {
        toast.error('La contraseña debe tener al menos una mayúscula y un número');
        return false;
    }
    return true;
}

/**
 * @brief Boton que envia el registro al backend y muestra el resultado.
 * @fecha 2026-01-12
 * @returns {JSX.Element} Boton y mensajes de estado.
 */
export default function BotonEnviarRegistro({ nombre, email, password, setContraseña, setEmail, setNombre }) {
    const navigate = useNavigate();

    /**
     * @brief Envia los datos de registro y redirige si todo va bien.
     * @fecha 2026-04-16
     * @returns {Promise<void>} No devuelve datos, solo actualiza estado.
     */
    const enviarRegistro = async (e) => {
        e.preventDefault();
        
        if (!validarRegistro(nombre, email, password)) {
            return;
        }

        try {
            const respuesta = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre,
                    email: email,
                    password: password,
                }),
            });
            const datos = await respuesta.json();
            if (datos.ok) {
                setContraseña('');
                setEmail('');
                setNombre('');
                toast.success(datos.mensaje);
                navigate('/login');
            } else {
                toast.error(datos.mensaje);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error al conectar con el servidor');
        }
    };

    return (
        <button type='button' className="btn-submit m-10" onClick={enviarRegistro}>Enviar</button>
    );
}
