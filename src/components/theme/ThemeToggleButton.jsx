import React, { useState, useEffect } from 'react';
import { CiSun } from "react-icons/ci";
import { IoMoonOutline } from "react-icons/io5";

import "../../styles/themetogglebutton.scss";


const ThemeToggleButton = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {

        const savedTheme = localStorage.getItem('app-theme');

        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {

            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme = prefersDark ? 'dark' : 'light';
            setTheme(initialTheme);
            document.documentElement.setAttribute('data-theme', initialTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';

        // Actualizar el estado
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);

        // Guardar la preferencia
        localStorage.setItem('app-theme', newTheme);
    };

    return (
        <button onClick={toggleTheme} aria-label="Cambiar tema" className="theme_toggle_button theme_toggle_button--theme" >
            {theme === 'light' ? <IoMoonOutline/> : <CiSun/>}
        </button>
    );
};



export default ThemeToggleButton;