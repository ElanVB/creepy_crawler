var parallel = require('async-parallel');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('file-system');

var article = [];

function pushToArticle(paragraph) {
	article.push(paragraph);
}

function loadPostInfo(pushToArticle) {
	fs.readFile("postData.json", "utf8", function(err, data) {
		if(err) throw err;

		var posts = JSON.parse(data);

		for(var i in posts) {
			var url = posts[i]['url'];
			var name = url.split('/')[3];

			// var $ = cheerio.load(data);
			// var $paragraphs = $('div.single-content div.clearfix p');
			//
			// $paragraphs.each(function(index, element) {
			// 	$paragraph = $(this);
			//
			// 	pushToPosts($paragraph.text());
			// });
		}	
	});
}

loadPostInfo(pushToArticle);
