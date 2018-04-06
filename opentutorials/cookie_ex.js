const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());

var products = {
    1: {title: 'The history of web'},
    2: {title: 'The next web'}
};

app.get('/products', (req, res) => {
    var output = '';
    for(var name in products) {
        output += `
        <li>
            <a href="/cart/${name}">${products[name].title}</a>
        </li>`
    }
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
});

app.get('/count', (req, res) => {
    if(req.cookies.count) {
        var count = parseInt(req.cookies.count);
    } else {
        var count = 0;
    }
    count = count + 1;
    res.cookie('count', count);
    res.send('count : ' + count);
});

app.listen(3000, () => {
    console.log('Connected 3000 port');
});

