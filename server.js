// server.js

// BASE SETUP
// =============================================================================

// packages Setup
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var request    = require('request');
var config     = require('./config');
var sources    = require('./sources');
var Appearance = require('./models/appearance');
var http       = require('http');
var Q          = require('q');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR THE API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'This is the presence API' });	
});


var getAppearanceData = function(ypid) {
		var d = Q.defer();
		request({url : config.MdmPresenceAPI +ypid + '?' + config.MdmAppId, json : true},
			function(error,response,body){
				if(error){
					var err = new Error('Error calling the appearance data');
					err.innerError = error;
					d.reject(err);
				}
				//var listingdata = JSON.parse(body);
				//console.log(body);
				d.resolve(body);

			});

		return d.promise;
};


var getSummaryData = function(ypid) {
		var d = Q.defer();
		request({url : config.MdmPresenceAPI +ypid + '/summary?'  + config.MdmAppId, json : true},
			function(error,response,body){
				if(error){
					var err = new Error('Error calling the summary data');
					err.innerError = error;
					d.reject(err);
				}
				
				//var summarydata = JSON.parse(body);
				//console.log(body);
				d.resolve(body);

			});

		return d.promise;
};

var getsourcesdata = function(){
	var d = Q.defer();
	request({url : config.SourcesSummaryAPI, json : true},
			    function(error,response,body){
			    	if(error){
					var err = new Error('Error calling the summary data');
					err.innerError = error;
					d.reject(err);
					}
			    

			    d.resolve(body);
			});

	return d.promise;
}




var createAppearances = function(listingdata,summaryData, sourcesdata){
	var d = Q.defer();
	//console.log(listingdata);
	//console.log(summaryData);
	var start = new Date();
	var index ;
	var appearancelist = {};
	var sourceslist = {};

	

	for(var sindex in sourcesdata.value.sources){
		var source = {sourcename: sourcesdata.value.sources[sindex].alt_txt,
			         logourl: sourcesdata.value.sources[sindex].logo_url};
		
		sourceslist[sourcesdata.value.sources[sindex].name] = source;
	}

	//console.log(sourceslist);

	

	//console.log(listingdata);
	//console.log('Array length '+listingdata.sources.length);
	//console.log(JSON.parse(listingdata.sources));
	
	//console.log(listingdata.value.sources);
	for(var index in listingdata.value.sources)
	{
		
		
		
		//console.log( 'First loop : '+index);
		

			for(var secondindex in listingdata.value.sources[index])
			
			{
				if(index !== 'MDM')
				{
					/*console.log('2nd loop index   ' + secondindex);
					console.log(listingdata.value.sources[index][secondindex].business_name);*/
					/*console.log(listingdata.value.sources[index][secondindex].source_code);
					
					console.log(listingdata.value.sources[index][secondindex].city + ' '+ listingdata.value.sources[index][secondindex].state + ' ' + 
						listingdata.value.sources[index][secondindex].zip5 + '-' + listingdata.value.sources[index][secondindex].zip4);*/
					
					var phonenumber = null;
					var originialurl = null;
					var sourceurl = null;
					var sourcename = null;
					var logourl = null;
					var problemfields = {};
					var qualitystatus = 'correct';
					listingdata.value.sources[index][secondindex].phones.forEach(function(p){
									if(p.type === 'primary'){
										phonenumber = p.phone;
									}
								});

					listingdata.value.sources[index][secondindex].urls.forEach(function(u){
									if(u.type === 'primary'){
										originialurl = u.url;
									}
								});

					listingdata.value.sources[index][secondindex].urls.forEach(function(u){
									if(u.type === 'source_site'){
										sourceurl = u.url;
									}
								});


					for(var sourceindex in sourceslist){
						if(sourceindex === index){
							
							sourcename = sourceslist[index].sourcename;
							logourl = sourceslist[index].logourl;
						}
					}


					//console.log(summaryData.value.mismatches);
					summaryData.value.mismatches.forEach(function(m){
						if((m.source_code === index)){
							for(var i in m.mismatches){
								var mismatchedfield = m.mismatches[i];
								problemfields[m.mismatches[i]] = 'bad';
								qualitystatus = 'incorrect';
							}

							}
						});
					

					

					
					summaryData.value.missing.forEach(function(m){
						if(m.source_code === index){
							for(var i in m.missing){
								var missingfield = m.missing[i];
								problemfields[m.missing[i]] = 'missing';
								qualitystatus = 'incorrect';
							}
						}
					});

					


					//console.log(qualitystatus);



					var app = {

				
								name: listingdata.value.sources[index][secondindex].business_name,
								address: listingdata.value.sources[index][secondindex].street_address,
								city: listingdata.value.sources[index][secondindex].city,
								state: listingdata.value.sources[index][secondindex].state,
								zip: listingdata.value.sources[index][secondindex].zip5 + '-' + listingdata.value.sources[index][secondindex].zip4,
								phone : phonenumber ,
								website : originialurl,
								provider: sourcename,
								problemfields: problemfields,
								qualitystatus: qualitystatus,
								advertiserwebsite : sourceurl,
								logourl: logourl,
								sourcepriority: listingdata.value.source_priority.indexOf(listingdata.value.sources[index][secondindex].source_code) + 1


							};
				
				appearancelist[sourcename] = app;

				}
				

			}	
				
					
			

			

		

		
	};

	summaryData.value.missing_sites.forEach(function(m){
		for(var sourceindex in sourceslist){
						if(sourceindex === m){
							appearancelist[sourceslist[sourceindex].sourcename] = {qualitystatus: 'missing'};
						}
					}
	});


	summaryData.value.unknown_sites.forEach(function(u){
		for(var sourceindex in sourceslist){
						if(sourceindex === u){
							appearancelist[sourceslist[sourceindex].sourcename] = {qualitystatus: 'unknown'};
						}
					}
	});
		
	//console.log(appearancelist);
	d.resolve(appearancelist);
    var elapsed = new Date() - start;
	console.log('Overhead : ' + elapsed);
    return d.promise;
};






