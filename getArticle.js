var parallel = require('async-parallel');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('file-system');

const THRESHHOLD = 9.0;
var queue = [];

function printArticle() {
	console.log(article.join('\n'));
}

function saveArticle(name, article) {
	fs.writeFile('pastas/' + name + '.txt', article.join('\n'), function(err) {
		if(err) throw err;
	});
}

function addToQueue(name, url) {
	queue.push({
		'name': name,
		'url': url
	});
}

function fetchArticle(name, url, saveArticle) {
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
			var article = [];
			
			$paragraphs.each(function(index, element) {
				$paragraph = $(this);
				article.push($paragraph.text());
			});

			saveArticle(name, article);
		} else {
			console.log("Status Code: ", response.statusCode);
		}
	});
}

var count = 0;
function fetchArticles() {
	if(count < queue.length) {
		fetchArticle(queue[count]['name'], queue[count]['url'], saveArticle);
		count++;
		setTimeout(fetchArticles, 500);
	}
}

function loadPostInfo(addToQueue, fetchArticles, print) {
	fs.readFile("postData.json", "utf8", function(err, data) {
		if(err) throw err;

		var posts = JSON.parse(data);

		for(var i in posts) {
			var url = posts[i]['url'];
			var name = url.split('/')[3];
			var rating = posts[i]['rating'];

			if(rating >= THRESHHOLD) {
				addToQueue(name, url);
			}
		}

		print();
		fetchArticles();
	});
}

fs.mkdir('pastas');
loadPostInfo(addToQueue, fetchArticles, function() {
	console.log(queue.length);
});
