from helpers.flowers import get_flowers_by_color, flower_by_id, get_parent_probas, fill_db, flower, get_flowers, get_child

# Puts the flower data in the db
def populate_db():
	response = {
		'execution': {
			'status': 'FAILED',
			'message': None
		}
	}

	try:
		fill_db()
	except Exception as e:
		response['execution']['message'] = 'Something went wrong! ' + str(e)
		return response

	response['execution']['message'] = 'Success!'
	response['execution']['status'] = 'SUCCESS'
	return response

def flowers_by_color(request):
	response = {
		'execution': {
			'status': 'FAILED',
			'message': None
		}
	}

	# Get a list of header params
	header = [each.lower() for each in request.headers.keys()]

	# Load color
	if 'color' in header:
		try:
			color = request.headers["color"]
		except Exception as e:
			response['execution']['message'] = 'Something went wrong! ' + str(e)
			return response
	else:
		response['execution']['message'] = 'Missing argument \"color\"'
		return response

	# Load species
	if 'species' in header:
		try:
			species = request.headers["species"]
		except Exception as e:
			response['execution']['message'] = 'Something went wrong! ' + str(e)
			return response
	else:
		response['execution']['message'] = 'Missing argument \"species\"'
		return response

	# Get the flowers
	try:
		ret = []
		for x in get_flowers_by_color(color, species):
			ret.append(str(x))
		response['flowers'] = ret
	except Exception as e:
		response['execution']['message'] = 'Something went wrong! ' + str(e)
		return response

	response['execution']['message'] = 'Success!'
	response['execution']['status'] = 'SUCCESS'
	return response

def parent_probas(request):
	response = {
		'execution': {
			'status': 'FAILED',
			'message': None
		}
	}

	# Get a list of header params
	header = [each.lower() for each in request.headers.keys()]

	# Load color
	if 'flowerid' in header:
		try:
			flower_id = request.headers["flowerid"]
		except Exception as e:
			response['execution']['message'] = 'Something went wrong! ' + str(e)
			return response
	else:
		response['execution']['message'] = 'Missing argument \"flowerid\"'
		return response

	# Load species
	if 'species' in header:
		try:
			species = request.headers["species"]
		except Exception as e:
			response['execution']['message'] = 'Something went wrong! ' + str(e)
			return response
	else:
		response['execution']['message'] = 'Missing argument \"species\"'
		return response

	# Get the parent probabilities
	try:
		result = flower_by_id(flower_id, species)
		results, df = get_parent_probas(result)
		response['parents'] = df.to_json()
	except Exception as e:
		response['execution']['message'] = 'Something went wrong! ' + str(e)
		return response

	response['execution']['message'] = 'Success!'
	response['execution']['status'] = 'SUCCESS'
	return response

# Get all the flowers as a list
def flowers():
	response = {
		'execution': {
			'status': 'FAILED',
			'message': None,
			'flowers': []
		}
	}

	try:
		response['execution']['flowers'] = get_flowers()
	except Exception as e:
		response['execution']['message'] = 'Something went wrong! ' + str(e)
		return response

	response['execution']['message'] = 'Success!'
	response['execution']['status'] = 'SUCCESS'
	return response

# Get all the flowers as a list
def child(request):
	response = {
		'execution': {
			'status': 'FAILED',
			'message': None,
			'child': None
		}
	}

	# Get a list of header params
	header = [each.lower() for each in request.headers.keys()]

	# Load gene1
	if 'gene1' in header:
		try:
			gene1 = request.headers["gene1"]
		except Exception as e:
			response['execution']['message'] = 'Something went wrong! ' + str(e)
			return response
	else:
		response['execution']['message'] = 'Missing argument \"gene1\"'
		return response

	# Load gene2
	if 'gene2' in header:
		try:
			gene2 = request.headers["gene2"]
		except Exception as e:
			response['execution']['message'] = 'Something went wrong! ' + str(e)
			return response
	else:
		response['execution']['message'] = 'Missing argument \"gene2\"'
		return response

	# Load species
	if 'species' in header:
		try:
			species = request.headers["species"]
		except Exception as e:
			response['execution']['message'] = 'Something went wrong! ' + str(e)
			return response
	else:
		response['execution']['message'] = 'Missing argument \"species\"'
		return response

	try:
		response['execution']['child'] = get_child(gene1, gene2, species)
	except Exception as e:
		response['execution']['message'] = 'Something went wrong! ' + str(e)
		return response

	response['execution']['message'] = 'Success!'
	response['execution']['status'] = 'SUCCESS'
	return response