# Webpage Specifications and tokens:
## Article catalogue pages:
* page url: http://www.creepypasta.com/page/x/ (1 <= x <= 292)
+ to make this more robust one can not hardcode the ending number and one can
rather go until a page is found that does not contain the correct information
- body class="error404" OR title (Page Not Found - Creepypasta)
* post boxes container - div class="content home-2" (maybe not home-2)
* post box - div class="block-post"
* post info: - div class="post-content"
+ post title - h3 a href="<_URL_>" title="<_TITLE_>"
+ post rating info - div class="gdrts-rating-text"
+ rating - strong
+ votes - (after strong)
* post category - span class="info-category" a

## Article:
* Article title - div class="single-title" h1
* Article category - span class="single-category" a
* Rating info - div class="single-content" div class="clearfix" div class="gdrts-rating-text"
+ Rating - strong
+ votes - (after strong)
* text - div class="single-content" div class="clearfix" p (multiple)
