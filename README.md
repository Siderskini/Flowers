Instructions for running this app:
1. Make a python environment
	a. Install venv with homebrew `brew install venv`
	b. Make a new virtual environment via `virtualenv env -p [Path to Python]`
   (for example `virtualenv env -p /usr/local/bin/python3`)
	c. Enter a session in your virtual environment with `source env/bin/activate`
	d. `pip -r req.txt`
5. `flask run`
ZA5ZeTrmrzsYyjcmVUAv

To use the MongoDB functionality:
1. Download mongodb compass
2. Go to your root directory and make a `/data` folder and a `/db` folder inside that
3. Run mongodb server with `mongod --dbpath ./data/db`
4. Inside compass, create a new db called flowers and add collections for all the flowers (in lowercase)
All of the flower data will show up in these collections when you send the populate request from Postman or other API calling app

To run the React UI
1. Install npm (this may need you to install or upgrade node)
2. `npm start`