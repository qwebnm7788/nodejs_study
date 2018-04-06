const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    port: 8888,
    user : 'study',
    password : 'study',
    database : 'o2'
});

connection.connect();
/*
var sql = 'SELECT * FROM topic';

connection.query(sql, (err, rows, fields) => {
    if(err) {
        console.log(err);
    }else {
        for(var i = 0; i < rows.length; i++) {
            console.log(rows[i].description);
        }
    }
});
*/

var sql = `INSERT INTO topic (title, description, author)
    VALUES(?, ?, ?)`;
var params = ['Supervisor', 'Watcher', 'graph'];

connection.query(sql, params, (err, rows, fields) => {
    if(err) {
        console.log(err);
    }else {
        console.log(rows);
    }
})
connection.end();