import "../../styles/hero.scss";

const Hero = (props, children) => {
    return (
        <div className="hero">
            <h1 className="hero__text hero__text--header">{props.header}</h1>
            <strong className="hero__text hero__text--title">{props.title}</strong>
            <strong className="hero__text hero__text--subtitle">{props.subtitle}</strong>
            <h2 className="hero__text hero__text--body" style={{ whiteSpace: "pre-line" }}>{props.body}</h2>
            {children}
        </div>
    );
}

export default Hero;