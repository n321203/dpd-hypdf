var Resource = require('deployd/lib/resource');
var util = require('util');
var internalClient = require('deployd/lib/internal-client');
var spawn = require('child_process').spawn;
var HypdfLib = require('hypdf');
var crypto = require("crypto");

function HyPDF(name, options) {
    Resource.apply(this, arguments);
}

util.inherits(HyPDF, Resource);
module.exports = HyPDF;

HyPDF.prototype.clientGeneration = true;
HyPDF.prototype.handle = function(ctx, next){

	var dpd = internalClient.build(process.server);

	// Only allow POST
	if(ctx.req && ctx.req.method !== 'POST') 
		return next();

	// Validate
	var body = ctx.req.body || {}
	if (!body || !body.html){
		return next();
	}

	var current_date = (new Date()).valueOf().toString();
	var random = Math.random().toString();
	var randomfilename = crypto.createHash('sha1').update(current_date + random).digest('hex');

	var user = body.user || process.env.HYPDF_USER;
	var pass = body.pass || process.env.HYPDF_PASSWORD;

	var hypdf = new HypdfLib(user, pass, {
	    // default options to use - these can be changed for each individual API request 
	    bucket: "bolanegruppenpdf",
	    public: true, // all S3 uploads will be public by default 
	    test: true // we are in test mode - these requests won't count against our HyPDF quota
	});

	hypdf.htmltopdf(body.html, {

			page_size: 	"A4",
	        orientation:"Portrait",

	        key: randomfilename + ".pdf", 	// Filename
	        encoding: "UTF-8"			
	    },
	    function(err, response) {
	        if (err) throw err;
	        ctx.done(null, response);
	    }
	);
}