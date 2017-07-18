var parallel = require('async-parallel');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('file-system');

var posts = []

var pagePrefix = "http://www.creepypasta.com/page/";
var pageNumber = 290;

var startCount = 0;
var endCount = 0;

function getPageInfo(url, pushToPosts, afterEach) {
	console.log('get page', url);
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

// function fetchPostInfo(pushToPosts) {
// 	fs.readFile(pageNumber.toString() + ".txt", "utf8", function(err, data) {
// 		if(err) throw err;
//
// 		var $ = cheerio.load(data);
// 		var $posts = $('div.post-content');
//
// 		$posts.each(function(index, element) {
// 			$post = $(this);
// 			$postTitleLink = $post.find('h3.post-title a');
// 			$postRatingInfo = $post.find('div.gdrts-rating-text');
// 			$postRating = $postRatingInfo.children('strong');
//
// 			pushToPosts({
// 				'title': $postTitleLink.attr('title'),
// 				'url': $postTitleLink.attr('href'),
// 				'rating': parseFloat($postRating.text()),
// 				'votes': parseInt($postRatingInfo.text().split(" ")[15])
// 			});
// 		});
// 	});
// }

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

for(var pageIncrement = 0; pageIncrement + pageNumber <= 292; pageIncrement++) {
	var url = pagePrefix + (pageNumber + pageIncrement).toString();
	startCount++;
	getPageInfo(url, pushToPosts, function() {
		endCount++;
	});
}

savePostsWhenDone();
