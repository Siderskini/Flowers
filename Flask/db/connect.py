import configparser
from pymongo import MongoClient

config_path = './config/config.ini'

def connect():
    """Stuff related to connecting to DB goes here"""
    """This is the place where later migration script will come into picture"""

    config = configparser.ConfigParser()
    try:
        config.read(config_path)
        host = config['db']['host']
    except:
        raise Exception('Error while reading host for DB from Config File')

    try :
        client = MongoClient(host)
    except:
        raise Exception('Error while connecting to DB')

    return client
