var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var AppearanceFieldQuality = require('./appearancefieldquality');

var AppearanceSchema   = new Schema({
	name: {type: String},
	address: {type:	String},
	city: {type:	String},
	state: {type: String},
	zip: {type: String},
	phone: {type: String},
	website: {type: String},
	description: {type: String},
	provider: {type: String},
	providersiteurl: {type: String},
	appearancequalitytype : {
		type : String,
		default : 'Unknown',
		enum : ['Correct', 'InCorrect', 'Missing', 'Unknown']

	},
	problemfields : [{type : AppearanceFieldQuality}],
	HoursOfOperation: {type: String},
	OpenOnHolidays : {type : Boolean},
	AppointmentsAvailable : {type : Boolean},
	Emergency24HoursService : {type : Boolean},
	InBusinessSince : {type : String},
	Categories : [{type : String}],
	Services : {type : String},

	//Contact Info Fields
	ContactFirstName : {type : String},
	ContactLastName : {type : String},
	ContactEmailAddress : {type : String}

});

module.exports = mongoose.model('Appearance', AppearanceSchema);