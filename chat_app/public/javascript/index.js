var socket = io.connect('http://localhost:3000');

socket.emit('joinroom', {room: 1});

$("#changename").click(() => {
    socket.emit('changename', {nickname: $("#nickname").val()});                //이름이 변경된 경우 changename 이벤트 발생 (변경된 이름을 함께 전송)
});

$("#msgbox").keyup((event) => {                 //키보드를 뗄때 이벤트 발생
    if(event.which === 13) {                    //엔터 키일 때 지금까지의 값을 전송
        socket.emit('send_msg', {to: $('#to').val(), msg: $('#msgbox').val()});             //선택된 상대방에 대한 정보와 메세지 전달
        $("#msgbox").val('');                                                               //현재 값 초기화
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
    $('#to').empty().append('<option value="ALL">ALL</option>');            //지우고 새로운 option (ALL) 태그를 생성한다.
    for(let i = 0; i < data.users.length; i++) {                            //전달된 사용자 수 만큼 option 태그(각 사용자의 nickname이 들어간)를 추가한다.
        $('#to').append('<option value="' + users[i] + '">' + users[i] + "</option>");
    }
});

socket.on('broadcast_msg', (data) => {
    console.log(data.msg);
    $("#msgs").append(data.msg + '<br>');                               //전달된 메세지 추가
});

socket.on('toclient', (data) => {               //toclient 이벤트 발생시 화면에 출력
    console.log(data.msg);
    $("#msgs").append(data.msg + '<br>');
});