import { useState } from "react";
import { Link, useLocation } from "wouter";
import { IoMdHome } from "react-icons/io";
import { CiSearch, CiUser, CiHeart, CiShoppingCart } from "react-icons/ci";
import "../../styles/navbar.scss";

import JoyStick from "../../assets/Joystick.png";


const NavBar = () => {

    return (
        <div className="navbar">


            <div className="navbar__container navbar__container--upper">

                <ul className="navbar__ul navbar__ul--upper">

                    <li className="navbar__item">

                        <Link className={`navbar__link navbar__link--logo`} href={`/`}>

                            <img src={JoyStick} alt="Logo" className="navbar__logo" />
                        
                            {/*

                            <div className="navbar__title">
                                <span className="navbar__text navbar__text--title">
                                    PIXEL <br /> Gamers
                                </span>
                            </div>
                            
                            */}
                        </Link>

                    </li>

                    <li className="navbar__item">
                        
                        <label className="navbar__search">

                            <CiSearch className="navbar__icon navbar__icon--search" />
                            
                            <input id="search-input" type="text" className="navbar__input navbar__text--input" placeholder="Buscar en Catálogo" />

                        </label>

                    </li>

                    <li className="navbar__item"> 
                        
                    </li>

                </ul>

            </div>            

        </div>
    );
};



export default NavBar;