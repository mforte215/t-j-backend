const typeDefs = `
  type User {
    _id: ID
    username: String
    email: String
    password: String
  }

  type Blog {
    _id: ID
    image: String
    title: String
    subtitle: String
    content: String
    author: User
    date: String
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users: [User]
    user(username: String!): User
    me: [Blog]
    blogs: [Blog]
    blog(_id: ID): Blog
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(username: String!, password: String!): Auth
    addBlog(image: String!, title: String!, subtitle: String!, content: String!): Blog
    removeBlog(id: ID!): Blog
  }
`;

module.exports = typeDefs;
