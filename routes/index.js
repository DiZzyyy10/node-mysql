const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (isAuth) {
    const userId = req.user.id;
    knex("tasks")
      .select("*")
      .where({user_id: userId})
      .then(function (results) {
        res.render('index', {
          title: 'ToDo App',
          todos: results,
          isAuth: isAuth,
        });
      })
      .catch(function (err) {
        console.error(err);
        res.render('index', {
          title: 'ToDo App',
          todos: [],
          isAuth: isAuth,
          errorMessage: [err.sqlMessage],
        });
      });
  } else {
    res.render('index', {
      title: 'ToDo App',
      isAuth: isAuth,
    });
  }
});

router.post('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  
  if (!isAuth) {
    // If user is not authenticated, redirect to signin
    return res.redirect('/signin');
  }
  
  const userId = req.user.id;
  const todo = req.body.add;
  
  // Validate that todo content is provided
  if (!todo || todo.trim() === '') {
    return res.render('index', {
      title: 'ToDo App',
      todos: [],
      isAuth: isAuth,
      errorMessage: ['Please enter a task'],
    });
  }
  
  knex("tasks")
    .insert({user_id: userId, content: todo.trim()})
    .then(function () {
      res.redirect('/')
    })
    .catch(function (err) {
      console.error('Error inserting task:', err);
      res.render('index', {
        title: 'ToDo App',
        todos: [],
        isAuth: isAuth,
        errorMessage: [err.sqlMessage],
      });
    });
});

// Route to toggle task completion
router.post('/toggle/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  
  if (!isAuth) {
    return res.redirect('/signin');
  }
  
  const taskId = req.params.id;
  const userId = req.user.id;
  
  // First verify the task belongs to the current user
  knex("tasks")
    .where({id: taskId, user_id: userId})
    .first()
    .then(function (task) {
      if (!task) {
        return res.status(404).json({error: 'Task not found'});
      }
      
      // Toggle the completed status
      return knex("tasks")
        .where({id: taskId, user_id: userId})
        .update({completed: !task.completed});
    })
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      console.error('Error toggling task:', err);
      res.status(500).json({error: 'Failed to toggle task'});
    });
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;
