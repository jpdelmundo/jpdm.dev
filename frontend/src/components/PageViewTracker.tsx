import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';

export function PageViewTracker() {
    const location = useLocation();

    useEffect(() => {
        import.meta.env.VITE_GA_ID && ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }, [location]);

    return null;
}