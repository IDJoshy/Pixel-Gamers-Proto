import React from 'react';
import "../styles/notfound.scss";

import Loader from '../components/loader/loader';

const NotFound = () => {
    return (
        <>
            <div className="notfound">

                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="notfound__icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8v3a1 1 0 0 0 1 1h3">
                    </path>
                    <path d="M7 8v8">
                    </path>
                    <path d="M17 8v3a1 1 0 0 0 1 1h3">
                    </path>
                    <path d="M21 8v8">
                    </path>
                    <path d="M10 10v4a2 2 0 1 0 4 0v-4a2 2 0 1 0 -4 0">
                    </path>
                </svg>

                <h1 className="notfound__text notfound__text--error">Gulp! Algo salió mal</h1>

            </div>
            <Loader />
        </>
    )
}

export default NotFound;