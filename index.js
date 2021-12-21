import { setCookie, getCookie, shuffle } from "./helpers.js";

var wallpaperProperties = {
  subreddit: "animewallpaper",
  minWidth: 0,
  minHeight: 0,
  includeNSFW: true,
  includeLandscape: true,
  includePortrait: true,
  minUpvotes: 0
}

// Cookies to prevent getting the same wallpapers in a row.
var history = getCookie("history");
if (history != "") {
  history = JSON.parse(history);
}
else {
  history = []
}

/**
 * Gets an image from threads in the subreddit.
 * @param {array} threads The threads in the subreddit.
 * @returns {string} url to an image.
 */
function getImageFromThreads(wallpaperProperties, threads) {

  for (var i = 0; i < threads.length; ++i) {
    var thread = threads[i];
    console.log(thread);

    if (thread.data.preview != undefined) {
      var landscape = thread.data.preview.images[0].source.height < thread.data.preview.images[0].source.width;
      var portrait = thread.data.preview.images[0].source.height > thread.data.preview.images[0].source.width;

      if (!history.includes(thread.data.name)
        && thread.data.preview.images[0].source.height >= wallpaperProperties.minHeight 
        && thread.data.preview.images[0].source.width >= wallpaperProperties.minWidth
        && thread.data.ups >= wallpaperProperties.minUpvotes) {
        
        if (thread.data.over_18 && !wallpaperProperties.includeNSFW) {
          continue;
        }

        if (landscape && !wallpaperProperties.includeLandscape) {
          continue;
        }

        if (portrait && !wallpaperProperties.includePortrait) {
          continue;
        }

        history.push(thread.data.name);
        setCookie("history", JSON.stringify(history));
        console.log(history);
        return thread.data.url;
      }
    }
  }
  return null;
}

/**
 * Get a new wallpaper from reddit.
 * @param {Function} callback Function that takes a json as a parameter.
 * @param {*} after Used in reddit's API to determine what threads to show.
 */
function getNewWallpapers(callback, after=null) {
  var request = "";
  if (after === null) {
    request = `https://www.reddit.com/r/${wallpaperProperties.subreddit}/hot.json`;
  }
  else {
    request = `https://www.reddit.com/r/${wallpaperProperties.subreddit}/hot.json?count=25&after=${after}`
  }

  console.log(request);

  fetch(request)
    .then(function(res) {
      return res.json();
    })
    .then(function(json) {
      callback(json);
    })
    .catch(function(err) {
      console.log(err);   // Log error if any
    });
}

/**
 * Gets a new wallpaper and displays it.
 * @param {String} subreddit The string after "r/" for reddit subreddits.
 * @param {number} minWidth The minimum width an image can be.
 * @param {number} minHeight The minimum height an image can be.
 */
function setRandomWallpaper(response) {
  console.log(response);

  var threads = response.data.children;
  shuffle(threads);

  var fetchedImage = getImageFromThreads(wallpaperProperties, threads);
  if (fetchedImage === null) {
    getNewWallpapers(setRandomWallpaper, threads[threads.length - 1].data.name);
  }
  else {
    document.getElementById("background").style.backgroundImage = `url(\"${fetchedImage}\")`;
    document.getElementById("wallpaper").src = fetchedImage;
  }
}

getNewWallpapers(setRandomWallpaper);
