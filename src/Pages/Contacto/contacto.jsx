import Header from '../../Components/Header/header.jsx';
import Footer from '../../Components/Footer/footer.jsx';

export default function Contacto(){
    return(
        <div className="body1 overflow-x-hidden flex flex-col w-[100%] min-h-screen bg-[#102216] items-center">
            <Header/>
            <hr className='border-t border-green-800 w-[100%]'/>

            {/* Contenido principal de contacto */}
            <div className='flex flex-col w-full h-full flex-1'>
                {/* Seccion de titulo */}
                <div className='flex flex-col gap-4 items-center justify-center p-6 md:p-10 w-full min-h-[250px] md:min-h-[300px]'>
                    <h1 className='text-3xl md:text-5xl font-bold w-full md:w-[60%] lg:w-[40%] mt-5 md:mt-10 text-center text-white'>
                        Contacta con Nosotros
                    </h1>
                    <p className='text-base md:text-lg text-green-400 mb-5 md:mb-10 text-center px-4'>
                        Estamos aqui para ayudarte. Encuentranos a traves de cualquiera de nuestros canales.
                    </p>
                </div>

                {/* Grid de informacion de contacto */}
                <div className='flex flex-col lg:flex-row items-center justify-center gap-8 w-full px-4 pb-10 flex-1'>

                    {/* Email */}
                    <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=goblinverse@gmail.com" target="_blank" 
                        className='flex flex-col items-center gap-4 w-full md:w-[80%] lg:w-[22%] bg-[#1a3a25]/30 rounded-xl ring-1 ring-green-900 shadow p-6 hover:bg-[#1a3a25]/50 hover:ring-green-600 transition-all duration-300 cursor-pointer group'
                    >
                        <div className='w-14 h-14 bg-[#1a3a25] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
                                <path d="M3 7l9 6l9 -6" />
                            </svg>
                        </div>
                        <h2 className='text-xl font-bold text-white text-center'>Email</h2>
                        <p className='text-sm text-green-300 text-center'>goblinverse@gmail.com</p>
                        <p className='text-xs text-gray-400 text-center'>Haz clic para enviarnos un mensaje</p>
                    </a>

                    {/* Telefono */}
                    <div className='flex flex-col items-center gap-4 w-full md:w-[80%] lg:w-[22%] bg-[#1a3a25]/30 rounded-xl ring-1 ring-green-900 shadow p-6'>
                        <div className='w-14 h-14 bg-[#1a3a25] rounded-xl flex items-center justify-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                            </svg>
                        </div>
                        <h2 className='text-xl font-bold text-white text-center'>Telefono</h2>
                        <p className='text-sm text-green-300 text-center'>+34 912 345 678</p>
                        <p className='text-xs text-gray-400 text-center'>Lun - Vie: 9:00 - 18:00</p>
                    </div>

                    {/* Direccion */}
                    <div className='flex flex-col items-center gap-4 w-full md:w-[80%] lg:w-[22%] bg-[#1a3a25]/30 rounded-xl ring-1 ring-green-900 shadow p-6'>
                        <div className='w-14 h-14 bg-[#1a3a25] rounded-xl flex items-center justify-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                                <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
                            </svg>
                        </div>
                        <h2 className='text-xl font-bold text-white text-center'>Direccion</h2>
                        <p className='text-sm text-green-300 text-center'>Calle de la Fantasia, 42</p>
                        <p className='text-xs text-gray-400 text-center'>28001 Córdoba, España</p>
                    </div>

                    {/* Redes Sociales */}
                    <div className='flex flex-col items-center gap-4 w-full md:w-[80%] lg:w-[22%] bg-[#1a3a25]/30 rounded-xl ring-1 ring-green-900 shadow p-6'>
                        <div className='w-14 h-14 bg-[#1a3a25] rounded-xl flex items-center justify-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 5a3 3 0 1 0 -5.995 .176l-.536 1.835h-1.464a2 2 0 0 0 -1.99 1.838l-.7 11a2 2 0 0 0 1.99 2.162h15.516a2 2 0 0 0 1.99 -2.162l-.7 -11a2 2 0 0 0 -1.99 -1.838h-1.464l-.536 -1.835a3 3 0 1 0 -5.996 .176z" />
                                <path d="M12 5a3 3 0 1 0 -5.995 .176l-.536 1.835h-1.464a2 2 0 0 0 -1.99 1.838l-.7 11a2 2 0 0 0 1.99 2.162h15.516a2 2 0 0 0 1.99 -2.162l-.7 -11a2 2 0 0 0 -1.99 -1.838h-1.464l-.536 -1.835a3 3 0 1 0 -5.996 .176z" />
                            </svg>
                        </div>
                        <h2 className='text-xl font-bold text-white text-center'>Redes Sociales</h2>
                        <div className='flex gap-3 mt-1'>
                            <a href="https://instagram.com/goblinverses" target="_blank" rel="noopener noreferrer" className='text-green-300 hover:text-[#00ff33] transition-colors'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                                    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                                    <path d="M16.5 7.5v.01" />
                                </svg>
                            </a>
                            <a href="https://twitter.com/goblinverse" target="_blank" rel="noopener noreferrer" className='text-green-300 hover:text-[#00ff33] transition-colors'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 -.083 -6.5 -1.395 -8.96 -3.96a4 4 0 0 0 -.67 2.18c0 1.028 .515 1.916 1.317 2.444a4 4 0 0 1 -1.787 -1.035v.09c0 1.48 .93 2.745 2.237 3.22a4 4 0 0 1 -1.797 .15c.535 1.58 2.088 2.73 3.931 2.762a8.001 8.001 0 0 1 -5.8 1.62c3.688 2.37 8.064 2.37 11.752 0c3.368 -2.165 5.276 -5.906 5.276 -10.134c0 -.172 -.003 -.344 -.01 -.513c.968 -.71 1.75 -1.59 2.369 -2.586z" />
                                </svg>
                            </a>
                            <a href="https://facebook.com/goblinverse" target="_blank" rel="noopener noreferrer" className='text-green-300 hover:text-[#00ff33] transition-colors'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
                                </svg>
                            </a>
                        </div>
                        <p className='text-xs text-gray-400 text-center'>Siguenos para novedades</p>
                    </div>
                </div>

                {/* Seccion de horario */}
                <div className='flex flex-col items-center justify-center w-full py-10 px-4 bg-[#1a3a25]/15'>
                    <div className='flex flex-col items-center gap-6 w-full md:w-[80%] lg:w-[60%] max-w-[800px] bg-[#1a3a25]/30 rounded-xl ring-1 ring-green-900 shadow p-6 md:p-10'>
                        <div className='w-14 h-14 bg-[#1a3a25] rounded-xl flex items-center justify-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                <path d="M12 12l3 3" />
                                <path d="M12 7v5" />
                            </svg>
                        </div>
                        <h2 className='text-2xl font-bold text-white text-center'>Horario de Atencion</h2>
                        <div className='flex flex-col md:flex-row gap-8 w-full justify-center'>
                            <div className='text-center'>
                                <p className='text-green-400 font-semibold'>Lunes - Viernes</p>
                                <p className='text-white'>9:00 - 18:00</p>
                            </div>
                            <div className='text-center'>
                                <p className='text-green-400 font-semibold'>Sabado</p>
                                <p className='text-white'>10:00 - 14:00</p>
                            </div>
                            <div className='text-center'>
                                <p className='text-green-400 font-semibold'>Domingo</p>
                                <p className='text-white'>Cerrado</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seccion de mapa o mensaje final */}
                <div className='flex flex-col items-center justify-center w-full py-10 px-4 flex-1'>
                    <p className='text-center text-gray-400 text-sm max-w-[600px]'>
                        Tambien puedes visitarnos en nuestra tienda fisica. Estamos en el corazón de nuestra Córdoba bendita,
                        listos para recibirte y ayudarte a encontrar tu proxima gran aventura literaria.
                    </p>
                </div>
            </div>

            <Footer/>
        </div>
    )
}