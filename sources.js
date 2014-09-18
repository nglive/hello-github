var request    = require("request");
var redis      = require("redis");
var config     = require('./config');
var Q          = require('q');

//set the client to the server
client  = redis.createClient(config.redis_port, config.redis_host, {max_attempts : 5});

//redis.debug_mode = true;

client.on('error', function(er){
	console.trace('Where breaking?');
	console.error(er.stack);
});

var setkey = function(body,type){
	
	for(i = 0, totLength = body.sources.length; i < totLength; i++)
	{
		if(type === 'sourcename')
		{
			//console.log(body.sources[i].name + ' ' + body.sources[i].alt_txt);
			client.HSET('MDM:SourceNames',body.sources[i].name,body.sources[i].alt_txt);
			client.expire('MDM:SourceNames', 30);
		}
		else
		{
			
			client.HSET('MDM:LogoURL',body.sources[i].name,body.sources[i].logo_url)
		}
		
	}

	
								
};

var createSourcesObject =function(){
	var sources = {};
	client.HGETALL(['MDM:AllSources'], function(err,obj){
		
		for(i in obj)
		{
			console.log(JSON.parse(obj[i]));
			sources[JSON.parse(obj[i])] = client.HGET('MDM:AllSources', JSON.parse(obj[i]));
		}
	});

	return sources;
};

var createSourcesObject2 =function(){
	var sources = {};
	client.HGETALL(['MDM:AllSources'], function(err,obj){
		
		for(i in obj)
		{
			console.log(JSON.parse(obj[i]));
			sources[JSON.parse(obj[i])] = client.HGET('MDM:AllSources', JSON.parse(obj[i]));
		}
	});

	return sources;
};

var createSourcesObject3 =function(){
	var sources = {};
	client.HGETALL(['MDM:AllSources'], function(err,obj){
		
		for(i in obj)
		{
			console.log(JSON.parse(obj[i]));
			sources[JSON.parse(obj[i])] = client.HGET('MDM:AllSources', JSON.parse(obj[i]));
		}
	});

	return sources;
};

var allSources = function(){
	var deferred = Q.defer();
	client.exists('MDM:AllSources', function(err, data){
		if(err){
			deferred.reject(err);
		} else {
			if(data == 1){
				console.log('found key');
				
				
			}
			else
			{
				console.log('not found key');
				request({url : config.SourcesSummaryAPI, json : true},
			    function(error,response,body){
				if(error){
					var err = new Error('Error getting the sources data');
					err.innerError = error;
					deferred.reject(err);
				}
				else{
					client.set('MDM:AllSources',body);
					deferred.resolve(body);
					
				}

				});

			}

			}
});

};


var sourcenames = function(sourcename){

	var deferred = Q.defer();
	client.exists('MDM:SourceNames',function(err,data){
		if(err) {
			throw err;
		} else {
			if(data == 1){
				//console.log(client.HGET('MDM:SourceNames', sourcename));
				//return Q.ninvoke(client)
				//console.log('Data '+ data);
				client.HGET('MDM:SourceNames', sourcename, function(err, data){
					if(err){
						deferred.reject(err);
					} else {
						//console.log('Return from redis '+ data );
						deferred.resolve(data);
					}
				});
			}
			else
			{
				console.log('false');
				request({url : config.SourcesSummaryAPI, json : true},
			    function(error,response,body){
				if(error){
					var err = new Error('Error getting the sources data');
					err.innerError = error;
					deferred.reject(err);
				}
				else
				{
					setkey(body,'sourcename');
				client.HGET('MDM:SourceNames', sourcename, function(err, data){
					if(err){
						deferred.reject(err);
					} else {
						//console.log('Return from redis '+ data );
						deferred.resolve(data);
					}
					});
				}
				

				}
			);

			}

		}
			
		

				
	});

	return deferred.promise;
	
};


var logonames = function(sourcename){
	
	request({url : config.SourcesSummaryAPI, json : true},
			function(error,response,body){
				if(error){
					var err = new Error('Error getting the sources data');
					err.innerError = error;
					throw err;
				}
				//var listingdata = JSON.parse(body);
				console.log(body);
				client.HMSET('MDM:LogoURL', function(){
					var logokeys = {};
					for(i = 0, totLength = body.sources.Length; i < totLength; i++)
					{
						sourcekeys[name] = logo_url;
					}
					return logokeys;
				});

				client.Expire('MDM:LogoURL', 10800);

				

			});

	return client.HMGET('MDM:LogoURL', sourcename);
};


var GetSourceName = function(sourcename){
	//var d = Q.defer();	
	//console.log('GEt Data   '  + client);
	//console.log(client.HGETALL('MDM:SourceNames'));
	var d = Q.defer();
	var response = null;

	console.log('Is it a promise '+ Q.isPromise(sourcenames(sourcename)));
	
	sourcenames(sourcename).then(function(data){
		console.log(data);
		d.resolve(data);
	})
	.fail(function(error){
		console.log('Promise failed from getting sourcename ' + error);
	});
	console.log('Outside Chained promise ' + response);
	
	return d.promise;

	return Q.ninvoke(sourcenames, sourcename, function(val){
		return val;
	});
	
};



var GetLogoUrl = function(sourcename){
	return client.HMGET('MDM:LogoURL', sourcename) === undefined ? logonames(sourcename) : 
	client.HMGET('MDM:LogoURL', sourcename);
};


module.exports.SourceName = sourcenames;
module.exports.LogoUrl = GetLogoUrl;
module.exports.allSources = allSources;

