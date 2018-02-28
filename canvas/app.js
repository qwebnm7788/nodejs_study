var express = require('express');
var socketio = require('socket.io');
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');

//웹 서버 생성
var app = express();
app.use(express.static('public'));          //static 미들웨어

//웹 서버 실행
var server = http.createServer(app);
server.listen(52273, function() {
    console.log("SERVER IS RUNNING");
});

//페이지 라우트
//GET - /
app.get('/', function(request, response) {
    fs.readFile('lobby.html', function(error, data) {
        response.send(data.toString());
    })
});

//GET - /canvas:room (room 번호에 따라 설정)
app.get('/canvas/:room', function(request, response) {
    fs.readFile('canvas.html', 'utf8', function(error, data) {
        //ejs 모듈 이용 매개변수 전달
        response.send(ejs.render(data, {
            room: request.params.room
        }));
    })
});

//GET - /room JSON 파일로 제공
app.get('/room', function(request, response) {
    var rooms = Object.keys(io.sockets.adapter.rooms).filter(function(item) {
        return item.indexOf('/') < 0;
    });
    response.send(rooms);
});

//소켓 서버 생성 및 실행
var io = socketio.listen(server);
io.sockets.on('connection', function(socket) {
    var roomId = "";

    socket.on('join', function(data) {
        socket.join(data);
        roomId = data;
    });

    socket.on('draw', function(data) {
        io.sockets.in(roomId).emit('line', data);           //같은 room 사람들에게 그림을 그리는 이벤트를 준다.
    });

    socket.on('create_room', function(data) {
        io.sockets.emit('create_room', data.toString());
    })
});