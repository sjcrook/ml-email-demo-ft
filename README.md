# ml-email-demo-ft
MarkLogic Email Demo for APG build using MarkLogic Fasttrack

## Setup Instructions

### Start container environment

docker compose up -d

\# Wait 30s then...

### Bootstrap MarkLogic

./gradlew mlDeploy -i

### Load data into MarkLogic

\# See docker-compose.yml for MarkLogic admin credentials (I'm using 38010 for the port)
./load_data.sh <ml_admin_usn> <ml_admin_pwd> <port>

\# IN ANOTHER COMMANDLINE WINDOW...

### Start the proxy

cd proxy
\# copy .env_SAMPLE to .env and modify if required
\# open .env and set TARGET_PORT to the application server port of the database
npm install
node proxy.js

\# IN ANOTHER COMMANDLINE WINDOW...

### Start the UI

cd ui
\# copy .env_SAMPLE to .env and modify if required
npm install
npm run dev
\# open a browser on the port given what it says on the screen
\# go to http://localhost:<port>/signin and sign in as the MarkLogic admin
\# Visit 2 pages:
\#    - /app/search
\#    - /app/alerts