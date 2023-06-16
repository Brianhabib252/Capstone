# Cloud Computing Nufochild API
Welcome to our Nufochild API

![Cloud Architecture](https://github.com/yasfaa/fast-api/assets/72448886/a895b638-6faf-4b41-925b-12be7810f1d1)

## What you need
1. Cloud Environment: Google Cloud Platform (Cloud Run, Cloud Storage, Cloud SQL)
2. Programming Language: Node js, Python
3. Web Server: Express and Fast-api
4. Server: Cloud Run

# How to setup Locally
1. clone the project first
2. checkout to branch `main` 
3. install node js (>18.5 or latest) and npm (>9.7 or latest)
4. install python3 (>3.7 or latest) and pip (>18.1 or latest)
5. install my sql server (>8.0 or latest)
6. install package with `npm install` in Database API
7. install requirement.txt with `pip install -r requirement.txt` in ML API
8. run `main.py` for running the API script with `main.py`
9. open the link from Fast-api with `Postman` and change method to `POST` with the Endpoint of the ML API
10. Connect MYSQL Server to Database API with modifyng the host, user, password, database in file .env
11. Connect Cloud Storage to database API with adding path to service account credential in file app.js
11. Connect ML API to database API with adding the ML Server Url in /upload endpoint in file app.js
13. run `node app.js` for running the Database API script 
14. open the link from Express with `Postman` and change method to `GET`,`POST`,`PUT` with the end point in Database API and make header authorization : Bearer {token} for request to /auth and /profil end point

# How to setup with Google Cloud Platform
## Create Cloud Storage
1. Choose Cloud Storage on navigation menu
2. Click `Create Bucket`
3. Name your bucket as you wish
4. Location data : Region and choose `asia-southeast2 (Jakarta)`
5. Create the Bucket

## Create Cloud SQL
1. Choose Cloud SQL on navigation menu
2. Click `Create Instance` and choose MYSQL
3. Input the instance ID and password as you wish
4. Select database version MYSQL 8.0
5. Location data : Region and choose `asia-southeast2 (Jakarta)`
6. Click costumize your instance select `lightweight (1vCPU 3,5 GB)` and memory `HDD 20 GB`
7. Create Instance

## Create Cloud Run Service
1. Pick a container image that you want to deploy
2. Enter your service name
3. Choose `asia-southeast2(Jakarta)` region and `asia-southeast2-a` zone or by default zone
4. In autiscaling input 1 for minimum instance and 2 for maximum instance
5. Foe authentication click Allow unauthenticated invocations 
6. Click Container, Networrking, and Security then select capacity with memory 2 GiB and 1 CPU 
7. Add environment variable and input the key and value from .env for connecting MYSQL and Secret Key
8. In cloud SQL connection add the MYSQL instance that you want to use as databse
9. Create the cloud run service

## Build Database API Image
1. Open Cloud Shell Terminal
2. Clone the Github repository for database api
3. Open the Cloud Shell Editor
4. make the dockerfile for node js 18.15, expose in port 8080, and CMD ["node", "app.js"]
4. Go to directory capstone and build image with `gcloud builds submit --tag gcr.io/nufochild/database_api`
5. Then you can deploy in cloud run with select the database api image in container registry

## Build ML Model Image
1. Open Cloud Shell Terminal
2. Clone the Github repository for ML Model and upload the h2 file into the directory
3. Open the Cloud Shell Editor
4. make the dockerfile for 3.11.3-slim-buster, expose in port 8080,  input environment `ENV PYTHONUNBUFFERED=1 ENV HOST 0.0.0.0`, and CMD ["python", "main.py"]
4. Go to directory capstone and build image with `gcloud builds submit --tag gcr.io/nufochild/ml_model`
5. Then you can deploy in cloud run with select the ML Model in container registry
