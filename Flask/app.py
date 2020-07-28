from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from workers.responsehandler import flowers_by_color, parent_probas, populate_db, flowers, child

app = Flask(__name__)
CORS(app)

# Uncommment during debug
#app.config["DEBUG"] = True

"""
Pass in:
Nothing

Populates the db with flower data
"""
@app.route('/api/populate', methods=['POST'])
def populate():
    return jsonify(populate_db())

"""
Pass in 
{
	color: color of flower
	species: species of flower
}
Get a list of flower data objects that match your query
"""
@app.route('/api/flowers_by_color_species', methods=['GET'])
def get_flowers_by_color_species():
    return jsonify(flowers_by_color(request))

"""
Pass in
{
	flower_id: the id of the flower data object
	species: the species of the flower
}
Get a dataframe of possible parent combos and the probability of this flower being their child
"""
@app.route('/api/parent_probas', methods=['GET'])
def get_parent_probas():
	return jsonify(parent_probas(request))

"""
Gets all flowers
"""
@app.route('/api/flowers', methods=['GET'])
def get_flowers():
	return jsonify(flowers())

"""
Gets child of 2 flowers based on gene and species
"""
@app.route('/api/child', methods=['GET'])
def get_child():
	return jsonify(child(request))

