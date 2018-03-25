var OrientDB = require('orientjs');

var server = OrientDB({
    host: 'localhost',
    port: 2424,
    username: 'root',
    password: 'jaewon'
});

var db = server.use('o2');

db.record.get('#18:0').then((record) => {
    console.log(record);
});