var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var appearancefieldqualityschema = new Schema({
	AppearanceFieldType : {
		type : String,
		enum : ['Name', 'Address', 'City', 'State', 'Zip', 'Phone',
		'Website','HoursOpen', 'Description', 'Unknown']
	},
	AppearanceFieldQualityType: {
		type : String,
		enum : ['NA','Good', 'Extra', 'MaybeBad', 'Bad', 'Missing', 'None']
	}
});

module.exports = mongoose.model('appearancefieldquality',
 appearancefieldqualityschema);