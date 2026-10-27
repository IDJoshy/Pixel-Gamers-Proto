import { useState, Suspense , lazy, useEffect} from 'react';
import { Route, Link, Router, Switch, useLocation } from 'wouter';

//Components
import Menus from './components/menus/menus';
import FixedFooter from './components/fixed_footer/fixed_footer';
const Footer = lazy(() => import('./components/footer/footer')); 

//Routes
import NotFound from './routes/notfound';
import About from './routes/about';
import Locations from './routes/locations';
import Contact from './routes/contact';
import Catalog from './routes/catalog';


const ScrollToTop = () => {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [location]);

  return null;
};

function App() {

  return (
    <>
      <Router hook={undefined} >

        <Menus />
        <FixedFooter />
        <ScrollToTop />

        <Switch>

          <Route path={"/"} component={Catalog} />
          <Route path={"/locations"} component={Locations} />
          <Route path={"/about"} component={About} />
          <Route path={"/contact"} component={Contact} />
          <Route component={NotFound} />

        </Switch>

        <Suspense fallback={<></>}>
          <Footer />
        </Suspense>
        

      </Router>
    </>
  )
}

export default App
