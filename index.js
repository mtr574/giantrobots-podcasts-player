var express = require('express');
var app = express();

var https = require('https');
var parser = require('xml2json');

app.set('port', (process.env.PORT || 5000));

// Serve static files
app.use(express.static(__dirname + '/public'));

// Serve views (templates)
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {

    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log('Client IP:', ip);

    response.render('pages/index', {
        data: 'this data is rendered from server'
    });
});

app.get('/feedme', function(request, response) {

    var request = require('request'),
        FeedParser = require('feedparser'),
        RSS_URL = 'https://simplecast.com/podcasts/271/rss.xml';

    var req = request(RSS_URL),
        feedparser = new FeedParser();

    // setting request headers
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
    req.setHeader('accept', 'text/html,application/xhtml+xml');

    // request error handler
    req.on('error', done);

    // request response handler
    req.on('response', function(res) {
        var stream = this;
        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
        stream.pipe(feedparser);
    });

    // end, error handlers
    feedparser.on('error', done);
    feedparser.on('end', done);

    var data = [],
        index = 0;

    // parsing feed data
    feedparser.on('readable', function() {
        // This is where the action is!
        var post;
        while (post = this.read()) {
            if (index == 1)
                break;
            data.push(JSON.stringify(post));
            index++;
        }
    });

    function done(err) {
        if (err) {
            console.log(err, err.stack);
        }
        response.render('pages/index', {
            data: data
        });
    }
});

app.get('/api', function(req, res) {
    var RSS_HOST = 'simplecast.com',
        RSS_PATH = '/podcasts/271/rss';

    res.writeHead(200, {
        "Content-Type": "application/rss+xml"
    });

    str = '';
    var req = https.request({
        host: RSS_HOST,
        post: 443,
        path: RSS_PATH,
        method: 'GET'
    }, function(res) {
        res.on('data', function(chnk) {
            str += chnk;
        });
    });
    req.end();

    // Error handler
    req.on('error', function(e) {
        console.error(e);
    });
    xml = str;

    var json = parser.toJson(xml);
    res.end(json);
});

app.listen(app.get('port'), function() {
    console.log('[Running] port: ', app.get('port'));
});