const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const port = 3000;

var socket_ids = [];
var count = 0;

app.use(express.static(path.join(__dirname, 'public')));

io.sockets.on('connection', (socket) => {
    socket.emit('new', {nickname: 'GUEST-' + count});
    registerUser(socket, 'GUEST-' + count);
    count++;

    socket.on('changename', (data) => {
        registerUser(socket, data.nickname);
    });

    socket.on('disconnect', (data) => {
        socket.get('nickname', (err, nickname) => {
            if(nickname != undefined) {
                delete socket_ids[nickname];
                io.sockets.emit('userlist', {users: Object.keys(socket_ids)});
            }
        });
    });

    socket.on('send_msg', (data) => {
        socket.get('nickname', (err, nickname) => {
            data.msg = nickname + ' : ' + data.msg;
            if(data.to == 'ALL') socket.broadcast.emit('broadcast_msg', data);
            else {
                socket_id = socket_ids[data.to];
                if(socket_id != undefined) {
                    io.sockets.socket(socket_id).emit('broadcast_msg', data);
                }
            }
            socket.emit('broadcast_msg', data);
        })
    })
});

server.listen(port, () => {
    console.log(`Connected to port ${port}`);
});

function registerUser(socket, nickname) {
    socket.get('nickname', (err, pre_nick) => {             //현재 소켓이 가지고 있는 nick_name을 pre_nick으로 받아옴
        if(pre_nick != undefined) delete socket_ids[pre_nick];          //기존의 값 삭제
        socket_ids[nickname] = socket.id;
        socket.set('nickname', nickname, () => {
            io.sockets.emit('userlist', {users: Object.keys(socket_ids)});
        });
    });
}