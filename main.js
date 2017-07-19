var parallel = require('async-parallel');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('file-system');

var posts = [];

var pagePrefix = "http://www.creepypasta.com/page/";
var pageNumber = 0;
var endPageNumber = 292;

var startCount = 0;
var endCount = 0;

function getStopPage(after) {
	request({
		method: 'GET',
		url: pagePrefix + "2",
		timeout: 10000
	}, function(error, response, body) {
		if(error) {
			console.log("Error: " + error);
		}

		if(response.statusCode === 200) {
			var $ = cheerio.load(body);
			endPageNumber = parseInt($('title').text().toLowerCase().split(" ")[5]);

			after();
		} else {
			console.log("Status Code: ", response.statusCode);
		}
	});
}

function getPageInfo(url, pushToPosts, afterEach) {
	request({
		method: 'GET',
		url: url,
		timeout: 10000
	}, function(error, response, body) {
		if(error) {
			afterEach();
			console.log("Error: " + error);
		}

		if(response.statusCode === 200) {
			var $ = cheerio.load(body);
			var pageTitle = $('title').text();

			if(pageTitle.toLowerCase().indexOf("page not found") === -1) {
				var $posts = $('div.post-content');

				$posts.each(function(index, element) {
					$post = $(this);
					$postTitleLink = $post.find('h3.post-title a');
					$postRatingInfo = $post.find('div.gdrts-rating-text');
					$postRating = $postRatingInfo.children('strong');

					pushToPosts({
						'title': $postTitleLink.attr('title'),
						'url': $postTitleLink.attr('href'),
						'rating': parseFloat($postRating.text()),
						'votes': parseInt($postRatingInfo.text().split(" ")[15])
					});
				});

				afterEach();
			} else {
				console.log("Page not found");
			}
		} else {
			console.log("Status Code: ", response.statusCode);
		}
	});
}

function pushToPosts(post) {
	posts.push(post);
}

function savePostsWhenDone() {
	if(startCount === endCount) {
		fs.writeFile('postData.json', JSON.stringify(posts), function(err) {
			if(err) throw err;
		});
	} else {
		setTimeout(savePostsWhenDone, 500);
	}
}

var pageIncrement = 0;
function getPages() {
	if(pageIncrement + pageNumber <= endPageNumber) {
		var url = pagePrefix + (pageNumber + pageIncrement).toString();
		startCount++;
		pageIncrement++;
		getPageInfo(url, pushToPosts, function() {
			endCount++;
		});
		setTimeout(getPages, 500);
	} else {
		savePostsWhenDone();
	}
}

getStopPage(getPages);
