const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const port = 3000;

//var socket_ids = [];                //nickname to socket_id mapping을 위한 배열
var rooms = [];                         //rooms에는 각 방에 대한 정보가 socket_ids이름의 배열로 들어가게 된다.
var count = 0;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/:room', (req, res) => {
    console.log('room number is : ' + req.params.room);
    res.render('index', {room: req.params.room});
});

io.sockets.on('connection', (socket) => {
    socket.on('changename', (data) => {                 //이름이 변경된 경우 새롭게 등록 후 userlist로 업데이트 시킨다.
        var room = socket.room;
        var pre_nick = socket.nickname;                 //기존이름
        var nickname = data.nickname;                   //새로운 이름

        socket.emit('new', {nickname: nickname});
        console.log(room + " " + pre_nick);

        if(pre_nick != undefined) {
            delete rooms[room].socket_ids[pre_nick];
        }

        rooms[room].socket_ids[nickname] = socket.id;
        socket.nickname = nickname;

        data = {msg: pre_nick + '님이 ' + nickname + ' 으로 대화명을 변경하셨습니다.'};
        io.sockets.in(room).emit('broadcast_msg', data);
        io.sockets.in(room).emit('userlist', {users: Object.keys(rooms[room].socket_ids)});
    });

    socket.on('disconnect', (data) => {                 //사용자가 브라우저를 종료하는 경우
        var room = socket.room;
        if(room != undefined && rooms[room] != undefined) {
            var nickname = socket.nickname;                 //현재 사용자의 이름을 읽어 온뒤 리스트에서 삭제한다.
            console.log('nickname ' + nickname + ' has been disconnected');
            if(nickname != undefined) { 
                if(rooms[room].socket_ids != undefined && rooms[room].socket_ids[nickname] != undefined) {
                    delete rooms[room].socket_ids[nickname];
                }

                data = {msg: nickname + ' 님이 나가셨습니다.'};

                io.sockets.in(room).emit('broadcast_msg', data);
                io.sockets.emit('userlist', {users: Object.keys(rooms[room].socket_ids)});          //현재 종료하는 소켓을 제외한 모든 사용자 소켓에게 userlist 이벤트를 발생하여 제거된 사용자를 제외한 새로운 리스트로 업데이트 시킨다.
            }
        }
    });

    socket.on('send_msg', (data) => {                       //메세지 전송 시
        var room = socket.room;
        var nickname = socket.nickname;

        console.log('in send msg room is ' + room);
        data.msg = nickname + ' : ' + data.msg;

        if(data.to == 'ALL') io.sockets.in(room).emit('broadcast_msg', data);          //같은 room의 모든 사용자에게 전송
        else {
            //귓속말
            socket_id = rooms[room].socket_ids[data.to];
            if(socket_id != undefined) {
                data.msg = '귓속말 : ' + data.msg;
                io.sockets.connected[socket_id].emit('broadcast_msg', data);
                socket.emit('broadcast_msg', data);
            }
        }
    });

    socket.on('joinroom', (data) => {
        socket.join(data.room);                 //주어진 room번호에 입장
        
        socket.room = data.room;                //소켓에 방번호 할당
        var room = data.room;
        var nickname = 'GUEST - ' + count;
        
        socket.nickname = nickname;
        socket.emit('new', {nickname: nickname});
        socket.emit('changename', {nickname: nickname});

        if(rooms[room] == undefined) {
            console.log('room create : ' + room);
            rooms[room] = new Object();                 //새로운 room 생성
            rooms[room].socket_ids = new Object();      //그 안에 해당 room에 있는 socket의 id를 이름으로 mapping 시켜주는 새로운 배열을 생성
        }

        rooms[room].socket_ids[nickname] = socket.id;           //socket id 저장
        console.log(rooms[room].socket_ids);

        data = {msg: nickname + '님이 입장하셨습니다.'};
        io.sockets.in(room).emit('broadcast_msg', data);            //같은 방에 있는 소켓에게 메세지 전달

        //유저 정보 갱신
        io.sockets.in(room).emit('userlist', {users: Object.keys(rooms[room].socket_ids)});
        count++;
    });
});

server.listen(port, () => {
    console.log(`Connected to port ${port}`);
});