var Entities = require('html-entities').AllHtmlEntities;
var fs = require('fs');
var htmlparser = require('htmlparser');
var request = require('request');
var soup = require('soupselect');

var entities = new Entities();
var DOM = '';
var html = '';
var url = 'http://www.hearthpwn.com/members/amarriner/collection';

var hearthstoneApiCards = JSON.parse(fs.readFileSync('hearthstoneapi-cards.json', {encoding: 'utf8'}));

var handler = new htmlparser.DefaultHandler(function(error, dom) {
    if (error) {
        console.log('error parsing html');
    }
    else {
        DOM = dom;
    }
});

var parser = new htmlparser.Parser(handler);

function getCard(name) {
    var ndx = hearthstoneApiCards.map(function(e) { return e.name; }).indexOf(name);
    return (ndx >= 0 ? hearthstoneApiCards[ndx] : '');
}

function parseHtml(cb) {

    parser.parseComplete(html);

    var cards = [];
    soup.select(DOM, 'div.card-image-item').forEach(function(element) {

        var name = entities.decode(element.attribs['data-card-name']);

        cards.push({
            id: getCard(name).id,
            name: name,
            gold: (element.attribs['data-is-gold'].toUpperCase() === 'TRUE'),
            count: element.children[1].children[3].attribs['data-card-count']
        });
    });

    fs.writeFileSync('collection.json', JSON.stringify(cards, null, 3), { encoding: 'utf8' });
}

function start(cb) {
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            html = body;
            cb();
        }
    });
}

start(parseHtml);