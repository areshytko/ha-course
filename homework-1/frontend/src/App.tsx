import React from 'react';
import {
  BrowserRouter as Router,
  Route, Switch
} from "react-router-dom";
import './App.css';



function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">

        </Route>
        <Route exact path="/profile/:profileId">

        </Route>
        <Route exact path="/register">

        </Route>
        <Route exact path="/login">

        </Route>
        <Route exact path="/search">

        </Route>
      </Switch>
    </Router>
  );
}

export default App;
