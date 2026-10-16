import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import "../../styles/navbar.scss";
import "../../styles/sidebar.scss";

import Pixel from "../../assets/pixel.png";

import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";

const Menus = () => {

    const [isSidebarOpen, setOpenSidebar] = useState(false);
    const toggleSidebar = () => setOpenSidebar((prev) => !prev);
    
    return (
        <>
            {isSidebarOpen ? 

            <div className="sidebar__overlay" onClick={toggleSidebar} /> 

            : null}

            <div className={`sidebar ${isSidebarOpen ? "sidebar--active" : "sidebar--hidden"}`} style={isSidebarOpen ? { right: "0" } : { right: "-640px" }}>

                <div className="sidebar__container">

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

                                {/* Sidebar */}
                                <button onClick={toggleSidebar} className="navbar__button navbar__button--hamburger">
                                    {isSidebarOpen ? <IoMdClose className="navbar__icon navbar__icon--hamburger" /> : <RxHamburgerMenu className="navbar__icon navbar__icon--hamburger" />}
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


const NavbarLink = (props) => {
    const [location, navigate] = useLocation();

    return (
        <Link className={`navbar__link navbar__link--button ${location === props.to ? "navbar__link--active" : ""}`} href={`${props.to}`}>
            {props.childen}
            {props.name}
        </Link>
    );
}