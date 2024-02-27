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
    tags: [Tag]
  }

  type Tag {
    name: String
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
    userBlogs(_id: ID): [Blog]
    singleBlogByMe(blogId: ID!): Blog
    checkIfAccountExists(email: String): Boolean
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(username: String!, password: String!): Auth
    addBlog(image: String!, title: String!, subtitle: String!, content: String!): Blog
    removeBlog(removeBlogId: ID!): Blog
    editBlog(blogId: ID!, image: String, title: String, subtitle: String, content: String): Blog
  }
`;

module.exports = typeDefs;
