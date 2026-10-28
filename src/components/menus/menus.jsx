import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "../../context/StoreContext";
import "../../styles/navbar.scss";
import "../../styles/hamburger.scss";

import Pixel from "../../assets/pixel.png";

const Menus = () => {
    const [isHamburgerOpen, setOpenHamburger] = useState(false);
    const { cart, currentUser, activeRole } = useStore();

    const toggleHamburger = () => setOpenHamburger((prev) => !prev);
    const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <>
            {isHamburgerOpen ? (
                <div className="hamburger__overlay" onClick={toggleHamburger} />
            ) : null}

            <div
                className={`hamburger ${isHamburgerOpen ? "hamburger--active" : "hamburger--hidden"}`}
                style={isHamburgerOpen ? { right: "0" } : { right: "-640px" }}
            >
                <div className="hamburger__container">
                    <ul className="hamburger__ul">
                        <li className="hamburger__li hamburger__li--header">
                            <p className="hamburger__text hamburger__text--header">
                                [ TIENDA & CLIENTES ]
                            </p>
                        </li>
                        <HamburgerLink to="/" name="Catálogo de Juegos" onClick={() => setOpenHamburger(false)} />
                        <HamburgerLink to="/cart" name={`Mi Carrito (${totalCartItems})`} onClick={() => setOpenHamburger(false)} />
                        <HamburgerLink to="/orders" name="Mis Pedidos y Claves" onClick={() => setOpenHamburger(false)} />
                        <HamburgerLink to="/tracking" name="Rastreo de Envío (Tracking)" onClick={() => setOpenHamburger(false)} />
                        <HamburgerLink to="/guia-canje" name="Guía Interactiva de Canje" onClick={() => setOpenHamburger(false)} />
                        <HamburgerLink to="/locations" name="Nuestras Sucursales" onClick={() => setOpenHamburger(false)} />
                        <HamburgerLink to="/about" name="Acerca de Nosotros" onClick={() => setOpenHamburger(false)} />
                        <HamburgerLink to="/contact" name="Soporte y Contacto" onClick={() => setOpenHamburger(false)} />

                        <li className="hamburger__li hamburger__li--header" style={{ marginTop: '20px' }}>
                            <p className="hamburger__text hamburger__text--header">
                                [ MÓDULOS DE GESTIÓN ]
                            </p>
                        </li>
                        <HamburgerLink to="/pos" name="🏪 POS Vendedor de Tienda" onClick={() => setOpenHamburger(false)} />
                        <HamburgerLink to="/admin-inventario" name="📦 Admin Inventario & Logística" onClick={() => setOpenHamburger(false)} />
                        <HamburgerLink to="/admin-ti" name="🛡️ Administrador TI & Auditoría" onClick={() => setOpenHamburger(false)} />
                    </ul>
                </div>
            </div>

            <div className="navbar">
                <div className="navbar__container navbar__container--upper">
                    <ul className="navbar__ul navbar__ul--upper">
                        <li className="navbar__item navbar__item--logo">
                            <Link className="navbar__link navbar__link--logo" href="/">
                                <img className="navbar__logo" src={Pixel} alt="Pixel Gamers" />
                            </Link>
                        </li>

                        <li className="navbar__border" />

                        <li className="navbar__item navbar__item--links">
                            <div className="navbar__buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <NavbarLink name="Catálogo" to="/" />
                                <NavbarLink name="Guía Canje" to="/guia-canje" />
                                <NavbarLink name="Tracking" to="/tracking" />

                                {activeRole === 'vendedor' && (
                                    <NavbarLink name="POS Tienda" to="/pos" />
                                )}
                                {activeRole === 'inventario' && (
                                    <NavbarLink name="Inventario" to="/admin-inventario" />
                                )}
                                {activeRole === 'admin' && (
                                    <NavbarLink name="Consola TI" to="/admin-ti" />
                                )}

                                <Link
                                    href="/cart"
                                    className="navbar__link navbar__link--button"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: totalCartItems > 0 ? 'var(--color-contrast)' : 'transparent',
                                        color: totalCartItems > 0 ? '#fff' : 'inherit',
                                        padding: '0 12px',
                                        borderRadius: '4px',
                                        fontWeight: 600
                                    }}
                                >
                                    <span>🛒 Carrito</span>
                                    {totalCartItems > 0 && (
                                        <span
                                            style={{
                                                background: '#fff',
                                                color: '#000',
                                                padding: '1px 6px',
                                                borderRadius: '10px',
                                                fontSize: '11px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {totalCartItems}
                                        </span>
                                    )}
                                </Link>

                                <NavbarLink
                                    name={currentUser ? `👤 ${currentUser.name.split(' ')[0]}` : "Log-In"}
                                    to={currentUser ? "/orders" : "/login"}
                                />

                                {/* Hamburger Toggle */}
                                <button
                                    onClick={toggleHamburger}
                                    className="navbar__button navbar__button--hamburger"
                                    aria-label="Menú principal"
                                >
                                    {isHamburgerOpen ? (
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="navbar__icon navbar__icon--hamburger" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z" />
                                        </svg>
                                    ) : (
                                        <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 15 15" className="navbar__icon navbar__icon--hamburger" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.6006 11.0098C13.8286 11.0563 14 11.2583 14 11.5C14 11.7417 13.8286 11.9437 13.6006 11.9902L13.5 12H1.5C1.22386 12 1 11.7761 1 11.5C1 11.2239 1.22386 11 1.5 11H13.5L13.6006 11.0098ZM13.6006 7.00977C13.8286 7.05629 14 7.25829 14 7.5C14 7.74171 13.8286 7.94371 13.6006 7.99023L13.5 8H1.5C1.22386 8 1 7.77614 1 7.5C1 7.22386 1.22386 7 1.5 7H13.5L13.6006 7.00977ZM13.6006 3.00977C13.8286 3.05629 14 3.25829 14 3.5C14 3.74171 13.8286 3.94371 13.6006 3.99023L13.5 4H1.5C1.22386 4 1 3.77614 1 3.5C1 3.22386 1.22386 3 1.5 3H13.5L13.6006 3.00977Z" fill="currentColor" />
                                        </svg>
                                    )}
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

const HamburgerLink = ({ to, name, onClick }) => {
    const [location] = useLocation();

    return (
        <li className="hamburger__li hamburger__li--link" onClick={onClick}>
            <Link className={`hamburger__link ${location === to ? "hamburger__link--active" : ""}`} href={to}>
                <p className="hamburger__text hamburger__text--link">{name}</p>
                <p className="hamburger__text hamburger__text--arrow">{location === to ? `■` : `□`}</p>
            </Link>
        </li>
    );
};

const NavbarLink = ({ name, to }) => {
    const [location] = useLocation();

    return (
        <Link className={`navbar__link navbar__link--button ${location === to ? "navbar__link--active" : ""}`} href={to}>
            {name}
        </Link>
    );
};
