import { useState } from 'react';
import { Route, Link, Router, Switch } from 'wouter';

//Components
import Menus from './components/menus/menus';
import Additional from './components/additional/additional';

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
        <div className='app'>
          <Menus/>
          <Additional/>
          <Switch>
            <Route path={"/"} component={NotFound}/>
            <Route path={"/catalog"} component={Catalog}/>
            <Route path={"/locations"} component={Locations}/>
            <Route path={"/about"} component={About}/>
            <Route path={"/contact"} component={Contact}/>
            <Route component={NotFound}/>
            
          </Switch>
          
        </div>
      </Router>
    </>
  )
}

export default App
