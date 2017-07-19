var parallel = require('async-parallel');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('file-system');

var article = [];
const THRESHHOLD = 9.0;

function pushToArticle(paragraph) {
	article.push(paragraph);
}

function printArticle() {
	console.log(article.join('\n'));
}

function saveArticle(name) {
	fs.writeFile('pastas/' + name + '.txt', article.join('\n'), function(err) {
		if(err) throw err;
	});
}

function loadPostInfo(pushToArticle, after) {
	fs.readFile("postData.json", "utf8", function(err, data) {
		if(err) throw err;

		var posts = JSON.parse(data);

		var i = 0;
		// for(var i in posts) {
			var url = posts[i]['url'];
			var name = url.split('/')[3];
			var rating = posts[i]['rating'];

			if(rating >= THRESHHOLD) {
				request({
					method: 'GET',
					url: url,
					timeout: 10000
				}, function(error, response, body) {
					if(error) {
						console.log("Error: " + error);
					}

					if(response.statusCode === 200) {
						var $ = cheerio.load(body);
						var $paragraphs = $('div.single-content div.clearfix p');

						$paragraphs.each(function(index, element) {
							$paragraph = $(this);
							pushToArticle($paragraph.text());
						});

						after(name);
					} else {
						console.log("Status Code: ", response.statusCode);
					}
				});
			}
		// }
	});
}

fs.mkdir('pastas');
loadPostInfo(pushToArticle, saveArticle);
