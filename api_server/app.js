const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const hostname = '127.0.0.1';
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/users', require('./api/user'));

app.get('/', (req, res) => {
    res.send('Hello World\n');
});

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})

module.exports = app;