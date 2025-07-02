module.exports = (req, res) => {
    res.status(200).json({
        message: 'Hello World! Express Server กำลังทำงาน',
        status: 'success'
    });
};