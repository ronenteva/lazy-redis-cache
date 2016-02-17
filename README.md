# lazy-redis-cache

cache.wrap({
      key: 'test',
      value: function (cb) {
          var value = 'Hello World"
          cb(null, value);
      },
      ttl: 24 * 60 * 60, //TTL in seconds
      lazy: true
    }, function(err,cached){
    console.log(cached);
    };
    )


    cache.wrap({
          key: 'test',
          value: function (cb) {
              var movie = {
              name:'interstellar',
              year:2015
              }
              cb(null, value);
          },
          ttl: function (cached) {
            if (cached.year > 2014)
              return 24 * 60 * 60;
            else
              return 30 * 24 * 60 * 60;
          },
          lazy: true
        }, function(err,cached){
        console.log(cached);
        };
        )