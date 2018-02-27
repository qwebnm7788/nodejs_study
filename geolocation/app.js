var fs = require('fs');
var http = require('http');
var express = require('express');
var mysql = require('mysql');
var socketio = require('socket.io');

//DB 연결
var client = mysql.createConnection({
    user: 'study',
    password: 'study',
    port: '8888',
    database: 'location'
});

//웹 서버 생성
var app = express();
var server = http.createServer(app);

//GET /tracter
app.get('/tracker', function(request, response) {
    //tracker.html
    fs.readFile('tracker.html', function(err, data) {
        response.send(data.toString());
    });
});

//GET /observer
app.get('/observer', function(request, response) {
    //observer.html
    fs.readFile('observer.html', function(err, data) {
        response.send(data.toString());
    });
});

//GET /showdata
app.get('/showdata', function(request, response) {
    //DB의 데이터 반환 (json)
    client.query("SELECT * FROM location WHERE name=?", [request.query.name], function(err, data) {
        response.send(data);
    });
});

//웹 서버 실행
server.listen(52273, function() {
    console.log("SERVER IS RUNNING");
});

//소켓 서버 생성 및 실행
var io = socketio.listen(server);
io.sockets.on('connection', function(socket) {
    //room 접속
    socket.on('join', function(data) {
        socket.join(data);
    });

    //전송된 정보를 DB에 넣고 정상적으로 진행되었음을 receive 이벤트 발생으로 알려준다.
    socket.on('location', function(data) {
        //DB에 데이터 삽입

        client.query("INSERT INTO location(name, latitude, longitude, date) VALUES(?, ?, ?, NOW())",
                [data.name, data.latitude, data.longitude]);
                
        //data.name namespace에 있는 소켓에만 receive 이벤트 발생
        io.sockets.in(data.name).emit('receive', {
            latitude: data.latitude,
            longitude: data.longitude,
            date: Date.now()
        });
    });
});