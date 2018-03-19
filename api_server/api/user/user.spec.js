const should = require('should');
const request = require('supertest');
const app = require('../../app');
const syncDatabase = require('../../bin/sync-database');
const models = require('../../models');

describe('GET /users', () => {
    before('sync database', () => {
        syncDatabase().then(() => {
            done();
        });
    });

    const users = [
        {name: 'alice'},
        {name: 'ben'},
        {name: 'chris'}
    ];

    before('insert 3 users into database', (done) => {                  //users 배열의 값을 USER DB에 삽입
        models.User.bulkCreate(users).then(() => done());
    });

    after('clear up database', (done) => {
        syncDatabase().then(() => done());
    });
    
    it('should return 200 status code', (done) => {
        request(app).get('/users').expect(200).end((err, res) => {              //"/users"의 요청에 200 상태코드를 반환하는지 여부 확인
            if(err) throw err;
            done();             //it함수의 종료시점을 알려줌
        })
    });
    
    it('should return array', (done) => {
        request(app).get('/users').expect(200).end((err, res) => {
            if(err) throw err;
            res.body.should.be.an.instanceof(Array).and.have.length(3);         //body에 길이 3의 배열이 반환되는지 여부
            res.body.map(user => {                                              //map함수로 배열의 각 요소를 확인
                user.should.have.properties('id', 'name');
                user.id.should.be.a.Number();
                user.name.should.be.a.String();
            });
            done();
        });
    });
});

describe('PUT /users/:id', () => {
    it.only('should return 200 status code', (done) => {
        request(app).put('/users/1').send({
            name: 'foo'
        }).end((err, res) => {
            if(err) throw err;
            done();
        })
    });
})