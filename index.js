var
    express = require('express'),
    https = require('https'),
    sassMiddleware = require('node-sass-middleware'),
    NodeCache = require("node-cache"),
    app = express();

app.set('port', (process.env.PORT || 5000));

// Serve views (templates)
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use sass middleware
app.use(
    sassMiddleware({
        src: __dirname + '/public/stylesheets/sass',
        dest: __dirname + '/public/stylesheets/css',
        debug: false,
    })
);

// Serve static files
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {

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
        var post;
        while (post = this.read()) {
            // if (index == 5) break;
            data.push(post);
            cache(post);
            index++;
        }
    });

    // cache function
    function cache(object) {
        const myCache = new NodeCache();
        var key = "hmm";
        myCache.set(key, object);
    }

    function done(err) {
        if (err) {
            console.log(err, err.stack);
        }
        response.render('pages/index', {
            data: data
        });
    }
});

app.get('/info', function(request, response) {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    response.render('pages/info', {
        data: ip
    });
});

app.listen(app.get('port'), function() {
    console.log('[Running] port: ', app.get('port'));
});