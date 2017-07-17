var parallel = require('async-parallel');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('file-system');

var pagePrefix = "http://www.creepypasta.com/page/";
var pageNumber = 1;

var url = pagePrefix + pageNumber.toString();
request(url, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }

   if(response.statusCode === 200) {
     // Parse the document body
     var $ = cheerio.load(body);
     console.log("Page title:  " + $('title').text());
	 fs.writeFile(pageNumber.toString() + ".txt", body, function(err) {
		 if(err) {
			 console.log(err);
		 }
	 });
   }
});
