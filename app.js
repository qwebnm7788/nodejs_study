var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var express = require('express');
var socketio = require('socket.io');

//생성자 함수 생성
var counter = 0;
function Product(name, image, price, count) {
    this.index = counter++;             //번호
    this.name = name;
    this.image = image;
    this.price = price;
    this.count = count;                 //남은 갯수
}

var products = [
    new Product('Javascript', 'firefox.png', 28000, 30),
    new Product('jQuery', 'firefox.png', 28000, 30),
    new Product('Node.js', 'firefox.png', 32000, 30),
    new Product('Socket.io', 'firefox.png', 17000, 30),
    new Product('Connect', 'firefox.png', 18000, 30),
    new Product('Express', 'firefox.png', 31000, 30),
    new Product('EJS', 'firefox.png', 12000, 30)
];

//웹 서버 생성
var app = express();
var server = http.createServer(app);

//웹 서버 설정 (static 미들웨어 사용)
app.use(express.static(__dirname + '/public'));

//라우트 설정
app.get('/', function(request, response) {
    var htmlPage = fs.readFileSync('index.html', 'utf8');           //파일 읽기
    
    //응답 (ejs 모듈 이용 html에 매개변수 전달)
    response.send(ejs.render(htmlPage, {
        products: products
    }));
});

//웹 서버 실행
server.listen(52273, function() {
    console.log("SERVER IS RUNNING");
});

//소켓 서버 생성 및 실행
var io = socketio.listen(server);
io.sockets.on('connection', function(socket) {
    //함수 내에 함수를 정의하고 그 함수에서 이곳에서 선언된 변수(cart)를 사용함으로써
    //클로저의 효과를 내고 이로인해 모든 클라이언트는 각자의 상태를 유지학게 된다.

    var cart = {};              //delete 시 용이하기 위해 배열이 아닌 객체로 선언함

    function onReturn(index) {
        products[index].count++;            //해당 물건의 갯수 증가

        //해당 물건을 카트에서 삭제 및 타이머 제거
        clearTimeout(cart[index].timerID);
        delete cart[index];

        //count 이벤트 발생
        io.sockets.emit('count', {
            index: index,
            count: products[index].count
        });
    };

    //cart 이벤트 (cart에 index번 물품을 넣는 행위)
    socket.on('cart', function(index) {
        products[index].count--;            //갯수 감소

        //cart에 해당 물건 삽입 및 타이머(10분 후 실행) 시작
        cart[index] = {};           //cart에 index번 속성 추가
        cart[index].index = index;
        cart[index].timerID = setTimeout(() => {
            onReturn(index);
        }, 10 * 60 * 1000);

        //count 이벤트 발생
        io.sockets.emit('count', {
            index: index,
            count: products[index].count
        });
    });

    socket.on('buy', function(index) {
        clearTimeout(cart[index].timerID);
        delete cart[index];

        io.sockets.emit('count', {
            index: index,
            count: products[index].count
        });
    });

    socket.on('return', function(index) {
        onReturn(index);
    });
});
