from helpers.flowers import get_flowers_by_color, flower_by_id, get_parent_probas, fill_db, flower, get_flowers

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
		results, df = get_parent_probas(flower)
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
