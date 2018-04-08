const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session);
const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: 'asidn1-2d#*@',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        port: 8888,
        user: 'study',
        password: 'study',
        database: 'o2'
    })
}));

app.get('/count', (req, res) => {
    if(req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }

    res.send('count : ' + req.session.count);
});

app.get('/welcome', (req, res) => {
    if(req.session.displayName) {
        res.send(`
        <h1>Hello, ${req.session.displayName}</h1> 
        <a href="/auth/logout">Logout</a>
        `);
    } else {
        res.send(`
        <h1>Welcome</h1>
        <ul>
            <li><a href="/auth/login">Login</a></li>
            <li><a href="/auth/register">Register</a></li>
        </ul>
        `);
    }
});

app.get('/auth/login', (req, res) => {
    var output = `
    <h1>LogIn</h1>
    <form action="/auth/login" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `;
    res.send(output);
});

app.post('/auth/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    for(var i = 0; i < users.length; i++) {
        var user = users[i];
        if(username === user.username && password === user.password) {
            req.session.displayName = user.displayName;
            return req.session.save(() => {
                res.redirect('/welcome');
            });
        }
        
    }
    res.send('Who are you? <a href="/auth/login">login</a>');
});


app.get('/auth/logout', (req, res) => {
    delete req.session.displayName;             
    req.session.save(() => {
        //delete를 통해 지워지는 작업이 mysql에서 진행이 완료된 후에 콜백함수를 통해
        //반환해주어야 모든 작업이 완료된 후에 리다이렉트 할 수 있게 된다.
        res.redirect('/welcome');
    });
});

app.get('/auth/register', (req, res) => {
    var output = `
    <h1>Register</h1>
    <form action="/auth/register" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="text" name="displayName" placeholder="displayName">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `;
    res.send(output);
});

var users = [
];

app.post('/auth/register', (req, res) => {
    var user = {
        username: req.body.username,
        password: req.body.password,
        displayName: req.body.displayName
    };
    users.push(user);
    req.session.displayName = req.body.displayName;
    req.session.save(() => {
        res.redirect('/welcome');
    });
});

app.listen(3000, () => {
    console.log("Connected to 3000 port");
});
