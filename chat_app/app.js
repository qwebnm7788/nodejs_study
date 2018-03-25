const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const port = 3000;

var socket_ids = [];                //nickname to socket_id mapping을 위한 배열
var count = 0;

app.use(express.static(path.join(__dirname, 'public')));

io.sockets.on('connection', (socket) => {
    socket.emit('new', {nickname: 'GUEST-' + count});
    registerUser(socket, 'GUEST-' + count);
    count++;

    socket.on('changename', (data) => {                 //이름이 변경된 경우 새롭게 등록 후 userlist로 업데이트 시킨다.
        registerUser(socket, data.nickname);
    });

    socket.on('disconnect', (data) => {                 //사용자가 브라우저를 종료하는 경우
        var nickname = socket.nickname;                 //현재 사용자의 이름을 읽어 온뒤 리스트에서 삭제한다.
        if(nickname != undefined) {
            delete socket_ids[nickname];
            io.sockets.emit('userlist', {users: Object.keys(socket_ids)});          //현재 종료하는 소켓을 제외한 모든 사용자 소켓에게 userlist 이벤트를 발생하여 제거된 사용자를 제외한 새로운 리스트로 업데이트 시킨다.
        }
    });

    socket.on('send_msg', (data) => {                       //메세지 전송 시
        var nickname = socket.nickname;

        data.msg = nickname + ' : ' + data.msg;
        if(data.to == 'ALL') socket.broadcast.emit('broadcast_msg', data);          //전체 메세지 전송시 모든 소켓에게 이벤트를 발생시키고
        else {
            socket_id = socket_ids[data.to];                                        //그 외의 경우 귓속말 기능으로 상대방 소켓에게만 이벤트를 발생시킨다.
            if(socket_id != undefined) {
                io.to(socket_id).emit('broadcast_msg', data);
            }
        }
        socket.emit('broadcast_msg', data);
    });
});

server.listen(port, () => {
    console.log(`Connected to port ${port}`);
});

function registerUser(socket, nickname) {
    var pre_nick = socket.nickname;                                     //현재 소켓이 가지고 있는 nick_name을 pre_nick으로 받아옴
    if(pre_nick != undefined) delete socket_ids[pre_nick];              //기존의 값 삭제
    socket.nickname = nickname;                                         //현재 소켓에 nickname 속성 설정
    socket_ids[socket.nickname] = socket.id;
    io.sockets.emit('userlist', {users: Object.keys(socket_ids)});          //현재 접속된 사용자의 리스트를 전송 (내가 추가된) -> nickname을 key로 저장해두었기 떄문에 value가 아닌 key로 전달한다.(value로는 socket_id가 들어있음)
}