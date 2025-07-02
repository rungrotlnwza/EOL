const { publicKey } = require('../config/fskey');

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(publicKey);
};
