from db.connect import connect
from bson.objectid import ObjectId

def find_generic(field, value, collection):
    try:
        client = connect()
        database = client['flowers']
        document = database[collection]
    except Exception as e:
        raise e

    # we know for sure below query will return a single row
    current_row = document.find_one({field:value})

    client.close()
    return current_row

def find(field, value, collection):
    try:
        client = connect()
        database = client['flowers']
        document = database[collection]
    except Exception as e:
        raise e

    # get all matching entries
    entries = list(document.find({field:value}))

    client.close()
    return entries

def find_two_field(field1, value1, field2, value2, collection):
    try:
        client = connect()
        database = client['flowers']
        document = database[collection]
    except Exception as e:
        raise e

    # get matching entry
    entries = document.find_one({"$or":[
        {field1:value1},
        {field2:value2}
    ]})

    client.close()
    return entries

def get_all(collection):
    try:
        client = connect()
        database = client['flowers']
        document = database[collection]
    except Exception as e:
        raise e

    # get all the entries
    entries = list(document.find({}))

    client.close()
    return entries
