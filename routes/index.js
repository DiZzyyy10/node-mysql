const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const view = req.query.view || 'list'; // Default to list view
  
  if (isAuth) {
    const userId = req.user.id;
    knex("tasks")
      .select("*")
      .where({user_id: userId})
      .orderBy('created_at', 'desc')
      .then(function (results) {
        res.render('index', {
          title: 'TaskFlow',
          todos: results,
          isAuth: isAuth,
          view: view,
        });
      })
      .catch(function (err) {
        console.error(err);
        res.render('index', {
          title: 'TaskFlow',
          todos: [],
          isAuth: isAuth,
          view: view,
          errorMessage: [err.sqlMessage],
        });
      });
  } else {
    res.render('index', {
      title: 'TaskFlow',
      isAuth: isAuth,
      view: view,
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
  const dueDate = req.body.due_date || null;
  
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
      priority: priority,
      due_date: dueDate
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

// Route to update task status (for Kanban board)
router.post('/status/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  
  if (!isAuth) {
    return res.redirect('/signin');
  }
  
  const taskId = req.params.id;
  const userId = req.user.id;
  const newStatus = req.body.status;
  
  // Validate status
  if (!['todo', 'in_progress', 'done'].includes(newStatus)) {
    return res.status(400).json({error: 'Invalid status'});
  }
  
  // Update completed field based on status
  const completed = newStatus === 'done' ? 1 : 0;
  
  knex("tasks")
    .where({id: taskId, user_id: userId})
    .update({
      status: newStatus,
      completed: completed
    })
    .then(function (updatedCount) {
      if (updatedCount === 0) {
        return res.status(404).json({error: 'Task not found'});
      }
      res.json({success: true});
    })
    .catch(function (err) {
      console.error('Error updating task status:', err);
      res.status(500).json({error: 'Failed to update task status'});
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
  const newDueDate = req.body.due_date || null;
  
  // Validate that content is provided
  if (!newContent || newContent.trim() === '') {
    return res.redirect('/');
  }
  
  knex("tasks")
    .where({id: taskId, user_id: userId})
    .update({
      content: newContent.trim(),
      priority: newPriority,
      due_date: newDueDate
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
