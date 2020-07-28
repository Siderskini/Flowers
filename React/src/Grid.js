import React from 'react';
import Flower from './Flower';
import './App.css';

class Grid extends React.Component {

	constructor() {
		super();
		this.rows = 8;
		this.cols = 8;
		this.state = {
			grid: this.makeEmptyGrid(),
			current: ['null', 'null', 'null'],
			watergrid: this.makeEmptyWaterGrid(),
			flowers: [],
			search: "",
      pastGrids: []
		};
		this.makeEmptyGrid = this.makeEmptyGrid.bind(this);
		this.makeEmptyWaterGrid = this.makeEmptyWaterGrid.bind(this);
		this.setCurrent = this.setCurrent.bind(this);
		this.changeCell = this.changeCell.bind(this);
    this.revert = this.revert.bind(this);
		this.advance = this.advance.bind(this);
		this.renderGrid = this.renderGrid.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		let data = {
      		method: "GET",
    	};
    	fetch("http://localhost:5000/api/flowers", data)
      	.then((response) => response.json())
      	.then((data) => {
        	if (data.execution.status != "SUCCESS") {
          		this.setState({flowers: []});
        	} else {
        		this.setState({flowers: data.execution.flowers});
        	}
      	})
      	.catch((error) => {
        	this.setState({flowers: []});
      	});
	}

	handleChange(event) {
  		this.setState({search: event.target.value});
  	}

	makeEmptyGrid() {
    	let grid = [];
    	var x, y;
    	for (x = 0; x < this.rows; x++) {
      		grid[x] = [];
      		for (y = 0; y < this.cols; y++) {
        		grid[x][y] = ['null', 'null', 'null'];
      		}
    	}
    	return grid;
  	}

  	makeEmptyWaterGrid() {
    	let grid = [];
    	var x, y;
    	for (x = 0; x < this.rows; x++) {
      		grid[x] = [];
      		for (y = 0; y < this.cols; y++) {
        		grid[x][y] = false;
      		}
    	}
    	return grid;
  	}

  	setCurrent(event) {
  		this.setState({current: event.target.id});
  	}

  	setCurrentFlower(flower, gene, species) {
  		this.setState({current: [flower, gene, species]});
  	}

  	changeCell(event) {
  		let x = parseInt(event.target.id[0]);
  		let y = parseInt(event.target.id[1]);
  		if (this.state.current === 'Water') {
  			let g = this.state.watergrid;
  			g[x][y] = !g[x][y];
  			this.setState({watergrid: g});
  		} else {
  			let g = this.state.grid;
  			g[x][y] = this.state.current;
  			this.setState({grid: g});
  		}
  		return;
  	}

    //Revert the grid by one time step
    revert() {
      if (this.state.pastGrids.length > 0) {
        let past = this.state.pastGrids.pop();
        this.setState({grid: past});
      }
    }

  	//Advance the grid by one time step
  	advance() {
      let past = this.state.pastGrids;
      past.push(JSON.parse(JSON.stringify(this.state.grid)));
      this.setState({pastGrids: past});
  		var x, y;
  		for (x = 0; x < this.rows; x++) {
    		for (y = 0; y < this.cols; y++) {
          this.advanceSquare(x, y);
    		}
    	}
  		return;
  	}

    async advanceSquare(x, y) {
      let g = this.state.grid;
      var spaces, neighbors, child;
      if (this.state.grid[x][y][0] !== 'null' && this.state.watergrid[x][y]) {
        spaces = this.getSpaces(x, y);
        if (spaces.length === 0) {
          return;
        }
        neighbors = this.getNeighbors(this.state.grid[x][y], x, y);
        child = (this.getChild(this.state.grid[x][y], neighbors, spaces));
        await child.then((data) => {
          g[data[1][0]][data[1][1]] = data[0];
          this.setState({grid: g});
        });
      }
    }

  	//Gets open spaces adjacent to a flower
  	getSpaces(x, y) {
  		var a,b;
  		var spaces = [];
  		for (a = x-1; a <= x+1; a++) {
    		for (b = y-1; b <= y+1; b++) {
    			if (a >= 0 && a < this.rows && b >=0 && b < this.cols && (b !== y || a !== x)) {
            if (this.state.grid[a][b][0] === "null") {
    				  spaces.push([a,b]);
            }
				  }
    		}
      }
  		return spaces;
  	}

  	//Gets flowers of the same species adjacent to a flower
  	getNeighbors(flower, x, y) {
  		var a,b;
  		var neighbors = [];
  		for (a = x-1; a <= x+1; a++) {
        for (b = y-1; b <= y+1; b++) {
      		if (a >= 0 && a < this.rows && b >=0 && b < this.cols && (b !== y || a !== x) && flower[2] === this.state.grid[a][b][2]) {
      			neighbors.push(this.state.grid[a][b]);
          }
      	}
      }
  		return neighbors;
  	}

