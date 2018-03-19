const models = require('../../models');

exports.index = (req, res) => {
    models.User.findAll().then(users => res.json(users));
};

exports.show = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if(!id) {           //NaN인 경우
        return res.status(400).json({error: 'Incorrect id'});
    }

    models.User.findOne({
        where: {
            id: id
        }
    }).then(user => {
        if(!user) {
            res.status(404).json({error: 'No User'});
        }
        return res.json(user);
    })
};

exports.destroy = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if(!id) {           //NaN인 경우
        return res.status(400).json({error: 'Incorrect id'});
    }

    models.User.destroy({
        where: {
            id: id
        }
    }).then(() => res.status(204).send());
};

exports.create = (req, res) => {
    const name = req.body.name || '';               //name 값이 없다면 빈 문자열
    if(!name.length) {
        return res.status(400).json({error: 'Incorrect name'});
    }

    models.User.create({
        name: name
    }).then((user) => res.status(201).json(user));
};

exports.update = (req, res) => {
    res.send();
}