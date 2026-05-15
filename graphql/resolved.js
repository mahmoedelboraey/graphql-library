import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

import { model } from '../db.js';

export const resolvers = {
  Date: {
    serialize(value) {
      return new Date(value).toISOString();
    },
  },

  Query: {
    hello: () => 'Hello world',

    books: async (
      _,
      { genre, limit = 10, skip = 0 }
    ) => {
      const filter = {};

      if (genre) {
        filter.genre = genre;
      }

      const books = await model.Book.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      return books;
    },

    me: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError(
          'You must be logged in'
        );
      }

      return user;
    },

    myBooks: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError(
          'You must be logged in'
        );
      }

      return await model.Book.find({
        author: user._id,
      });
    },
  },

  Book: {
    author: async (book) => {
      console.log('Author resolver called');

      return await model.User.findById(
        book.author
      );
    },
  },

  Mutation: {
    addBook: async (_, { input }, { user }) => {
      if (!user) {
        throw new GraphQLError(
          'You must be logged in'
        );
      }

      const newBook = new model.Book({
        ...input,
        author: user._id,
      });

      await newBook.save();

      return newBook;
    },

    signup: async (_, { input }) => {
      const hashpassword = await bcrypt.hash(
        input.password,
        8
      );

      const newUser = new model.User({
        username: input.username,
        email: input.email,
        password: hashpassword,
      });

      await newUser.save();

      return 'User created successfully';
    },

    login: async (_, { input }) => {
      const user = await model.User.findOne({
        email: input.email,
      });

      const isCredentialsOK =
        user &&
        (await bcrypt.compare(
          input.password,
          user.password
        ));

      if (!isCredentialsOK) {
        throw new GraphQLError(
          'invalid email or password'
        );
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET
      );

      return { token };
    },

    updateBook: async (
      _,
      { input },
      { user }
    ) => {
      if (!user) {
        throw new GraphQLError(
          'You must be logged in'
        );
      }

      const book = await model.Book.findById(
        input.id
      );

      if (!book) {
        throw new GraphQLError(
          'Book not found'
        );
      }

      if (
        book.author.toString() !==
        user._id.toString()
      ) {
        throw new GraphQLError(
          'Not authorized'
        );
      }

      if (input.title !== undefined) {
        book.title = input.title;
      }

      if (input.pages !== undefined) {
        book.pages = input.pages;
      }

      await book.save();

      return book;
    },

    deleteBook: async (
      _,
      { id },
      { user }
    ) => {
      if (!user) {
        throw new GraphQLError(
          'You must be logged in'
        );
      }

      const book = await model.Book.findById(id);

      if (!book) {
        throw new GraphQLError(
          'Book not found'
        );
      }

      if (
        book.author.toString() !==
        user._id.toString()
      ) {
        throw new GraphQLError(
          'Not authorized'
        );
      }

      await model.Book.findByIdAndDelete(id);

      return 'Book deleted successfully';
    },
  },
};