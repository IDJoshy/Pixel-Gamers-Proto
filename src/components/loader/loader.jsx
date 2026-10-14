import "../../styles/loader.scss";
import { useEffect } from "react";
import { useLocation } from "wouter";

const Loader = () =>
{
    const [location] = useLocation();

    useEffect(() => {
        
        return () => {
            
        };
    }, [location]);

    return (
        <div className="loader__container">
            <div className="loader"></div>
        </div>
        
    );
}

export default Loader