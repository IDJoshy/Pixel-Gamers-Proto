import React from 'react';
import "../styles/notfound.scss";

import { TbError404 } from "react-icons/tb";
import Loader from '../components/loader/loader';

const NotFound = () => 
{
    return (
        <>
        <div className="notfound">
            {/*
            <TbError404 className="notfound__icon"/>
            <p className="notfound__text notfound__text--error">Gulp! Algo salió mal</p>
            */}
        </div>
        <Loader/>
        </>
    )
}

export default NotFound;