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
            return Blog.find().populate('author').populate('tags').sort({date: -1});
        },
        blog: async (parent, {_id}) => {
            return Blog.findOne({_id: _id}).populate('author').populate('tags');
        },
        userBlogs: async (parent, {_id}) => {
            return Blog.find({author: _id}).populate('author').populate('tags');
        },
        singleBlogByMe: async (parent, {blogId}, context) => {
            if (context.user) {

                const foundBlog = await Blog.findOne({_id: blogId}).populate('author').populate('tags');
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
        },
        checkIfTagExists: async (parent, {name}) => {
            let doesExist = await Tag.exists({name: name});
            console.log("LOGGING RETURN");
            console.log(doesExist);
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
        addTag: async (parent, {name}) => {
            const tag = await Tag.create({name: name});
            return tag;
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
        addBlog: async (parent, {image, title, subtitle, content, tags}, context) => {
            if (context.user) {
                const myTagsToCreate = [];

                for (let i = 0; i < tags.length; i++) {
                    const tag = await Tag.findOne({name: tags[i]});
                    console.log("DID FIND TAG?")
                    console.log(tag);
                    if (!tag) {
                        const newTag = await Tag.create({name: tags[i]});
                        console.log("NEWLY CREATED TAG");
                        console.log(newTag);
                        myTagsToCreate.push(newTag._id);
                    }
                    else {
                        myTagsToCreate.push(tag._id);
                    }
                }
                const blog = await Blog.create({
                    image: image,
                    title: title,
                    subtitle: subtitle,
                    content: content,
                    author: context.user._id,
                    tags: myTagsToCreate
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

        },
        AddTagToBlog: async (parent, {findBlog, tagName}) => {

            console.log("ADDING NEW TAGS TO BLOG");
            const myTagsToCreate = [];

            for (let i = 0; i < tagName.length; i++) {
                const tag = await Tag.findOne({name: tagName[i]});
                console.log("DID FIND TAG?")
                console.log(tag);
                if (!tag) {
                    const newTag = await Tag.create({name: tagName[i]});
                    console.log("NEWLY CREATED TAG");
                    console.log(newTag);
                    myTagsToCreate.push(newTag._id);
                }
                else {
                    myTagsToCreate.push(tag._id);
                }
            }

            console.log("NEW TAGs");
            console.log(myTagsToCreate);

            const updatedBlog = await Blog.findOneAndUpdate(
                {_id: findBlog},
                {
                    $addToSet: {
                        tags: myTagsToCreate
                    }
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).populate('author').populate('tags');

            return updatedBlog
        }
    }
}

module.exports = resolvers;
