Instructions for running this app:
1. Install venv with like homebrew or something
2. Make a new virtual environment via virtualenv env -p [Path to Python]
   (for example virtualenv env -p /usr/local/bin/python3)
3. Enter a session in your virtual environment with source env/bin/activate
4. pip -r req.txt
5. flask run
6. To end your session, type deactivate
ZA5ZeTrmrzsYyjcmVUAv

To use the MongoDB functionality:
1. Download mongodb compass
2. Go to your root directory and make a /data folder and a /db folder inside that
3. Run mongodb server with mongod --dbpath ./data/db
4. Inside compass, create a new db called flowers and add collections for all the flowers (in lowercase)
All of the flower data will show up in these collections when you send the populate request from Postman or other API calling app

To run the React UI
1. Install yarn (this may need you to install or upgrade node
2. yarn start