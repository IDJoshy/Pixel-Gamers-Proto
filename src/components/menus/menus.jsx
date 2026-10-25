import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import "../../styles/navbar.scss";
import "../../styles/hamburger.scss";

import Pixel from "../../assets/pixel.png";

import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";

import ThemeToggleButton from "../theme/ThemeToggleButton";

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
                                    {isHamburgerOpen ? <IoMdClose className="navbar__icon navbar__icon--hamburger" /> : <RxHamburgerMenu className="navbar__icon navbar__icon--hamburger" />}
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