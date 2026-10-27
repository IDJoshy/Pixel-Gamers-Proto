import "../../styles/location_card.scss";

const LocationCard = ({ url, nombre, direccion, piso, local }) => {
    return (
        <div className="location_card">
            <div className="location_card__container location_card__container--iframe">
                <iframe className="location_card__iframe" src={url} allowFullScreen="" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
            </div>

            <div className="location_card__container location_card__container--info">
                <h3 className="location_card__text location_card__text--location">{nombre}</h3>
                <span className="location_card__text location_card__text--separator"></span>
                <p className="location_card__text location_card__text--address" style={{ whiteSpace: "pre-line" }}>{direccion}</p>
                <p className="location_card__text location_card__text--floor">Piso:
                    <strong className="location_card__text location_card__text--floor_number">
                        {piso}
                    </strong>
                </p>
                <p className="location_card__text location_card__text--local">Local:
                    <strong className="location_card__text location_card__text--local_number">
                        {local}
                    </strong>
                </p>
            </div>

        </div>
    );
}

export default LocationCard;