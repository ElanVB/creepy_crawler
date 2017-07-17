var parallel = require('async-parallel');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('file-system');

var posts = []

var pagePrefix = "http://www.creepypasta.com/page/";
var pageNumber = 1;

var url = pagePrefix + pageNumber.toString();

function getPageInfo(url, pushToPosts, done) {
	request(url, function(error, response, body) {
		if(error) {
			console.log("Error: " + error);
		}

		if(response.statusCode === 200) {
			var $ = cheerio.load(body);
			var pageTitle = $('title').text();

			if(pageTitle.toLowerCase() !== "page not found") {

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

				done();
			}
		} else {
			console.log("Status Code: ", response.statusCode);
		}
	});
}

// fs.writeFile(pageNumber.toString() + ".txt", body, function(err) {
// 	if(err) throw err;
// });

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

getPageInfo(url, pushToPosts, function() {
	console.log(posts);
});
