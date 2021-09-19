const express = require ('express');
const { getAllPosts, createPost } = require('../db');
const postsRouter = express.Router();
const {requireUser} = require('./utils');

postsRouter.post('/', requireUser, async( req, res, next) => {
    const {title, content, tags = ""} = req.body;

    const tagArr = tags.trim().split(/\s+/)
    const authorId = req.user.id;
    const postData = {authorId, title, content };

    if (tagArr.length) {
        postData.tags = tagArr
    }

    try {
        const post = await createPost(postData);

        if (post) {
            res.send({ post })
        } else {
            next({
                name: "Some error",
                message: 'Unable to create post!'
            });
        }
    } catch ({ name, message}) {
        next({ name, message });
    }
});

postsRouter.use((req,res,next) => {
    console.log("A request is being made to /posts");

    // res.send({ message: 'hello from /users!'});

    next();
});

postsRouter.get('/', async (req,res) => {
    const posts = await getAllPosts();

    res.send({
        posts
    });
});

module.exports = postsRouter;

