from db.connect import connect

def update(_id, data, collection):
    try:
        client = connect()
        database = client['flowers']
        document = database[collection]

        find_record = { "_id": _id }
        update_values = { "$set": data }

        document.update_one(find_record,update_values)
        client.close()
        return

    except Exception as e:
        raise e

def store(data, collection):
    try:
        client = connect()
        database = client['flowers']
        document = database[collection]
        document.insert_one(data)
        client.close()
        return

    except Exception as e:
        return e
