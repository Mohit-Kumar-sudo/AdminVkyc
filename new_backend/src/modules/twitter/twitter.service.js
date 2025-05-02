import to from '../../utilities/to';
var Twitter = require('twitter');

async function getTwitterSearch(req, res, text) {
    let resData = {};
    try {
        var twitter = new Twitter({
            consumer_key: 'QsUcfKPAED7bXugq68ogD9a0R',
            consumer_secret: 'LigLnXo1rMQq3y4ayc9KglZJc3F52WOcCyh8W5fennJBYh2N2J',
            access_token_key: '1213039114070585346-oMBqBMR2akTlVaIIXetwHw3q7hq0uH',
            access_token_secret: '56SrMLq33bJ0MMA56U98z7LGDtnUAXWPNRRC2dpDuAmdZ'
        });
        twitter.get('search/tweets', { q: text }, function (error, tweets, response) {
            res.json(tweets)
        });
    } catch (er) {
        console.error(`Exception in  adding or updating data in marquee stocks. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

module.exports = {
    getTwitterSearch,
}