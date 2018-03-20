var socket = io.connect('http://localhost:3000');

$("#changename").click(() => {
    socket.emit('changename', {nickname: $("#nickname").val()});
});

$("#msgbox").keyup((event) => {                 //키보드를 뗄때 이벤트 발생
    if(event.which === 13) {                    //엔터 키일 때 지금까지의 값을 전송
        socket.emit('fromclient', {msg: $("#msgbox").val()});
        $("#msgbox").val('');
    }
});

socket.on('new', (data) => {
    console.log(data.nickname);
    $('#nickname').val(data.nickname);
});

socket.on('userlist', (data) => {
    var users = data.users;
    console.log(users);
    console.log(data.users.length);
    $('#to').empty().append('<option value="ALL">ALL</option>');
    for(let i = 0; i < data.users.length; i++) {
        $('#to').append('<option value="' + users[i] + '">' + users[i] + "</option>");
    }
});

socket.on('broadcast_msg', (data) => {
    console.log(data.msg);
    $("#msgs").append(data.msg + '<br>');
});

socket.on('toclient', (data) => {               //toclient 이벤트 발생시 화면에 출력
    console.log(data.msg);
    $("#msgs").append(data.msg + '<br>');
});