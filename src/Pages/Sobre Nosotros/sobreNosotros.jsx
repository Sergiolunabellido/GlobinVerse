import './sobreNosotros.css'
import Header from '../../Components/Header/header.jsx';
import Footer from '../../Components/Footer/footer.jsx';

export default function SobreNosotros(){


    return(
        <div className="body1 overflow-x-hidden flex flex-col w-[100%] min-h-screen bg-[#102216] items-center">
            <Header/>
            <hr className='border-t border-green-800 w-[100%] '/>
            <div id='divPadre' className='flex flex-col w-full h-full'>
                <div id='divTituloPagina' className='flex flex-col gap-4 items-center justify-center p-6 md:p-10 w-full flex-1 min-h-[300px] md:min-h-[400px]'>
                    <h1 className='text-3xl md:text-5xl font-bold w-full md:w-[60%] lg:w-[40%] mt-5 md:mt-10 text-center'>
                        Nuestra Historia en GoblinVerse
                    </h1>
                    <p className='text-base md:text-lg text-green-400 mb-5 md:mb-10 text-center px-4'>Conectando lectores con historias que desafian la imaginacion</p>
                </div>
                <div id='comienzos' className='flex flex-col lg:flex-row items-center justify-around w-full flex-1 py-10 px-4 gap-8'>
                    <div id='contenidoComienzo' className='flex flex-col items-center lg:items-start gap-4 text-justify w-full lg:w-[45%] xl:w-[40%]'>
                        <h1 className='text-2xl md:text-3xl font-bold w-full text-center lg:text-left'>Nuestros Comienzos</h1>
                        <p className='text-base md:text-lg w-full'>GoblinVerse nació en el rincón más polvoriento de una pequeña biblioteca familiar. Lo que comenzó como un modesto intercambio de libros prohibidos y relatos fantásticos entre amigos, pronto se convirtió en una pasión por descubrir lo inexplorado.
                        </p>
                        <p className='text-sm md:text-base w-full'>Desde nuestros humildes comienzos hasta convertirnos en un portal digital para mundos fantásticos, nuestra misión ha sido siempre la misma: ser el puente entre los lectores más audaces y las narrativas que desafían la realidad cotidiana. Creemos que cada libro es un portal esperando ser abierto.</p>
                    </div>
                    <div className='flex items-center justify-center w-full lg:w-[45%] xl:w-[40%]'>
                        <img src="images\Libros.png" alt="Imagen libros" className='w-full max-w-[400px] lg:w-[80%] rounded shadow' />
                    </div>

                </div>
                <div className='flex flex-col lg:flex-row items-center justify-center lg:justify-around w-full flex-1 bg-[#1a3a25]/15 py-10 px-4 gap-6' >
                    <div className='flex flex-col items-start gap-4 text-justify w-full md:w-[80%] lg:w-[45%] xl:w-[30%] bg-[#1a3a25]/30 rounded-xl ring-1 ring-green-900 shadow p-6 md:p-10'>
                        <div className='w-12 h-12 md:w-[15%] md:h-[50px] min-w-[48px] bg-[#1a3a25] rounded-xl flex items-center justify-center '>
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00ff33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-rocket"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" /><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" /><path d="M14 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>
                        </div>
                        <h1 className='text-xl md:text-2xl font-bold w-full'>Nuestra Mision</h1>
                        <p className='text-sm md:text-base w-full'>Transformar la lectura en una aventura epica, proporcionando acceso curado a historias que inspiren, desafien y emocionen a una comunidad global de buscadores de sueños</p>
                    </div>
                    <div className='flex flex-col items-start gap-4 text-justify w-full md:w-[80%] lg:w-[45%] xl:w-[30%] bg-[#1a3a25]/30 rounded-xl ring-1 ring-green-900 shadow p-6 md:p-10'>
                        <div className='w-12 h-12 md:w-[15%] md:h-[50px] min-w-[48px] bg-[#1a3a25] rounded-xl flex items-center justify-center '>
                           <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00ff33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-eye-spark"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M11.669 17.994q -5.18 -.18 -8.669 -5.994q 3.6 -6 9 -6t 9 6" /><path d="M19 22.5a4.75 4.75 0 0 1 3.5 -3.5a4.75 4.75 0 0 1 -3.5 -3.5a4.75 4.75 0 0 1 -3.5 3.5a4.75 4.75 0 0 1 3.5 3.5" /></svg>
                        </div>
                        <h1 className='text-xl md:text-2xl font-bold w-full'>Nuestra Vision</h1>
                        <p className='text-sm md:text-base w-full'>Ser reconocidos como el refugio definitivo para los géneros literarios intrepidos, donde cada lector encuentre no solo un libro, sino un universo entero de posibilidades</p>
                    </div>
                </div>
                <div className='flex-1 flex flex-col gap-5 bg-[#00ff33] w-full text-[#102216] p-6 md:p-10'>
                    <div className='flex items-center justify-center w-full py-4'>
                        <h1 className='text-2xl md:text-3xl font-bold text-center' >Nuestros Valores</h1>
                    </div>
                    <div className='flex flex-col md:flex-row items-center justify-center gap-8 md:gap-5 w-full py-6 md:p-10'>
                        <div className='flex flex-col items-center justify-center gap-5 w-full md:flex-1 max-w-[400px]'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#102216" class="icon icon-tabler icons-tabler-filled icon-tabler-heart"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" /></svg>
                            <h1 className='text-xl md:text-2xl font-bold text-center'>PASION SIN LIMITES</h1>
                            <p className='text-sm md:text-base w-full font-medium text-center'>No solo vendemos libros; vivimos cada historia que recomendamos con intensidad</p>
                        </div>
                        <div className='flex flex-col items-center justify-center gap-5 w-full md:flex-1 max-w-[400px]'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 20 20" fill="#102216" class="icon icon-tabler icons-tabler-outline icon-tabler-users"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg>
                            <h1 className='text-xl md:text-2xl font-bold text-center'>COMUNIDAD UNIDA</h1>
                            <p className='text-sm md:text-base w-full font-medium text-center'>Fomentamos un espacio seguro para que todos los lectores compartan sus mundos</p>
                        </div>
                        <div className='flex flex-col items-center justify-center gap-5 w-full md:flex-1 max-w-[400px]'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#102216" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-sparkles"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" /></svg>
                            <h1 className='text-xl md:text-2xl font-bold text-center'>CALIDAD CURADA</h1>
                            <p className='text-sm md:text-base w-full font-medium text-center'>Seleccionamos rigurosamente cada titulo para asegurar una experiencia inolvidable</p>
                        </div>
                    </div>
                </div>
            </div>
           
            <Footer/>
        </div>
    )

}