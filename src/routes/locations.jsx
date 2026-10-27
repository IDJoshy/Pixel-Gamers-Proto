import "../styles/locations.scss";
import Hero from "../components/hero/hero";
import Loader from '../components/loader/loader';
import LocationCard from "../components/location_card/location_card";


const locations_list = [
    {
        "nombre": "Mallplaza Tobalaba",
        "url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.3797867715703!2d-70.56006088834889!3d-33.569487173231316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662d6c0ded3899f%3A0x7cd66b59842fe9ac!2sMallplaza%20Tobalaba!5e0!3m2!1ses-419!2scl!4v1793056866815!5m2!1ses-419!2scl",
        "direccion": "Mallplaza Tobalaba | Av. Camilo Henríquez 3692,\nPuente Alto, Región Metropolitana",
        "piso": "1",
        "local": "1010"
    },
    {
        "nombre": "Costanera Center",
        "url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2321.0582518807873!2d-70.6069867774488!3d-33.417595133985316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cf69d2445e63%3A0x8499a6d51afec7f8!2sAv.%20Andr%C3%A9s%20Bello%202447%2C%20Gran%20Torre%20Santiago%2C%207510689%20Providencia%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses-419!2scl!4v1793057597150!5m2!1ses-419!2scl",
        "direccion": "Costanera Center | Av. Andrés Bello 2447,\n Gran Torre Santiago, 7510689 Providencia,\n Región Metropolitana",
        "piso": "3",
        "local": "4009"
    },
    {
        "nombre": "Arauco Maipu",
        "url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3327.779724621298!2d-70.7538072883523!3d-33.48108527326632!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c31831293283%3A0x337f64adabfcd765!2sMall%20Arauco%20Maip%C3%BA!5e0!3m2!1ses-419!2scl!4v1793057790555!5m2!1ses-419!2scl",
        "direccion": "Mall Arauco Maipu |Av. Américo Vespucio 399,\n9250000 Maipú, Región Metropolitana",
        "piso": "2",
        "local": "300"
    }


];


const Locations = () => {
    return (
        <>
            <div className="locations">

                <div className="locations__container locations__container--hero">
                    <Hero header={"Ubicaciones"} title={"NUESTRAS TIENDAS"} body={` Donde podrás encontrarnos.`} />
                </div>

                <ul className="locations__ul">
                    {
                        locations_list.map((item) => (
                            <li key={item.nombre} className="locations__li locations__li--location_card">
                                <LocationCard url={item.url} nombre={item.nombre} direccion={item.direccion} piso={item.piso} local={item.local} />
                            </li>
                        ))
                    }
                </ul>

            </div>
            <Loader />
        </>
    );
}

export default Locations