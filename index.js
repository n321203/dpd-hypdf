var Resource = require('deployd/lib/resource');
var util = require('util');
var internalClient = require('deployd/lib/internal-client');
var spawn = require('child_process').spawn;
var HyPDF = require('hypdf');

function dpdHyPDF(name, options) {
    Resource.apply(this, arguments);
}

util.inherits(dpdHyPDF, Resource);
module.exports = dpdHyPDF;

dpdHyPDF.prototype.clientGeneration = true;
dpdHyPDF.prototype.handle = function(ctx, next){

	var dpd = internalClient.build(process.server);

	// Only allow POST
	// if(ctx.req && ctx.req.method !== 'POST') 
	// 	return next();

	// Validate
	// var body = ctx.req.body || {}
	// if (!body || !body.k || body.k != DPD_HyPDF_KEY) {
	//     return next();
	// }

	var hypdf = new HyPDF(process.env.HYPDF_USER, process.env.HYPDF_PASSWORD, {

	    // default options to use - these can be changed for each individual API request 
	    bucket: "bolanegruppenpdf",
	    public: true, // all S3 uploads will be public by default 
	    test: true // we are in test mode - these requests won't count against our HyPDF quota 
	});

	hypdf.htmltopdf("<html><body><h1>Title</h1></body></html>", {
	        orientation: 'Landscape'
	        // ... other options ... 
	    },
	    function(err, response) {
	        if (err) throw err;
	        console.log(response.pdf);
	        ctx.done(null, JSON.stringify(response));
	    }
	);
}