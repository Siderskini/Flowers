import { useState , useEffect, useRef} from 'react';
import './Grid.css';
import Flower from './Flower';

export default function Grid() {
	const rows = 8;
	const cols = 8;

	const [grid, setGrid] = useState(makeEmptyGrid());
	const [current, setCurrent] = useState(['null', 'null', 'null']);
	const [watergrid, setWatergrid] = useState(makeEmptyWaterGrid());
	const [search, setSearch] = useState("");
	const [pastGrids, setPastGrids] = useState([]);
	const flowers = useRef([]);
	const cloneGrid = (g) => g.map(row => row.map(cell => [...cell])); // 2D + cell array clone
  	const cloneWater = (w) => w.map(row => [...row]); // 2D boolean clone
  	const clonePast = (past) => past.map(savedGrid => cloneGrid(savedGrid)); // 3D history
	
	let data = {
		method: "GET",
	};

	useEffect(() => {
		fetch("http://127.0.0.1:5000/api/flowers", data)
		.then((response) => response.json())
		.then((data) => {
			if (data.execution.status === "SUCCESS") {
				flowers.current = data.execution.flowers;
			} else {
				console.log(response);
			}
		})
		.catch((error) => {
			console.log(error);
		});
	});

	function handleChange(event) {
		setSearch(event.target.value);
	}

	function makeEmptyGrid() {
		let grid = [];
		var x, y;
		for (x = 0; x < rows; x++) {
			grid[x] = [];
			for (y = 0; y < cols; y++) {
				grid[x][y] = ['null', 'null', 'null'];
			}
		}
		return grid;
	}

	function makeEmptyWaterGrid() {
		let grid = [];
		var x, y;
		for (x = 0; x < rows; x++) {
			grid[x] = [];
			for (y = 0; y < cols; y++) {
				grid[x][y] = false;
			}
		}
		return grid;
	}

	function setCurrentEvent(event) {
		setCurrent(event.target.id);
	}

	function setCurrentFlower(flower, gene, species) {
		setCurrent([flower, gene, species]);
	}

	function changeCell(event) {
		let x = parseInt(event.target.id[0]);
		let y = parseInt(event.target.id[1]);
		if (current === 'Water') {
			let g = cloneWater(watergrid);
			g[x][y] = !g[x][y];
			setWatergrid(g);
		} else {
			let g = cloneGrid(grid);
			g[x][y] = current;
			setGrid(g);
		}
		return;
	}

	//Revert the grid by one time step
	function revert() {
		if (pastGrids.length > 0) {
			let past = clonePast(pastGrids)
			setGrid(past.pop());
			setPastGrids(past);
		}
	}

	//Advance the grid by one time step
	function advance() {
		let past = clonePast(pastGrids);
		past.push(JSON.parse(JSON.stringify(grid)));
		setPastGrids(past);
		var x, y;
		for (x = 0; x < rows; x++) {
			for (y = 0; y < cols; y++) {
				advanceSquare(x, y);
			}
		}
		return;
	}

	async function advanceSquare(x, y) {
		let g = cloneGrid(grid);
		var spaces, neighbors, child;
		if (grid[x][y][0] !== 'null' && watergrid[x][y]) {
			spaces = getSpaces(x, y);
			if (spaces.length === 0) {
				return;
			}
			neighbors = getNeighbors(grid[x][y], x, y);
			child = (getChild(grid[x][y], neighbors, spaces));
			await child.then((data) => {
				g[data[1][0]][data[1][1]] = data[0];
				setGrid(g);
			});
		}
	}

	//Gets open spaces adjacent to a flower
	function getSpaces(x, y) {
		var a,b;
		var spaces = [];
		for (a = x-1; a <= x+1; a++) {
			for (b = y-1; b <= y+1; b++) {
				if (a >= 0 && a < rows && b >=0 && b < cols && (b !== y || a !== x)) {
					if (grid[a][b][0] === "null") {
							spaces.push([a,b]);
					}
				}
			}
		}
		return spaces;
	}

	//Gets flowers of the same species adjacent to a flower
	function getNeighbors(flower, x, y) {
		var a,b;
		var neighbors = [];
		for (a = x-1; a <= x+1; a++) {
			for (b = y-1; b <= y+1; b++) {
				if (a >= 0 && a < rows && b >=0 && b < cols && (b !== y || a !== x) && flower[2] === grid[a][b][2]) {
					neighbors.push(grid[a][b]);
				}
			}
		}
		return neighbors;
	}

	//Gets the child and position of multiple flowers
	function getChild(flower, neighbors, spaces) {
		return new Promise((resolve, reject) => {
			//If there are no neighbors, the flower duplicates
			if (neighbors.length === 0) {
				let space = spaces[Math.floor(Math.random() * spaces.length)];
				resolve([flower, space]);
			}
			//Randomly select one of the neighbors
			let neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
			//Determine the child with Flask API call
			let data = {
				method: "GET",
				headers: {
					gene1: flower[1],
					gene2: neighbor[1],
					species: flower[2]
				}
			};
			fetch("http://127.0.0.1:5000/api/child", data)
			.then((response) => response.json())
			.then((data) => {
			var ret, space;
			if (data.execution.status !== "SUCCESS") {
				ret = ['null', 'null', 'null'];
				//Randomly select an open space
				space = spaces[Math.floor(Math.random() * spaces.length)];
				//Return the child and the open space
				resolve([ret, space]);
			} else {
				ret = data.execution.child;
				console.log(ret);
				let c = ret[1].toLowerCase();
				let f = ret[0].toLowerCase();
				if (c.includes('seed')) {
					c = c.slice(0, c.length - 7);
				}
				ret[0] = c + f;
				ret[1] = ret[2];
				ret[2] = flower[2];
				//Randomly select an open space
				space = spaces[Math.floor(Math.random() * spaces.length)];
				//Return the child and the open space
				resolve([ret, space]);
			}
			})
			.catch((error) => {
				var ret = ['null', 'null', 'null'];
				//Randomly select an open space
				var space = spaces[Math.floor(Math.random() * spaces.length)];
				//Return the child and the open space
				resolve([ret, space]);
			});
		});
	}

	function save() {
		let save = {grid: grid, watergrid: watergrid, pastGrids: pastGrids}
		let stringify = JSON.stringify(save);
		let b64 = btoa(stringify);
		let data = new Blob([b64], {type: 'text/plain'});
		let url = window.URL.createObjectURL(data);
		return url;
	}

	function load(event) {
		var fr = new FileReader();
		fr.readAsText(event.target.files[0]);
		fr.onload = function(e) {
			let save = JSON.parse(atob(fr.result));
			console.log(save);
			setGrid(save.grid);
			setWatergrid(save.watergrid);
			setPastGrids(save.pastGrids);
		};
	}

	function renderGrid() {
		let arr = [];
		var x;
		for (x = 0; x < rows; x++) {
			arr.push(<div key = {"row" + x.toString()} className="row justify-content-md-center g-0 grid-row"> {renderRow(x)} </div>);
		}
		return arr;
	}

	function renderRow(x) {
		let arr = [];
		var y;
		for (y = 0; y < cols; y++) {
			let color = watergrid[x][y] ? 'skyblue':'peru';
			arr.push(<div key={x.toString() + y.toString()} className="col-auto p-0 grid-cell" style={{backgroundColor: color}} onClick = {changeCell}>
				<Flower
					flower = {grid[x][y][0]}
					gene = {grid[x][y][1]}
					x = {x}
					y = {y}
				/>
			</div>);
		}
		return arr;
	}

	function searchFlowers() {
		let arr = [];
		arr.push(
			<div className="col-4">
				<div className="list-group" id="list-tab" role="tablist">
					<button className="list-group-item active" id='Water' role="tab" onClick = {setCurrentEvent}> Water </button>
					<button className="list-group-item" id='Remove' role="tab" onClick={() => setCurrentFlower("null", "null", "null")}> Remove </button>
					<br/>
					<div className="container-75 text-center">
						<h5>Flowers</h5>
						<p>Search by flower, color, or genes:</p>
						<input className="form-control" id="myInput" type="text" placeholder="Search" onChange={handleChange}/>
						<table className="table table-bordered table-striped">
							<thead>
								<tr>
									<th>Flower</th>
									<th>Color</th>
									<th>Genes</th>
								</tr>
							</thead>
							<tbody id="myTable">
								{populateTable()}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
		return arr;
	}

	function populateTable() {
		let arr = [];
		var x;
		for (x = 0; x < flowers.current.length; x++) {
			let y = x;
			let gene = flowers.current[x][2];
			let species = flowers.current[x][0];
			if (showEntry(flowers.current[x][0], flowers.current[x][1], flowers.current[x][2])) {
				arr.push(<tr key = {"fl"+x.toString()} onClick={() => setCurrentFlower(makeID(y), gene, species)}>
					<td>{flowers.current[x][0]}</td>
					<td>{flowers.current[x][1]}</td>
					<td>{flowers.current[x][2]}</td>
				</tr>);
			}
		}
		return arr;
	}

	function showEntry(f, c, g) {
		let arr = search.split(" ");
		if (arr.length === 1) {
			return f.includes(search) || c.includes(search) || g.includes(search);
		}
		if (f.includes(arr[0])) {
			return c.includes(arr[1]) || g.includes(arr[1]);
		} else if (c.includes(arr[0])) {
			return f.includes(arr[1]) || g.includes(arr[1]);
		} else if (g.includes(arr[0])) {
			return c.includes(arr[1]) || f.includes(arr[1]);
		}
		return false;
	}

	function makeID(x) {
		let c = flowers.current[x][1].toLowerCase();
		let f = flowers.current[x][0].toLowerCase();
		if (c.includes('seed')) {
			c = c.slice(0, c.length - 7);
		}
		return c + f;
	}

	return(
		<div className="row">
			{searchFlowers()}
			<div className="col-8">
				<div className="tab-content" id="nav-tabContent">
					<div className="tab-pane fade show active" id="list-home" role="tabpanel" aria-labelledby="list-home-list">
						<div className="container">
							<div key = "Advance" className="row justify-content-md-center">
								<button type="button" className="btn btn-primary col-sm-2 m-4" onClick={revert}>
									Rewind
								</button>
								<button type="button" className="btn btn-primary col-sm-2 m-4" onClick={advance}>
									Advance
								</button>
							</div>
							{renderGrid()}
							<br/>
							<div className="row justify-content-md-center">
								<label className="btn btn-primary col-sm-2 m-4"> 
									<a className="text-white" href={save()} download="garden">Save</a>
								</label>
								<label className="btn btn-primary col-sm-2 m-4" onChange={load}>
									Load <input type="file" style={{display:"none"}}/>
								</label>
							</div>
							<p> Disclaimer: Watered flowers are guaranteed to reproduce every day and probabilities are based on Mendelian genetics. </p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
