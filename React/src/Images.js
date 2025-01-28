import './App.css';

let Images = {};
require.context('./FlowerPics', false, /\.(png|jpe?g|svg)$/).keys().map((item, index) => { Images[item.replace('./', '')] = require.context('./FlowerPics', false, /\.(png|jpe?g|svg)$/)(item); return 5;});

export default Images;