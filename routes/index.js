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
      .orderBy([
        { column: 'status', order: 'asc' },
        { column: 'order_position', order: 'asc' },
        { column: 'id', order: 'desc' }
      ])
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
    const view = req.query.view;
    return res.render('index', {
      title: 'ToDo App',
      todos: [],
      isAuth: isAuth,
      view: view,
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
      // Preserve view parameter if provided
      const view = req.query.view;
      if (view) {
        res.redirect(`/?view=${view}`);
      } else {
        res.redirect('/');
      }
    })
    .catch(function (err) {
      console.error('Error inserting task:', err);
      const view = req.query.view;
      res.render('index', {
        title: 'ToDo App',
        todos: [],
        isAuth: isAuth,
        view: view,
        errorMessage: [err.sqlMessage],
      });
    });
});

// Route to update task status (for Kanban board)
router.post('/status/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  
  if (!isAuth) {
    return res.status(401).json({error: 'Not authenticated'});
  }
  
  const taskId = req.params.id;
  const userId = req.user.id;
  const newStatus = req.body.status;
  
  console.log('Status update request:', { taskId, userId, newStatus });
  
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
      console.log('Task status updated successfully');
      res.json({success: true, taskId, newStatus});
    })
    .catch(function (err) {
      console.error('Error updating task status:', err);
      res.status(500).json({error: 'Failed to update task status'});
    });
});

// Route to reorder tasks within the same column
router.post('/reorder', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  
  if (!isAuth) {
    return res.status(401).json({error: 'Not authenticated'});
  }
  
  const userId = req.user.id;
  const { taskId, newPosition, status } = req.body;
  
  console.log('Reorder request:', { taskId, newPosition, status, userId });
  
  // Validate inputs
  if (!taskId || newPosition === undefined || !status) {
    return res.status(400).json({error: 'Missing required parameters'});
  }
  
  // First, get all tasks in the same status for this user, ordered by current position
  knex("tasks")
    .where({ user_id: userId, status: status })
    .orderBy('order_position', 'asc')
    .then(function (tasks) {
      if (!tasks || tasks.length === 0) {
        return res.status(404).json({error: 'No tasks found'});
      }
      
      // Find the task being moved
      const taskIndex = tasks.findIndex(t => t.id == taskId);
      if (taskIndex === -1) {
        return res.status(404).json({error: 'Task not found'});
      }
      
      // Remove the task from its current position
      const [movedTask] = tasks.splice(taskIndex, 1);
      
      // Insert it at the new position
      tasks.splice(newPosition, 0, movedTask);
      
      // Update order_position for all affected tasks
      const updatePromises = tasks.map((task, index) => {
        return knex("tasks")
          .where({ id: task.id, user_id: userId })
          .update({ order_position: index });
      });
      
      return Promise.all(updatePromises);
    })
    .then(function () {
      console.log('Task order updated successfully');
      res.json({success: true, taskId, newPosition, status});
    })
    .catch(function (err) {
      console.error('Error reordering tasks:', err);
      res.status(500).json({error: 'Failed to reorder tasks'});
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
      
      // Toggle the completed status and sync with Kanban status
      const newCompleted = !task.completed;
      const newStatus = newCompleted ? 'done' : 'todo';
      
      return knex("tasks")
        .where({id: taskId, user_id: userId})
        .update({
          completed: newCompleted,
          status: newStatus
        });
    })
    .then(function () {
      // Preserve view parameter if provided
      const view = req.query.view;
      if (view) {
        res.redirect(`/?view=${view}`);
      } else {
        res.redirect('/');
      }
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
      // Preserve view parameter if provided
      const view = req.query.view;
      if (view) {
        res.redirect(`/?view=${view}`);
      } else {
        res.redirect('/');
      }
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
      // Preserve view parameter if provided
      const view = req.query.view;
      if (view) {
        res.redirect(`/?view=${view}`);
      } else {
        res.redirect('/');
      }
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
