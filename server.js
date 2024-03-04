const express = require('express');
const {ApolloServer} = require('@apollo/server');
const {expressMiddleware} = require('@apollo/server/express4');
const path = require('path');
const {authMiddleware} = require('./utils/auth');
const cors = require("cors");

const {typeDefs, resolvers} = require('./schemas');
const db = require('./config/connection');

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const corsOptions = {
    origin: "https://tech-journey-fe.vercel.app/",
};

const PORT = Number.parseInt(process.env.PORT) || 3001;

const app = express();


// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
    await server.start();

    app.use(express.urlencoded({extended: false}));
    app.use(express.json());
    app.use(cors(corsOptions));
    app.use('/graphql', expressMiddleware(server, {
        context: authMiddleware
    }));


    db.once('open', () => {
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}!`);
            console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
        });
    });
};

// Call the async function to start the server
startApolloServer();
