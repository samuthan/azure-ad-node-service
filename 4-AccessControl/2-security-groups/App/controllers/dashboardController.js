const Todo = require('../model/todo');

exports.getAllTodos = (req, res) => {

    console.log('Dashboard',req );
        const todos = Todo.getAllTodos();

    //
    
    db.get('todos').push(todos).write();

    res.status(200).json(todos);
    //res.render('dashboard', { isAuthenticated: req.authContext.isAuthenticated(), todos: todos });
}