import "../../styles/additional.scss";

import { Link, useLocation } from "wouter";

import { FaInstagram, FaLinkedin, FaFacebook} from "react-icons/fa";

const Additional = () => {

    return (
        <div className="additional">

            <ul className="additional__ul additional__ul--socials">

                <li className="additional__item additional__item--social">
                    Síguenos en {`->`}
                </li>

                <li className="additional__item">
                    <CustomSocial name={"Instagram"} to={"https://www.instagram.com/"} childen={<FaInstagram />} />
                </li>

                <li className="additional__item">
                    <CustomSocial name={"Linkedin"} to={"https://www.linkedin.com/"} childen={<FaLinkedin />} />
                </li>

                <li className="additional__item">
                    <CustomSocial name={"Facebook"} to={"https://www.facebook.com/"} childen={<FaFacebook />} />
                </li>
            </ul>

            <span className="additional__separator">|</span>

            <ul className="additional__ul additional__ul--links">

                <li className="additional__item">
                    <CustomLink name={"Ubicaciones"} to={"/locations"} />
                </li>

                <li className="additional__item">
                    <CustomLink name={"Nosotros"} to={"/about"} />
                </li>

                <li className="additional__item">
                    <CustomLink name={"Contacto"} to={"/contact"} />
                </li>

            </ul>

        </div>
    );
};

const CustomLink = (props) => {
    const [location, navigate] = useLocation();

    return (
        <Link className={`additional__link ${location === props.to ? "additional__link--active" : ""}`} href={`${props.to}`}>
            {props.childen}
            {props.name}
        </Link>
    );
}

const CustomSocial = (props) => {
    return (
        <a className="additional__link additional__link--social" href={`${props.to}`} target="_blank" rel="noopener noreferrer">
            {props.childen}
        </a>
    );
}

export default Additional;