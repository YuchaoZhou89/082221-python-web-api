This project is a simple POC for a Lego assembly, using Python and MongoDB.

**Three components:**
1. A web API (Flask and Connexion) for parts and constructions
2. A data store in MongoDB to store the parts/construction data
3. A web page that can interact with the API (TBD)

**How to run locally:**

You will need to have a MongoDB running locally, then just spin up the `web_server.py`

**Learnings/notes:**
1. First using Python and MongoDB to build a restful API, it was fun but needed to ramp up the knowledge in a short time window.
2. I decided to to MongoDB instead of DynamoDB (the one that I am most familiar with, among all the NoSQL DBs) is because my local docker was having some issues. DDB local development needs localstack or a mimic image to deployed to docker.
3. Totally underestimated the effort that learning Python and MongoDB, but I still think this stack is faster than others that I am more familiar with (e.g. Spring+DDB)
4. I decided to leave the web/client piece for now due to time constraint.
