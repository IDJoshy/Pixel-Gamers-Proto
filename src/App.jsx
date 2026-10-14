import { useState } from 'react';
import { Route, Link, Router, Switch } from 'wouter';

import NavBar from './components/navbar/navbar';

import NotFound from './routes/notfound';
import Additional from './components/additional/additional';



function App() {

  return (
    <>
      <Router hook={undefined}>
        <div className='app'>
          <NavBar/>
          <Additional/>
          <Switch>
            <Route path={"/"} component={NotFound}/>
            <Route path={"/catalog"} component={NotFound}/>
            <Route path={"/locations"} component={NotFound}/>
            <Route path={"/about"} component={NotFound}/>
            <Route path={"/contact"} component={NotFound}/>
            <Route path={"*"} component={NotFound}/>
            
          </Switch>
          
        </div>
      </Router>
    </>
  )
}

export default App