  	//Gets the child and position of multiple flowers
  	getChild(flower, neighbors, spaces) {
      return new Promise((resolve, reject) => {
        //If there are no neighbors, the flower duplicates
        if (neighbors.length === 0) {
          let space = spaces[Math.floor(Math.random() * spaces.length)];
          return [flower, space];
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
        fetch("http://localhost:5000/api/child", data)
          .then((response) => response.json())
          .then((data) => {
            if (data.execution.status != "SUCCESS") {
                var ret = ['null', 'null', 'null'];
                //Randomly select an open space
                var space = spaces[Math.floor(Math.random() * spaces.length)];
                //Return the child and the open space
                resolve([ret, space]);
            } else {
              var ret = data.execution.child;
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
              var space = spaces[Math.floor(Math.random() * spaces.length)];
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

  	renderGrid() {
  		let arr = [];
  		var x;
    	for (x = 0; x < this.rows; x++) {
    		arr.push(<div key = {"row" + x.toString()} className="row justify-content-md-center"> {this.renderRow(x)} </div>);
    	}
  		return arr
  	}

  	renderRow(x) {
  		let arr = [];
  		var y;
  		for (y = 0; y < this.cols; y++) {
  			let color = this.state.watergrid[x][y] ? 'skyblue':'peru';
      		arr.push(<div key={x.toString() + y.toString()} className="col-0" style={{height: 40, background:color}} onClick = {this.changeCell}>
      			<Flower
        			flower = {this.state.grid[x][y][0]}
              gene = {this.state.grid[x][y][1]}
              x = {x}
              y = {y}
        		/>
    		</div>);
      	}
   		return arr;
  	}

  	search() {
  		let arr = [];
  		arr.push(
  			<div className="col-4">
				<div className="list-group" id="list-tab" role="tablist">
		  			<button className="list-group-item list-group-item-action active" id='Water' data-toggle="list" role="tab" onClick = {this.setCurrent}> Water </button>
		  			<div class="container-75">
		  				<h5>Flowers</h5>
		  				<p>Search by flower, color, or genes:</p>  
						<input class="form-control" id="myInput" type="text" placeholder="Search" onChange={this.handleChange}/>
					  	<table class="table table-bordered table-striped">
					    	<thead>
					      		<tr>
					        		<th>Flower</th>
					        		<th>Color</th>
					        		<th>Genes</th>
					      		</tr>
					    	</thead>
					    	<tbody id="myTable">
					      		{this.populateTable()}
					    	</tbody>
						</table>
					</div>
				</div>
			</div>
		);
		return arr;
  	}

  	populateTable() {
  		let arr = [];
  		var x;
  		var c, f;
  		for (x = 0; x < this.state.flowers.length; x++) {
  			let y = x;
        let gene = this.state.flowers[x][2];
        let species = this.state.flowers[x][0];
  			if (this.showEntry(this.state.flowers[x][0], this.state.flowers[x][1], this.state.flowers[x][2])) {
  				arr.push(<tr onClick={() => this.setCurrentFlower(this.makeID(y), gene, species)}>
		    		<td>{this.state.flowers[x][0]}</td>
		    		<td>{this.state.flowers[x][1]}</td>
	        		<td>{this.state.flowers[x][2]}</td>
	    		</tr>);
		    }
  		}
    	return arr;
  	}

  	showEntry(f, c, g) {
  		return f.includes(this.state.search) || c.includes(this.state.search) || g.includes(this.state.search);
  	}

  	makeID(x) {
  		let c = this.state.flowers[x][1].toLowerCase();
  		let f = this.state.flowers[x][0].toLowerCase();
  		if (c.includes('seed')) {
  			c = c.slice(0, c.length - 7);
  		}
  		return c + f;
  	}

    render() {
    	return(
    	<div className="row">
          {this.search()}
          <div className="col-8">
            <div className="tab-content" id="nav-tabContent">
              <div className="tab-pane fade show active" id="list-home" role="tabpanel" aria-labelledby="list-home-list">
                <div className="container">
  					{this.renderGrid()}
  					<div key = "Advance" className="row justify-content-md-center">
              <button type="button" className="btn btn-primary col-sm-2 m-4" onClick={this.revert}>
                Rewind
              </button>
  						<button type="button" className="btn btn-primary col-sm-2 m-4" onClick={this.advance}>
        				Advance
        			</button>
        		</div>
            <p> Disclaimer: Watered flowers are guaranteed to reproduce every day and probabilities are based on Mendelian genetics. </p>
				</div>
              </div>
              <div className="tab-pane fade" id="list-profile" role="tabpanel" aria-labelledby="list-profile-list">...</div>
              <div className="tab-pane fade" id="list-messages" role="tabpanel" aria-labelledby="list-messages-list">...</div>
              <div className="tab-pane fade" id="list-settings" role="tabpanel" aria-labelledby="list-settings-list">...</div>
            </div>
          </div>
        </div>
        );
	}
}

export default Grid