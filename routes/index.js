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
  const priority = req.body.priority || 'medium';
  
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
    .insert({
      user_id: userId, 
      content: todo.trim(),
      priority: priority
    })
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

// Route to delete a task
router.post('/delete/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  
  if (!isAuth) {
    return res.redirect('/signin');
  }
  
  const taskId = req.params.id;
  const userId = req.user.id;
  
  knex("tasks")
    .where({id: taskId, user_id: userId})
    .del()
    .then(function (deletedCount) {
      if (deletedCount === 0) {
        return res.status(404).json({error: 'Task not found'});
      }
      res.redirect('/');
    })
    .catch(function (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({error: 'Failed to delete task'});
    });
});

// Route to update a task
router.post('/edit/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  
  if (!isAuth) {
    return res.redirect('/signin');
  }
  
  const taskId = req.params.id;
  const userId = req.user.id;
  const newContent = req.body.content;
  const newPriority = req.body.priority || 'medium';
  
  // Validate that content is provided
  if (!newContent || newContent.trim() === '') {
    return res.redirect('/');
  }
  
  knex("tasks")
    .where({id: taskId, user_id: userId})
    .update({
      content: newContent.trim(),
      priority: newPriority
    })
    .then(function (updatedCount) {
      if (updatedCount === 0) {
        return res.status(404).json({error: 'Task not found'});
      }
      res.redirect('/');
    })
    .catch(function (err) {
      console.error('Error updating task:', err);
      res.status(500).json({error: 'Failed to update task'});
    });
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;
