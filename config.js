var config = {}


config.redis = {};
config.mongodb = {};

config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];
config.mongodb.user_name =  'username';
config.mongodb.password =  'password';
//config.redis.uri = process.env.DUOSTACK_DB_REDIS;
config.redis_host = '10.3.73.79';
config.redis_port = 6379;
config.MdmPresenceAPI = 'http://test-presence-api.v.int.wc1.yp.com/api/listings/';
config.SourcesSummaryAPI = 'http://test-presence-api.v.int.wc1.yp.com/api/sources/summary?app=bsc';
config.MdmAppId = 'app=bsc';

// added some more random code for github playing around

module.exports = config;