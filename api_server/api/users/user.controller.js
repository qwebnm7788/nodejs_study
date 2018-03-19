let users = [
    {
      id: 1,
      name: 'alice'
    },
    {
      id: 2,
      name: 'bek'
    },
    {
      id: 3,
      name: 'chris'
    }
];

exports.index = (req, res) => {
    return res.json(users);
};

exports.show = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if(!id) {           //NaN인 경우
        return res.status(400).json({error: 'Incorrect id'});
    }

    let user = users.filter(user => user.id === id)[0];
    if(!user) {         //해당 유저가 없는 경우
        return res.status(404).json({error: 'Unknown User'});
    }

    return res.json(user);
};

exports.destroy = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if(!id) {           //NaN인 경우
        return res.status(400).json({error: 'Incorrect id'});
    }

    const userIdx = users.findIndex(user => {
        return user.id === id;
    });

    if(userIdx === -1) {
        return res.status(404).json({error: 'Unknown User'});
    }

    users.splice(userIdx, 1);                   //userIdx 포함 1개 제거
    res.status(204).send();
};

exports.create = (req, res) => {
    const name = req.body.name || '';               //name 값이 없다면 빈 문자열
    if(!name.length) {
        return res.status(400).json({error: 'Incorrect name'});
    }

    const id = users.reduce((maxId, user) => {              //현재 존재하는 최대 id + 1 값을 할당
        return user.id > maxId ? user.id : maxId;
    }, 0) + 1;

    const newUser = {
        id: id,
        name: name
    };

    users.push(newUser);

    return res.status(201).json(newUser);
};