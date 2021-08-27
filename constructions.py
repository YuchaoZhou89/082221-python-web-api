from datetime import datetime
from pymongo import MongoClient
from bson.json_util import dumps
from bson.objectid import ObjectId
from bson.errors import InvalidId
from flask import make_response, abort

client = MongoClient(host="localhost", port=27017)
db = client.lego_assembly_db

def get_timestamp():
    return datetime.now().strftime(("%Y-%m-%d %H:%M:%S"))

def read():
    """
    This function responds to a request for /api/constructions
    with the complete lists of constructions
    :return:        sorted list of constructions
    """
    constructions_cursor = db.constructions.find()
    list_constructions = list(constructions_cursor)
    constructions = dumps(list_constructions) 
    
    return constructions

def read_one_by_id(id):
    constructions_cursor = db.constructions.find_one({ "_id": ObjectId(id)})
    construction = dumps(constructions_cursor)
    return construction

def read_one_by_name(name):
    constructions_cursor = db.constructions.find({ "name": name})
    list_construction = list(constructions_cursor)
    construction = dumps(list_construction)
    return construction

def create(construction):
    """
    This function creates a new construction in the constructions list
    based on the passed in construction data
    :param construction:  construction to create
    :return:              201 on success
    """
    name  = construction.get("name", None)
    parts = construction.get("parts", None)
    createTimeDate = get_timestamp()

    if name is not None:
        try:
            db.constructions.insert_one(
                {
                    "name": name,
                    "parts": parts,
                    "creationTimeDate": createTimeDate
                }
            )
            return read_one_by_name(name), 201
        except:
            abort_server_error()

def update(id, construction):
    """
    This function updates an existing construction in the constructions structure
    :param id:            id of construction to update
    :param construction:  construction to update
    :return:              updated construction structure
    """
    
    if id is not None:
        try:
            db.constructions.update_one(
                { '_id': ObjectId(id)},
                { '$set': { "name": construction.get("name"), "parts": construction.get("parts") }},
                upsert=False
            )

            return read_one_by_id(id), 200
            
        except InvalidId:
            abort_invalidId(id)
        except:
            abort_server_error()
    else:
        abort_invalidId(id)


def delete(id):
    """
    This function deletes a construction from the constructions structure
    :param id:      id of construction to delete
    :return:        200 on successful delete
    """
    if id is not None:
        try:
            db.constructions.delete_one(
                { "_id": ObjectId(id)}
            )

            return make_response(
                "Construction successfully deleted", 200
            )
        except InvalidId:
            abort_invalidId(id)
        except:
            abort_server_error()
    else:
        abort_invalidId(id)


def abort_invalidId(id):
    return abort(
            404, "Construction with ID {id} is invalid".format(id=id)
        )

def abort_server_error():
    return abort(
            500, "Internal Server Error"
        )