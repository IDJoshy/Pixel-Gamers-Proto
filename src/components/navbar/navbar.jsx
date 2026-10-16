import { useState } from "react";
import { Link, useLocation } from "wouter";
import "../../styles/navbar.scss";

import Pixel from "../../assets/pixel.png";

import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";

const NavBar = () => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
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

                            {/* Hamburger Menu */}
                            <button className="navbar__button navbar__button--hamburger">
                                <RxHamburgerMenu className="navbar__icon navbar__icon--hamburger" />
                            </button>

                        </div>
                    </li>


                </ul>

            </div>

        </div>
    );
};



export default NavBar;


const NavbarLink = (props) => {
    const [location, navigate] = useLocation();

    return (
        <Link className={`navbar__link navbar__link--button ${location === props.to ? "navbar__link--active" : ""}`} href={`${props.to}`}>
            {props.childen}
            {props.name}
        </Link>
    );
}