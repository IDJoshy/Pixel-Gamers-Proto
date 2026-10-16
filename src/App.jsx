import { useState } from 'react';
import { Route, Link, Router, Switch } from 'wouter';

//Components
import Menus from './components/menus/menus';
import Additional from './components/additional/additional';

//Routes
import NotFound from './routes/notfound';
import About from './routes/about';





function App() {

  return (
    <>
      <Router hook={undefined}>
        <div className='app'>
          <Menus/>
          <Additional/>
          <Switch>
            <Route path={"/"} component={NotFound}/>
            <Route path={"/catalog"} component={NotFound}/>
            <Route path={"/locations"} component={NotFound}/>
            <Route path={"/about"} component={About}/>
            <Route path={"/contact"} component={NotFound}/>
            <Route path={"*"} component={NotFound}/>
            
          </Switch>
          
        </div>
      </Router>
    </>
  )
}

export default App
