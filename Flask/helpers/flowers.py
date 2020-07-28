import pandas as pd
import pickle
from db.store import store
from db.find import find_generic, find, get_all
from numpy import random

"""
Class to store the relevant information 
associated with a flower
"""
class flower:
	"""
	values is the row of the sheet corresponding to this flower
	self.hex is hex id
	self.gene is the unique gene string of this flower
	self.color is this flower's color
	"""
	def __init__(self, values, species):
		self.hex = values[0]
		self.gene = values[1]
		self.species = species
		if "Rose" in self.species:
			self.color = values[8]
		else:
			self.color = values[7]

	# Make printing pretty
	def __str__(self):
		return str(self.hex) + "\t" + str(self.gene) + "\t" + str(self.color) + "\t" + str(self.species)

	# True if flower2 is a potential parent/child of self
	def isParent(self, flower2):
		f2gene = flower2.gene
		return sum([self.isParentGene(self.gene[2 * x] + self.gene[2 * x + 1], f2gene[2 * x] + f2gene[2 * x + 1]) for x in range(len(flower2.gene) // 2)]) == (len(flower2.gene) // 2)

	# True if gene1 is a potential parent/child of gene2
	def isParentGene(self, gene1, gene2):
		gene1, gene2 = fix_case(gene1), fix_case(gene2)
		return gene1[0] == gene2[0] or gene1[1] == gene2[1]

	def seed(self):
		return "(seed)" in self.color

def fix_pickle():
	keys = ['Hyacinth', 'Lily', 'Mums', 'Pansy', 'Rose', 'Tulip', 'Windflower', 'Cosmos']
	new_flowers_dict = {}
	for key in keys:
		df = pd.read_csv('data/' + str(key) + '.csv')
		flowers = []
		for x in df.values:
			flowers.append(flower(x, key))
		new_flowers_dict[key] = {f.hex: f for f in flowers}
	with open('data/flowers.pkl', 'wb') as f2:
		pickle.dump(new_flowers_dict, f2)
	return new_flowers_dict

# This is all of the data from the google sheet
flowers_dict = fix_pickle()
#with open("flowers.pkl", 'rb') as fpkl:
#	pickle.load(fpkl)
#    flowers_dict = pickle.load(fpkl)

# Keys are types of flowers, printed here for reference
# No cosmos as of right now bc I completed them
#print(flowers_dict.keys())

# Given papa and mama flower, returns possible child flowers and their probabilities
def child_probas(flower1, flower2):
	flower1_genes = [fix_case(flower1.gene[2 * x] + flower1.gene[2 * x + 1]) for x in range(len(flower1.gene) // 2)]
	flower2_genes = [fix_case(flower2.gene[2 * x] + flower2.gene[2 * x + 1]) for x in range(len(flower2.gene) // 2)]
	ar1 = []
	ar2 = []
	child_dict = {}
	for x in range(len(flower1_genes)):
		carr = children(flower1_genes[x], flower2_genes[x])
		child_genes = [c[0] for c in carr]
		child_probas = [c[1] for c in carr]
		for x in range(len(child_genes)):
			if child_genes[x] in child_dict.keys():
				child_dict[child_genes[x]] = child_dict[child_genes[x]] + child_probas[x]
			else:
				child_dict[child_genes[x]] = child_probas[x]
		ar1.append(list(child_dict.keys()))
		ar2.append(list(child_dict.values()))
		child_dict = {}
	results = []
	if len(flower1_genes) < 4:
		for i in range(len(ar1[0])):
			for j in range(len(ar1[1])):
				for k in range(len(ar1[2])):
					results.append([fix_case(ar1[0][i])+fix_case(ar1[1][j])+fix_case(ar1[2][k]), ar2[0][i]*ar2[1][j]*ar2[2][k]])
	else:	# Special case for roses
		for i in range(len(ar1[0])):
			for j in range(len(ar1[1])):
				for k in range(len(ar1[2])):
					for l in range(len(ar1[3])):
						results.append([fix_case(ar1[0][i])+fix_case(ar1[1][j])+fix_case(ar1[2][k])+fix_case(ar1[3][l]), ar2[0][i]*ar2[1][j]*ar2[2][k]*ar2[3][l]])
	return results

# Changes rR to Rr
def fix_case(gene):
	if gene[1] < gene[0]:
		return gene[1] + gene[0]
	return gene

# Very literal children and probabilities genewise calculator
def children(gene1, gene2):
	return [[fix_case(gene1[0]+gene2[0]), 0.25],[fix_case(gene1[0]+gene2[1]), 0.25],[fix_case(gene1[1]+gene2[0]), 0.25],[fix_case(gene1[1]+gene2[1]), 0.25]]

# Given a flower and a string corresponsing to its species, will return a list of its possible parents
def get_parents(flower):
	flowers = flowers_dict[flower.species]
	ret = []
	for f in flowers.values():
		if f.isParent(flower):
			ret.append(f)
	return ret

# Enter a gene and species and get a flower object
def get_flower_by_gene(gene, species):
	results = []
	for f in list(flowers_dict[species].values()):
		if (gene == f.gene):
			return f
	return None

# Enter a color and species and get a list of flower objects
def get_flowers_by_color(color, species):
	results = []
	for f in list(flowers_dict[species].values()):
		if (color in f.color):
			results.append(f)
	for result in results:
	    print(str(result))
	return results

def get_flowers_by_color_db(color, species):
	# Get the data from the db instead
	results = find('color', str(color), species.lower())

# Enter a color and species and get a list of objects corresponding
# to flowers that could have created this flower
def get_parents_by_color(color, species):
	flowers = get_flowers_by_color(color, species)
	results = []
	for f in flowers:
		results.append(get_parents(f, species))
	return results

# Given a flower and species, will return a list of possible parents
# and the probability that those parents could have created this flower
def get_parent_probas(flower):
	results = []
	parents = get_parents(flower)
	for x in range(len(parents)):
		for y in range(x, len(parents)):
			probas_obj = [parents[x], parents[y], child_probas(parents[x], parents[y])]
			temp = [parents[x], parents[y], [x for x in probas_obj[2] if x[0] == flower.gene]]
			results.append(temp)
	df = pd.DataFrame.from_dict(results)
	df = preprocess(df)
	return results, df

def flower_by_id(flower_id, species):
	return flowers_dict[species][flower_id]

def flower_by_id_db(flower_id, species):
	result = find_generic('hex', flower_id, species.lower())
	return result

def heritage_data(flower):
  results = {}
  q = []
  q.append((flower,1))
  while len(q):
    temp = q.pop()
    temp2 = parent_probas(temp[0], flower.species)
    results[temp[0].gene] = temp2
    for x in temp2:
      if (x[0].gene not in results.keys()) and (not x[0].seed()):
        q.append((x[0],1))
      if ((x[1] != x[0]) and (x[1].gene not in results.keys()) and (not x[1].seed())):
        q.append((x[1],1))
  
  df = pd.DataFrame.from_dict(results[flower.gene])
  df = preprocess(df)
  return results, df

def preprocess(df):
  # Extract info from parents1 and parents2
  parent1 = [str(x) for x in df[0]]
  parent2 = [str(x) for x in df[1]]
  p1data = [str(df[0][x]).split("\t") for x in df[0].keys()]
  p2data = [str(df[1][x]).split("\t") for x in df[1].keys()]
  # Add extracted data to df
  parent1_id = [x[0] for x in p1data]
  parent1_gene = [x[1] for x in p1data]
  parent1_color = [x[2] for x in p1data]
  parent2_id = [x[0] for x in p2data]
  parent2_gene = [x[1] for x in p2data]
  parent2_color = [x[2] for x in p2data]
  df = df.assign(parent1_id = parent1_id)
  df = df.assign(parent1_gene = parent1_gene)
  df = df.assign(parent1_color = parent1_color)
  df = df.assign(parent2_id = parent2_id)
  df = df.assign(parent2_gene = parent2_gene)
  df = df.assign(parent2_color = parent2_color)

  # Extract probas info and add it to df
  probas = [x[0][1] if len(x) > 0 else 0 for x in df[2]]
  df = df.assign(probas = probas)
  df = df.drop([0, 1, 2], axis = 1)
  df = df.sort_values(by = 'probas', ascending = False)
  return df

def colorStuff(df):
	def highlight(s):
		return ['background-color: white'] * 2 + ['background-color: ' + s.parent1_color.split(' ')[0].lower()] + ['background-color: white'] * 2 + ['background-color: ' + s.parent2_color.split(' ')[0].lower()] + ['background-color: white']
	df = df.style.apply(highlight, axis=1)
	return df

def display(flower, df):
	print("PARENTS AND PROBABILITIES OF " + str(flower))
	df = colorStuff(df)
	print(df.data)
	return df

def fill_db():
	for key in list(flowers_dict.keys()):
		temp = flowers_dict[key]
		for k, v in temp.items():
			found = find_generic('hex', str(k), key.lower())
			if not found:
				store({'hex': str(k), 'gene': str(v.gene), 'color': str(v.color)}, key.lower())

def get_flowers():
	ret = []
	for key in list(flowers_dict.keys()):
		temp = flowers_dict[key]
		for k, v in temp.items():
			ret.append([key, v.color, v.gene])
	return ret

def get_child(gene1, gene2, species):
	f1 = get_flower_by_gene(gene1, species)
	f2 = get_flower_by_gene(gene2, species)
	cp = child_probas(f1, f2)
	sel = []
	total = 0
	for x in cp:
		print(total)
		sel.append([x[0], total + x[1]])
		total += x[1]
		print(total)
	rand = random.random()
	print(sel)
	g = None
	for x in range(len(sel) - 1):
		if (rand > sel[x][1] and rand < sel[x + 1][1]):
			g = sel[x][0]
	if (g == None):
		g = sel[len(sel) - 1][0]
	f = get_flower_by_gene(g, species)
	return [species, f.color, g]


