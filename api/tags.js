const express = require ('express');
const { getAllTags,getPostsByTagName } = require('../db');
const tagsRouter = express.Router();

tagsRouter.use((req,res,next) => {
    console.log("A request is being made to /posts");

    // res.send({ message: 'hello from /users!'});

    next();
});

tagsRouter.get('/', async (req,res) => {
    const tags = await getAllTags();

    res.send({
        tags
    });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const tagN = req.params.tagName
    try {
      // use our method to get posts by tag name from the db
    const post = await getPostsByTagName(tagN);
      // send out an object to the client { posts: // the posts }
      res.send({post:post})
    } catch ({ name, message }) {

    next({name, message})
      // forward the name and message to the error handler
    }
  });

module.exports = tagsRouter;