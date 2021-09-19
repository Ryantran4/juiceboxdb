const express = require ('express');
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
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
    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
        return post.active || (req.user && post.author.id === req.user.id);
    });
    res.send({
        posts
    });
});


postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
  
    const updateFields = {};
  
    if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
    }
  
    if (title) {
      updateFields.title = title;
    }
  
    if (content) {
      updateFields.content = content;
    }
  
    try {
      const originalPost = await getPostById(postId);
  
      if (originalPost.author.id === req.user.id) {
        const updatedPost = await updatePost(postId, updateFields);
        res.send({ post: updatedPost })
      } else {
        next({
          name: 'UnauthorizedUserError',
          message: 'You cannot update a post that is not yours'
        })
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });


  postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
      const post = await getPostById(req.params.postId);
  
      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });
  
        res.send({ post: updatedPost });
      } else {
        // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
        next(post ? { 
          name: "UnauthorizedUserError",
          message: "You cannot delete a post which is not yours"
        } : {
          name: "PostNotFoundError",
          message: "That post does not exist"
        });
      }
  
    } catch ({ name, message }) {
      next({ name, message })
    }
  });


module.exports = postsRouter;



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlciI6ImFsYmVydCIsImlhdCI6MTYzMjAxODc3OX0.kQDOpKd06YvDLedZVtOl8xu3JbY1CmRJTCucq20Fmpg

