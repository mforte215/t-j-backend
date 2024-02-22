const {User, Blog} = require('../models');
const {signToken, AuthenticationError} = require('../utils/auth');

const resolvers = {
    Query: {
        users: async () => {
            return User.find();
        },
        user: async (parent, {username}) => {
            return User.findOne({username});
        },
        me: async (parent, args, context) => {
            if (context.user) {
                return Blog.find({author: context.user._id});
            }
            throw AuthenticationError;
        },
        blogs: async () => {
            return Blog.find().populate('author').sort({date: -1});
        },
        blog: async (parent, {_id}) => {
            return Blog.findOne({_id: _id}).populate('author');
        }
    },

    Mutation: {
        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({username, email, password});
            const token = signToken(user);
            return {token, user};
        },
        login: async (parent, {username, password}) => {
            const user = await User.findOne({username});

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);

            return {token, user};
        },
        addBlog: async (parent, {image, title, subtitle, content}, context) => {
            if (context.user) {

                const blog = await Blog.create({
                    image: image,
                    title: title,
                    subtitle: subtitle,
                    content: content,
                    author: context.user._id
                });

                return blog;
            }
            throw AuthenticationError;
            ('You need to be logged in!');
        },
        removeBlog: async (parent, {id}, context) => {
            if (context.user) {
                //get the blog and make sure the IDs match
                const foundBlog = Blog.findOne({_id: id}).populate('author');
                if (foundBlog.author._id == context.user._id) {
                    //is the owner of the blog
                    const removedBlog = await Blog.findOneAndDelete({
                        _id: id
                    });
                    return removedBlog;
                }
            }
            throw AuthenticationError;
            ('You need to be logged in!');
        },
    },
};

module.exports = resolvers;
