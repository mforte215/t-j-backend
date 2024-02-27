const {User, Blog, Tag} = require('../models');
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
        },
        userBlogs: async (parent, {_id}) => {
            return Blog.find({author: _id}).populate('author');
        },
        singleBlogByMe: async (parent, {blogId}, context) => {
            if (context.user) {

                const foundBlog = await Blog.findOne({_id: blogId}).populate('author');
                if (foundBlog.author._id == context.user._id) {

                    //user owns the blog
                    return foundBlog
                }
                throw AuthenticationError;
            }
            throw AuthenticationError;
        },
        checkIfAccountExists: async (parent, {email}) => {
            let doesExist = await User.exists({email: email});
            if (doesExist?._id) {
                return true
            }
            else {
                return false
            }
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
        removeBlog: async (parent, {removeBlogId}, context) => {
            console.log("IN RESOLVER");
            console.log("ID TO DELETE: " + removeBlogId);
            if (context.user) {
                //get the blog and make sure the IDs match
                const foundBlog = await Blog.findOne({_id: removeBlogId});
                if (foundBlog.author._id == context.user._id) {
                    //is the owner of the blog
                    const removedBlog = await Blog.findOneAndDelete({
                        _id: removeBlogId
                    });
                    return removedBlog;
                }
            }
            throw AuthenticationError;
            ('You need to be logged in!');
        },
        editBlog: async (parent, {blogId, image, title, subtitle, content}, context) => {
            if (context.user) {
                console.log("IN MUTATION. FOUND USER")
                const foundBlog = await Blog.findOne({_id: blogId}).populate('author');
                if (foundBlog.author._id == context.user._id) {

                    const filter = {_id: blogId};
                    const update = {
                        image: image,
                        title: title,
                        subtitle: subtitle,
                        content: content,
                    }
                    const updatedBlog = await Blog.findOneAndUpdate(
                        filter,
                        update,
                        {returnOriginal: false}
                    );

                    return updatedBlog;
                }
                throw AuthenticationError;
            }

        }
    },
};

module.exports = resolvers;