router.route('/listings/:ypid/appearances')
	
	//Get the listings for this id and write it to the appearances object
	.get(function(req,res){

		var id = req.params.ypid;
		//console.log('Calling url ' + config.MdmPresenceAPI );
		
		//The below code calls the http request with only the native http module provided by node
		/*http.get(config.MdmPresenceAPI +req.params.ypid + '?' + config.MdmAppId, function(resp){
			console.log('STATUS: ' + resp.statusCode);
            console.log('HEADERS: ' + JSON.stringify(resp.headers));
            resp.setEncoding('utf8');
			resp.on('data', function(chunk){
				res.json(chunk);
			});
		}).on("error", function(e){
			res.send(500, { error: e.message });
			console.log('Got Error: ' + e.message);
		});*/
   /* var start = new Date();

   //The below code calls the request module 
	request(config.MdmPresenceAPI +req.params.ypid + '?' + config.MdmAppId,function(error,response,body){
		var elapsed = new Date() - start;
		console.log('Time calling api : ' + elapsed);
		var data = JSON.parse(body);
		//console.log(body);
		//console.log(body);
		console.log('Test fields :' + data.street_address );

		//console.log(Appearance);
		var appearance = {
			name: data.business_name,
			address: data.street_address

		};*/

		//An example of Q chaining
		Q.allSettled([getAppearanceData(id), getSummaryData(id), getsourcesdata()])
		.spread(createAppearances)
		.then(function(appearancelist) {
			res.json(appearancelist);})
		.fail(function(error){
			console.log('Promise failed :' + error.message );
			console.trace('error');
			res.json(500,{'error' : error.message});
		});

		
	});


router.route('/listings/:ypid/summary')

	.get(function(req,res){

		var id = req.params.ypid;
		getSummaryData(id)
		.then(function(listingdata) { var summarydata = {
			listingscore : listingdata.listing_score,
			socialscore : listingdata.social_score,
			reputationscore : listingdata.reputation_score,
			presencescore : listingdata.presence_score
		};
		res.json(summarydata);})
		.fail(function(error){
			console.log('Promise failed :' + error.message );
			console.trace('error');
			res.json(500,{'error' : error.message});
		});
	});

	//console.log(Appearance);
	

		//var data = JSON.parse(MDMResponse);
		/*console.log(MDMResponse);
		Appearance.name = MDMResponse.business_name;
		Appearance.address = MDMResponse.address;

		res.json(Appearance);*/

		/*req.pipe(MDMResponse);
		MDMResponse(res);*/






	



// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /presence/v3
app.use('/presence/v3', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
