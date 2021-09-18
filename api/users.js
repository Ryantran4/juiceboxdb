const express = require('express');
const { JsonWebTokenError } = require('jsonwebtoken');
const usersRouter = express.Router();

const { getAllUsers, getUserByUsername, createUser } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

usersRouter.use((req,res,next) => {
    console.log("A request is being made to /users");

    // res.send({ message: 'hello from /users!'});

    next();
});

usersRouter.get('/', async (req,res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
});

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    // console.log('>>>username, password', username, password);
    // const user = await getUserByUsername(username);
    // const passwordIsMatch = user.password === password;
    // console.log('>>>>>>passwordIsMatch', passwordIsMatch);

    // if (passwordIsMatch) { const token = jwt.sign(user, JWT_SECRET);
    // res.send(token);
  
  
    // request must have both
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
  
      if (user && user.password == password) {
        // create token & return to user
        res.send({ message: "you're logged in!","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJqb3NodWEiLCJpYXQiOjE2MzE5Mzk4NzF9.illdP43YaGLwjksUpsbNBYd8mg71zRIeYUgM1gTt4Xs"});
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

  usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
  
    try {
      const _user = await getUserByUsername(username);
  
      if (_user) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      }
  
      const user = await createUser({
        username,
        password,
        name,
        location,
      });
  
      const token = jwt.sign({ 
        id: user.id, 
        username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });
  
      res.send({ 
        message: "thank you for signing up",
        token 
      });
    } catch ({ name, message }) {
      next({ name, message })
    } 
  });

module.exports = usersRouter;

