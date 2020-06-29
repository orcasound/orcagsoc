# AL&L of Orca Sounds' Web App

**Active Listening and Learning of Orca Sounds** is an active learning tool that has the objective of labeling orca sounds with the help of humans and machines.

**The Web App** runs on the client's side and makes use AL&L of Orca Sounds's API.

# Getting Started

-   Make sure [Node.js](http://nodejs.org) is installed
-   Clone the repo and `cd` into the project directory
-   Run `npm install` to install all the dependencies
-   Run `npm start` to start a development server in [http://localhost:8080](http://localhost:8080) (For the app to work correctly, you need to start the API server as well)
-   We're using ESLint and Prettier, so if you use VSCode, download their extensions so that the tools are run automatically

### Deployment

-   `npm run build` builds the production code to the `dist` folder
-   Then use the `npm run deploy` command to publish the dist folder to the gh-pages branch on GitHub
