import { React } from "react";
import Loader from '../components/loader/loader';
import Hero from "../components/hero/hero";

import "../styles/about.scss";



const About = () => {
    return (
        <>
            <div className="about">
                
                <div className="about__container about__container--hero">
                    <Hero header={"Acerca de Nosotros"} title={"PIXEL GAMERS"} body={`En Pixel Gamers compartimos la pasión por los videojuegos.
                    Buscamos Ser la tienda de videojuegos y tecnología gamer de referencia en el mercado local,
                    superando las limitaciones de las plataformas globales rígidas al integrar la 
                    comercialización conjunta de formato físico e intangible.
                    
                    Buscamos consolidar una comunidad activa mediante la innovación continua en la sincronización omnicanal,
                    entregas digitales instantáneas y un catálogo diverso adaptado a las necesidades de cada jugador.`} />
                </div>

            </div>

            <Loader />
        </>
    )
}

export default About