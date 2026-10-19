import React from 'react';
import "../styles/notfound.scss";

import { TbError404 } from "react-icons/tb";
import Loader from '../components/loader/loader';

const NotFound = () => {
    return (
        <>
            <div className="notfound">

                <TbError404 className="notfound__icon" />
                <h1 className="notfound__text notfound__text--error">Gulp! Algo salió mal</h1>

            </div>
            <Loader />
        </>
    )
}

export default NotFound;