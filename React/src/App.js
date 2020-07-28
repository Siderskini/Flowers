import React, {Component} from 'react';
import Header from "./Header";
import Grid from "./Grid";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  
  render() {
    return (
      <>
        <Header />
        <Grid />
      </>
    );
  } 
}

export default App;
