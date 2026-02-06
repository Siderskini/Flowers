import React from 'react';
import Images from './Images';
import './App.css';

export default function Flower(props) {
	return (
		<div>
			<img id={props.x.toString() + props.y.toString()} src={Images[props.flower + '.png']} alt={props.flower} />
		</div>
	);
}
