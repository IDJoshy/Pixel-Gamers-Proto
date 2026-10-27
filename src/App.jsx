import { useState } from 'react';
import { Route, Link, Router, Switch } from 'wouter';

//Components
import Menus from './components/menus/menus';
import FixedFooter from './components/fixed_footer/fixed_footer';

//Routes
import NotFound from './routes/notfound';
import About from './routes/about';
import Locations from './routes/locations';
import Contact from './routes/contact';
import Catalog from './routes/catalog';

function App() {

  return (
    <>
      <Router hook={undefined}>

        <Menus />
        <FixedFooter />


        <Switch>

          <Route path={"/"} component={Catalog} />
          <Route path={"/locations"} component={Locations} />
          <Route path={"/about"} component={About} />
          <Route path={"/contact"} component={Contact} />
          <Route component={NotFound} />

        </Switch>


      </Router>
    </>
  )
}

export default App
