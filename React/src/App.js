import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Header from "./Header";
import Grid from "./Grid";

class App extends React.Component {
	render() {
		return (
		<>
			<Header/>
			<Grid/>
		</>
		);
	}
}

export default App;