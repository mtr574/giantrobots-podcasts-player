var
    express = require('express'),
    https = require('https'),
    sassMiddleware = require('node-sass-middleware'),
    app = express();

const NodeCache = require("node-cache"),
    cache = new NodeCache(),
    CACHE_KEY = "gpd_c";

var
    NoCache = true;

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

    var
        request = require('request'),
        FeedParser = require('feedparser'),
        RSS_URL = 'https://simplecast.com/podcasts/271/rss.xml',
        req = request(RSS_URL),
        feedparser = new FeedParser(),
        data = [],
        index = 0;

    if (NoCache || cacheGet() == -1) {
        // fetch new data
        console.log("fetching new");
        // cacheClear();
        fetchData();
    } else {
        // get data from cache
        console.log("from cache");
        data = cacheGet();
        done();
    }

    // fetching function
    function fetchData() {
        // request error handler
        req.on('error', done);

        // request response handler
        req.on('response', function(res) {
            var stream = this;
            if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
            stream.pipe(feedparser);
        });
    }

    // cache functions
    function cacheSet(object) {
      debugger;
        key = CACHE_KEY;
        return cache.set(key, object, 604800);
    }

    function cacheGet() {
      debugger;
        cache = cache.get(CACHE_KEY);
        if (cache != undefined) {
            return cache;
        } else {
            return -1;
        }
    }

    function cacheClear(key) {
        return isCacheCleared = cache.del(key);
    }
    // end cache functions

    // end, error handlers
    feedparser.on('error', done);
    feedparser.on('end', done);

    // parsing feed data
    feedparser.on('readable', function() {
        var post, obj = {};
        while (post = this.read()) {
            if (index == 18) break;
            obj.title = post.title;
            obj.link = post.link;
            obj.url = post.enclosures["0"].url
            data.push(obj);
            index++;
            // cache data
            cacheSet(obj);
        }
    });

    function done(err) {
        if (err) {
            throw new Error(err);
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
