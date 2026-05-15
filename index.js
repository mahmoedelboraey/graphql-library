import express from 'express';
import cors from 'cors';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

import { connectToDatabase, model } from './db.js';

import { resolvers } from './graphql/resolved.js';
import { typeDefs } from './graphql/schema.js';
import dotenv from 'dotenv';
dotenv.config();
const port = 3000;

await connectToDatabase();

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
});

await apollo.start();

const app = express();

const getUserFormatRequest = async (req, models) => {
  console.log("AUTH HEADER:", req.headers.authorization);
  const tokenWithBearer = req.headers.authorization || '';

  try {
    const token = tokenWithBearer.startsWith('Bearer ')
      ? tokenWithBearer.slice(7)
      : null;

    if (!token) {
      return null;
    }

    const response = jwt.verify(
      token,
      'your-secret-key'
    );

    const user = await models.User.findById(
      response.userId
    );

    return user ? { user } : null;
  } catch (error) {
    return null;
  }
};

app.use(
  '/graphql',
  cors(),
  express.json(),

  expressMiddleware(apollo, {
  context: async ({ req }) => {
    const user = await getUserFormatRequest(req, model);
    return { user };
  },
})
);

app.listen(port, () => {
  console.log(
    `Server is running on http://localhost:${port}/graphql`
  );
});