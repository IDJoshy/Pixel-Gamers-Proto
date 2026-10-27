import { useEffect, useState } from "react";
import Loader from '../components/loader/loader';
import Hero from "../components/hero/hero";
import { useLocation } from 'wouter';
import "../styles/policy.scss";

const policyContent = 
{
    "guarantee": {
        h1: "Política / Terminos de Garantía",
        hero_title: "POLÍTICA DE GARANTÍA",
        hero_body: "Aquí van los términos y condiciones sobre la garantía de nuestros productos físicos y digitales..."
    },
    "shipping": {
        h1: "Política / Terminos de Envío",
        hero_title: "POLÍTICA DE ENVIOS",
        hero_body: "Información sobre tiempos de entrega, costos de despacho y zonas de cobertura..."
    },
    "changes": {
        h1: "Política / Terminos de Cambios",
        hero_title: "POLÍTICA DE CAMBIOS",
        hero_body: "Condiciones para realizar cambios de juegos físicos, consolas o accesorios..."
    },
    "returns": {
        h1: "Política / Terminos de Devoluciones",
        hero_title: "POLÍTICA DE DEVOLUCIONES",
        hero_body: "Pasos y requisitos para solicitar el reembolso de tu dinero..."
    },
    "privacy": {
        h1: "Política / Terminos de Privacidad",
        hero_title: "POLÍTICA DE PRIVACIDAD",
        hero_body: "Cómo Pixel Gamers protege y maneja tus datos personales..."
    },
    "cookies": {
        h1: "Política / Terminos de Cookies",
        hero_title: "POLÍTICA DE COOKIES",
        hero_body: "Información sobre las cookies que utilizamos en nuestro sitio web para mejorar tu experiencia..."
    }
};

const Policy = ({params}) => {

    const currentType = params?.type;

    const content = policyContent[currentType] || {
        h1: "Política/Terminos",
        hero_title: "Políticas",
        hero_body: "Selecciona una política desde el menú para ver la información."
    };

    return (
        <>
            <div className="policy">
                <div className="policy__container policy__container--hero">
                    <Hero header={content.h1} title={content.hero_title} body={content.hero_body} />
                </div>
            </div>

            <Loader />
        </>
    );
}

export default Policy;