import React from 'react';
import Images from './Images';
import './App.css';

function Flower(props) {
	return (
		<div>
			<img id={props.x.toString() + props.y.toString()} src={Images[props.flower + '.png']} alt={props.flower} />
		</div>
	);
}

export default Flower;