const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bkfd2Password = require("pbkdf2-password");
const hasher = bkfd2Password();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: 'asidn1-2d#*@',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());            //session 설정부분(12~16번줄) 이후에 나와야 한다.

app.get('/count', (req, res) => {
    if(req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }

    res.send('count : ' + req.session.count);
});

app.get('/welcome', (req, res) => {
    if(req.user && req.user.displayName) {
        res.send(`
        <h1>Hello, ${req.user.displayName}</h1> 
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

passport.serializeUser((user, done) => {
    console.log("serializeUser", user);
    done(null, user.username);                  //user의 username을 session에 저장
})

passport.deserializeUser((id, done) => {
    console.log("deserializeUser", id);
    for(var i = 0; i < users.length; i++) {
        var user = users[i];
        if(user.username === id) {
            return done(null, user);            //세션에 id와 같은 값이 저장되어 있다면!
        }
    }
    return done(null, false);
});

passport.use(new LocalStrategy(
    (username, password, done) => {
        var uname = username;
        var pwd = password;

        for(var i = 0; i < users.length; i++) {
            var user = users[i];
            if(uname === user.username) {
                return hasher({password: pwd, salt: user.salt}, (err, pass, salt, hash) => {
                    if(hash === user.password) {                //password + salt의 해시값이 생성된 값과 동일하다면
                        console.log('LocalStrategy', user);
                        done(null, user);           //false가 아니면 인증에 성공
                    } else {
                        done(null, false);
                    }
                })
            }
        }     
        done(null, false);   
    }
));

app.post('/auth/login', 
passport.authenticate(
        'local',            //위에 정의한 LocalStrategy를 이용하여 인증을 진행
        {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login',
            failureFlash: false
        }
    )
)

app.get('/auth/logout', (req, res) => {
    req.logout();
    req.session.save(() => {
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
        req.login(user, (err) => {
            req.session.save(() => {
                res.redirect('/welcome');
            })
        });
    })
});

app.listen(3000, () => {
    console.log("Connected to 3000 port");
});
