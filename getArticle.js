var parallel = require('async-parallel');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('file-system');

const THRESHHOLD = 7.4;
var queue = [];

function printArticle() {
	console.log(article.join('\n'));
}

function saveArticle(name, article) {
	fs.writeFile('pastas-7-4/' + name + '.txt', article.join('\n'), function(err) {
		if(err) throw err;
	});
}

function addToQueue(name, url) {
	queue.push({
		'name': name,
		'url': url
	});
}

var fileCheckStart = 0;
var fileCheckEnd = 0;

function countFileCheckEnd() {
	fileCheckEnd++;
}

function addIfNotExist(name, url, addToQueue, countFileCheckEnd) {
	fileCheckStart++;
	fs.stat('pastas-7-4/' + name + '.txt', function(err, stat) {
		if(err === null) {
			// file exists
			// console.log(name + ' - exists');
		} else if(err.code === 'ENOENT') {
			console.log(name + ' - Does not exist');
			// file does not exist
			addToQueue(name, url);
		} else {
			console.log(err);
		}

		countFileCheckEnd();
	});
}

function fetchArticle(name, url, saveArticle) {
	request({
		method: 'GET',
		url: url,
		timeout: 10000
	}, function(error, response, body) {
		if(error) {
			if(error.code.indexOf('ENOTFOUND') > -1 ||
			error.code.indexOf('ETIMEDOUT') > -1 ||
			error.code.indexOf('ESOCKETTIMEDOUT') > -1) {
				console.log("TIMEOUT - " + name);
			} else {
				console.log(error);
			}
		} else {
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
		}
	});
}

var count = 0;
function fetchArticles() {
	if(fileCheckStart === fileCheckEnd && fileCheckStart > 0) {
		if(count === 0) {
			console.log(queue.length);
		}

		if(count < queue.length) {
			fetchArticle(queue[count]['name'], queue[count]['url'], saveArticle);
			count++;
			setTimeout(fetchArticles, 500);

			if (parseInt(100*count/queue.length) % 10 === 0) {
				console.log(parseInt(100*count/queue.length) + "%");
			}
		}
	} else {
		setTimeout(fetchArticles, 1000);
	}
}

function loadPostInfo(addToQueue, addIfNotExist, fetchArticles, countFileCheckEnd) {
	fs.readFile("postData.json", "utf8", function(err, data) {
		if(err) throw err;

		var posts = JSON.parse(data);

		for(var i in posts) {
			var url = posts[i]['url'];
			var name = url.split('/')[3];
			var rating = posts[i]['rating'];

			if(rating >= THRESHHOLD) {
				// check if file exist
				addIfNotExist(name, url, addToQueue, countFileCheckEnd);
			}
		}

		fetchArticles();
	});
}

fs.mkdir('pastas-7-4');
loadPostInfo(addToQueue, addIfNotExist, fetchArticles, countFileCheckEnd);
