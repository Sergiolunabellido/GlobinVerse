import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * @brief Valida los datos del formulario de login.
 * @fecha 2026-04-16
 * @param {string} usuario - Nombre de usuario o email.
 * @param {string} contraseña - Contraseña del usuario.
 * @returns {boolean} True si la validación pasa, false si falla.
 */
function validarLogin(usuario, contraseña) {
    if (!usuario || usuario.trim().length === 0) {
        toast.error('El usuario es obligatorio');
        return false;
    }
    if (!contraseña || contraseña.trim().length === 0) {
        toast.error('La contraseña es obligatoria');
        return false;
    }
    if (contraseña.length < 4) {
        toast.error('La contraseña debe tener al menos 4 caracteres');
        return false;
    }
    return true;
}

/**
 * @brief Boton que valida el login y guarda el token si todo va bien.
 * @fecha 2026-01-12
 * @returns {JSX.Element} Boton y posible mensaje de error.
 */
export default function BotonEnviarLogin({ usuario, contraseña }) {
    const navigate = useNavigate();

    /**
     * @brief Envia las credenciales al backend y gestiona la respuesta.
     * @fecha 2026-01-12
     * @returns {Promise<void>} No devuelve datos, solo actualiza estado y navega.
     */
    const comprobarLogin = async () => {
        if (!validarLogin(usuario, contraseña)) {
            return;
        }

        try {
            const respuesta = await fetch("http://localhost:5000/login", {
                method: 'POST',
                headers: { "Content-type": 'application/json' },
                body: JSON.stringify({
                    usuario: usuario,
                    contraseña: contraseña,
                }),
                credentials: 'include',
            });

            const datos = await respuesta.json();
            if (datos.ok) {
                localStorage.setItem('token', datos.token);
                toast.success('Login exitoso');
                navigate("/");
            } else {
                toast.error(datos.mensaje);
            }
        } catch (e) {
            console.error("Error al realizar el inicio de sesion: ", e);
            toast.error('Error al conectar con el servidor');
        }
    };

    return (
        <button type='button' className="btn-submit" onClick={comprobarLogin}>Enviar</button>
    );
}
