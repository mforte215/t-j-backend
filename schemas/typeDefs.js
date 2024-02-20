const typeDefs = `
  type User {
    _id: ID
    username: String
    email: String
    password: String
    blogs: [Blog]
  }

  type Blog {
    _id: ID
    title: String
    content: String
    createdAt: String
    author: User
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users: [User]
    user(username: String!): User
    me: User
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
