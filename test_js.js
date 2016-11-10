app.get('/api', function(req, res) {
    var RSS_URL = 'https://simplecast.com/podcasts/271/rss.xml';

    res.writeHead(200, {
        "Content-Type": "application/rss+xml"
    });

    str = '';
    var req = https.request(RSS_URL);
    req.on('response', function(res) {
        var stream = this;
        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
        console.log(stream);
    });
    xml = str;

    var json = parser.toJson(xml);
    res.end(json);
});
