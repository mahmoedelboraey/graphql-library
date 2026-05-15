export const typeDefs = `#graphql

scalar Date

enum Genre {
  Novel
  Fiction
}

type User {
  id: ID!
  username: String!
  email: String!
}

type Book {
  id: ID!
  title: String!
  pages: Int!
  genre: Genre!
  author: User!
  createdAt: Date!
  updatedAt: Date!
}

type AuthPayload {
  token: String!
}

input BookInput {
  title: String!
  pages: Int!
  genre: Genre!
}

input UpdateBookInput {
  id: ID!
  title: String
  pages: Int
}

input UserInput {
  username: String!
  email: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

type Query {
  hello: String

  books(
    genre: Genre
    limit: Int
    skip: Int
  ): [Book]

  me: User

  myBooks: [Book]
}

type Mutation {
  signup(input: UserInput!): String!

  login(input: LoginInput!): AuthPayload!

  addBook(input: BookInput!): Book!

  updateBook(input: UpdateBookInput!): Book!

  deleteBook(id: ID!): String!
}
`;