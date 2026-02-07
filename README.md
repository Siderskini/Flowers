# Instructions for running this app:

## First make a python environment
In the Flask folder:

a. Install venv with homebrew `brew install venv`
b. Make a new virtual environment via `virtualenv env -p [Path to Python]`
   (for example `virtualenv env -p /usr/local/bin/python3`)
c. Enter a session in your virtual environment with `source env/bin/activate`
d. `pip install -r req.txt`
e. `flask run`

## To use the MongoDB functionality:
a. Download mongodb compass
b. Go to your root directory and make a `/data` folder and a `/db` folder inside that
c. Run mongodb server with `mongod --dbpath ./data/db`
d. Inside compass, create a new db called flowers and add collections for all the flowers (in lowercase)
All of the flower data will show up in these collections when you send the populate request from Postman or other API calling app

## To run the React UI
In the React folder:

a. Install latest npm (this may need you to install or upgrade node)
b. `npm install --save-dev ajv@^7`
c. `npm start`

## A previous version using legacy React components is available on the legacy branch
