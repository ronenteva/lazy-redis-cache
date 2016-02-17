var redis = require('redis').createClient();

var wrapCacheContent = function (content) {
    return {content: content, createdAt: parseInt(Date.now() / 1000)};
};
var functionToCache = function (req, res) {
    req(function (err, returnedValue) {
        if (err)
            return res(err, null);
        if (!returnedValue)
            return res(null, null);
        return res(null, wrapCacheContent(returnedValue));
    })
};

module.exports = {
    wrap: function (req, res) {
        if (!req.key || !req.value)
            return res('called cache.wrap with no values', null);

        var ttl;
        if (typeof req.ttl == 'number')
            ttl = parseInt(req.ttl);

        redis.get(req.key, function (err, cached) {
            if (err)
                return res(err, null);

            if (cached) {
                cached = JSON.parse(cached);
                var cachedContent;
                if (cached.content)
                    cachedContent = cached.content;
                else
                    cachedContent = cached;
                res(null, cachedContent);
                if (typeof req.ttl == 'function') {
                    ttl = req.ttl(cachedContent);
                }

                if (req.lazy && ((cached.createdAt + ttl) < (Date.now() / 1000))) {
                    functionToCache(req.value, function (err, toCache) {
                        if (!err && toCache) {
                            redis.set(req.key, JSON.stringify(toCache));
                        }
                    });
                }
            }
            if (err || !cached) {
                functionToCache(req.value, function (err, toCache) {
                    if (err)
                        return res(err, null);
                    if (!toCache)
                        return res(null, null);
                    res(null, toCache.content);
                    if (ttl && !req.lazy)
                        redis.setex(req.key, ttl, JSON.stringify(toCache));
                    else {
                        redis.set(req.key, JSON.stringify(toCache));
                    }
                });
            }
        })
    }
};
