from datetime import datetime
from pymongo import MongoClient
from bson.json_util import dumps

client = MongoClient(host="localhost", port=27017)
db = client.lego_assembly_db

# def get_timestamp():
#     return datetime.now().strftime(("%Y-%m-%d %H:%M:%S"))

# Now creating a Cursor instance
# using find() function
parts_cursor = db.parts.find()

# Converting cursor to the list 
# of dictionaries
list_parts = list(parts_cursor)
  
# Converting to the JSON
PARTS = dumps(list_parts) 

# Create a handler for our read (GET) parts
def read():
    """
    This function responds to a request for /api/parts
    with the complete lists of parts

    :return:        sorted list of parts
    """

    return PARTS