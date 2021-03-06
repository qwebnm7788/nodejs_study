const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
//const sha256 = require('sha256');
//const MySQLStore = require('express-mysql-session')(session);
const bkfd2Password = require("pbkdf2-password");
const hasher = bkfd2Password();
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: 'asidn1-2d#*@',
    resave: false,
    saveUninitialized: true
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

var users = [
    {
        username: 'jaewon',
        salt: 'j+gshI38K3N91QQssKLn/xL580k26ZpE0MeI5LNUseRTkqjOQp9Qv5CAm0Q2AGyk+/Yw3XtouFzqu8yk0OKbCw== ',
        password: 'gnc6wm+pB65r3uqpInsf5nbcVBw9zYPg0+KSSG9pZ74rYIWqT/AIuS8O/EZZg3ndIxU10s4tS9yZuBHQBQSW7Z1vh68aPVpMKs6FQkBUpH0qABrSNV6xWNASivOtAA8wqkVHnP+IQsP0k10PfOhgvNfldGE9C444ZbdQmHmY5E4=',
        displayName: 'Jaewon'
    }
];

app.post('/auth/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    for(var i = 0; i < users.length; i++) {
        var user = users[i];
        if(username === user.username) {
            return hasher({password: password, salt: user.salt}, (err, pass, salt, hash) => {
                if(hash === user.password) {                //password + salt의 해시값이 생성된 값과 동일하다면
                    req.session.displayName = user.displayName;
                    req.session.save(() => {                //세션에 저장될때 콜백
                        res.redirect('/welcome');
                    })
                } else {
                    res.send('Who are you? <a href="/auth/login">login</a>');
                }
            })
        }
        // if(username === user.username && sha256(password + user.salt) === user.password) {
        //     req.session.displayName = user.displayName;
        //     return req.session.save(() => {
        //         res.redirect('/welcome');
        //     });
        // }
    }
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



app.post('/auth/register', (req, res) => {
    hasher({password: req.body.password}, (err, pass, salt, hash) => {
        var user = {
            username: req.body.username,
            password: hash,                             //hash값으로 저장
            salt: salt,                                 //salt값도 함께 저장
            displayName: req.body.displayName
        };
        users.push(user);
        req.session.displayName = req.body.displayName;         //등록 직후엔 곧바로 로그인 된 상태로 반환해준다.
        console.log(users);
        req.session.save(() => {
            res.redirect('/welcome');
        });
    })
});

app.listen(3000, () => {
    console.log("Connected to 3000 port");
});
