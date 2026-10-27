import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import "../../styles/navbar.scss";
import "../../styles/hamburger.scss";

import Pixel from "../../assets/pixel.png";


const Menus = () => {

    const [isHamburgerOpen, setOpenHamburger] = useState(false);

    const toggleHamburger = () => setOpenHamburger((prev) => !prev);

    return (
        <>
            {isHamburgerOpen ?

                <div className="hamburger__overlay" onClick={toggleHamburger} />

                : null}

            <div className={`hamburger ${isHamburgerOpen ? "hamburger--active" : "hamburger--hidden"}`} style={isHamburgerOpen ? { right: "0" } : { right: "-640px" }}>

                <div className="hamburger__container">


                    <ul className="hamburger__ul">

                        <li className="hamburger__li hamburger__li--header">
                            <p className="hamburger__text hamburger__text--header">
                                [ COMUNIDAD ]
                            </p>
                        </li>

                        <HamburgerLink to={`/locations`} name={"Ubicaciones"} childen={""} />
                        <HamburgerLink to={`/about`} name={"Acerca de Nosotros"} childen={""} />
                        <HamburgerLink to={`/contact`} name={"Contacto"} childen={""} />

                    </ul>

                </div>

            </div>

            <div className="navbar">

                <div className="navbar__container navbar__container--upper">

                    <ul className="navbar__ul navbar__ul--upper">

                        <li className="navbar__item navbar__item--logo">
                            <Link className={`navbar__link navbar__link--logo`} href={`/`}>
                                <img className="navbar__logo" src={Pixel} alt="Pixel" />
                            </Link>
                        </li>

                        <li className="navbar__border" />

                        <li className="navbar__item navbar__item--links">
                            <div className="navbar__buttons">
                                <NavbarLink name={"Log-In"} to={"/login"} childen={""} />
                                <NavbarLink name={"Sign-Up"} to={"/signup"} childen={""} />

                                {/* Hamburger */}
                                <button onClick={toggleHamburger} className="navbar__button navbar__button--hamburger">
                                    {isHamburgerOpen ?
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="navbar__icon navbar__icon--hamburger" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z">
                                            </path>
                                        </svg>
                                        :
                                        <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 15 15" className="navbar__icon navbar__icon--hamburger" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.6006 11.0098C13.8286 11.0563 14 11.2583 14 11.5C14 11.7417 13.8286 11.9437 13.6006 11.9902L13.5 12H1.5C1.22386 12 1 11.7761 1 11.5C1 11.2239 1.22386 11 1.5 11H13.5L13.6006 11.0098ZM13.6006 7.00977C13.8286 7.05629 14 7.25829 14 7.5C14 7.74171 13.8286 7.94371 13.6006 7.99023L13.5 8H1.5C1.22386 8 1 7.77614 1 7.5C1 7.22386 1.22386 7 1.5 7H13.5L13.6006 7.00977ZM13.6006 3.00977C13.8286 3.05629 14 3.25829 14 3.5C14 3.74171 13.8286 3.94371 13.6006 3.99023L13.5 4H1.5C1.22386 4 1 3.77614 1 3.5C1 3.22386 1.22386 3 1.5 3H13.5L13.6006 3.00977Z" fill="currentColor">
                                            </path>
                                        </svg>
                                    }
                                </button>

                            </div>
                        </li>
                    </ul>

                </div>

            </div>

        </>
    );
};

export default Menus;

const HamburgerLink = (props) => {
    const [location, navigate] = useLocation();

    return (
        <li className="hamburger__li hamburger__li--link">
            <Link className={`hamburger__link ${location === props.to ? "hamburger__link--active" : ""}`} href={`${props.to}`}>
                <p className="hamburger__text hamburger__text--link">{props.name}</p>
                <p className="hamburger__text hamburger__text--arrow">{location === props.to ? `■` : `□`}</p>
            </Link>
        </li>
    );
}

const NavbarLink = (props) => {
    const [location, navigate] = useLocation();

    return (
        <Link className={`navbar__link navbar__link--button ${location === props.to ? "navbar__link--active" : ""}`} href={`${props.to}`}>
            {props.childen}
            {props.name}
        </Link>
    );
}