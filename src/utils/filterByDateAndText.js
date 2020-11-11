const moment = require('moment');

const filterByDate = (array) => {
    return array.sort((a, b) => {
        return moment(a.createdAt).valueOf() < moment(b.createdAt).valueOf() ? 1: -1; 
    });
}

module.exports = filterByDate;
