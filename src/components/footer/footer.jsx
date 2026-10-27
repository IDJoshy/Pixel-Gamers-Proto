import "../../styles/footer.scss";

import { Link, useLocation } from "wouter";
import FooterBG from "../../assets/footer_bg_video.webm";

const AccountLinks =
    [
        {
            name: "Mi Cuenta",
            to: "/account/"
        },
        {
            name: "Mi Carrito",
            to: "/cart/"
        },
        {
            name: "Mis Pedidos",
            to: "/orders/"
        },
        {
            name: "Mis Favoritos",
            to: "/favorites/"
        }
    ]

const PolicyLinks = [
    {
        name: "Política de Garantía",
        to: "/policy/guarantee"
    },
    {
        name: "Política de Envios",
        to: "/policy/shipping"
    },
    {
        name: "Política de Cambios",
        to: "/policy/changes"
    },
    {
        name: "Política de Devoluciones",
        to: "/policy/returns"
    },
    {
        name: "Política de Privacidad",
        to: "/policy/privacy"
    },
    {
        name: "Política de Cookies",
        to: "/policy/cookies"
    }
]

const SocialLinks =
    [
        {
            name: "Facebook",
            to: "https://www.facebook.com/"
        },
        {
            name: "Twitter",
            to: "https://twitter.com/"
        },
        {
            name: "Instagram",
            to: "https://www.instagram.com/"
        }
    ]

const StoreLinks =
    [
        {
            name: "Cátalogo",
            to: "/catalog/"
        },
        {
            name: "Tiendas Fisicas",
            to: "/locations/"
        }
    ]

const Footer = () => {
    return (
        <div className="footer">
            <video className="footer__video" autoPlay={true} loop={true} muted={true} playsInline={true} src={FooterBG} type="video/webm" />

            <div className="footer__video__overlay" />

            <div className="footer__container footer__container--top">

                <ul className="footer__list">
                    <li className="footer__text footer__text--header">Tienda</li>
                    {
                        StoreLinks.map((item) =>
                        (
                            <InternalLink key={item.name} name={item.name} to={item.to} />
                        ))
                    }
                </ul>

                <ul className="footer__list">
                    <li className="footer__text footer__text--header">Politicas</li>
                    {
                        PolicyLinks.map((item) =>
                        (
                            <InternalLink key={item.name} name={item.name} to={item.to} />
                        ))
                    }
                </ul>

                <ul className="footer__list">
                    <li className="footer__text footer__text--header">Cuenta</li>
                    {
                        AccountLinks.map((item) =>
                        (
                            <InternalLink key={item.name} name={item.name} to={item.to} />
                        ))
                    }
                </ul>

                <ul className="footer__list">
                    <li className="footer__text footer__text--header">Sociales</li>
                    {
                        SocialLinks.map((item) =>
                        (
                            <ExternalLink key={item.name} name={item.name} to={item.to} />
                        ))
                    }
                </ul>

            </div>

            <div className="footer__container footer__container--bottom">
                <small className="footer__text footer__text--copyright">
                    &copy; EphemeralJosh 2026
                </small>
            </div>
        </div>

    );
}

export default Footer;

const InternalLink = ({ name, to }) => {
    return (
        <li className="footer__li">
            <Link className="footer__link" to={to}>
                {name}
            </Link>
        </li>
    );
}

const ExternalLink = ({ name, to }) => {
    return (
        <li className="footer__li">
            <a className="footer__link" href={to}>
                {name}
            </a>
        </li>
    );
}
