const historySize = 50;

// Cookies to prevent getting the same wallpapers in a row.
var wallpaperHistory = getCookie("wallpaper-history");
if (wallpaperHistory != "") {
  wallpaperHistory = JSON.parse(wallpaperHistory);
}
else {
  wallpaperHistory = []
}

function addToHistory(threadID) {
  wallpaperHistory.push(threadID);

  // Make room in history if it is bigger than historySize
  if (wallpaperHistory.length > historySize) {
    wallpaperHistory.shift();
  }

  setCookie("wallpaper-history", JSON.stringify(wallpaperHistory));
  console.log(wallpaperHistory);
}

/**
 * Gets an image from threads in the subreddit.
 * @param {Array} threads The threads in the subreddit.
 * @returns {String} Unique thread data. null if there are no unique threads on the current page.
 */
function getRandomThread(wallpaperProperties, threads) {

  for (var i = 0; i < threads.length; ++i) {
    var thread = threads[i];
    console.log(thread);

    // Not supporting videos
    if (thread.data.is_video) { continue; }

    // Single image post
    if (thread.data.preview != undefined) {
      redditThreadMetaData.id = thread.data.name;
      redditThreadMetaData.height = thread.data.preview.images[0].source.height;
      redditThreadMetaData.width = thread.data.preview.images[0].source.width;
      redditThreadMetaData.upvotes = thread.data.ups;
      redditThreadMetaData.landscape = thread.data.preview.images[0].source.height <= thread.data.preview.images[0].source.width
      redditThreadMetaData.portrait = thread.data.preview.images[0].source.height >= thread.data.preview.images[0].source.width
      redditThreadMetaData.nsfw = thread.data.over_18;
          
      redditThreadMetaData.imageURL = thread.data.url;
      redditThreadMetaData.threadURL = `https://www.reddit.com/${thread.data.permalink}`;

      redditThreadMetaData.poster = thread.data.author;
      redditThreadMetaData.title = thread.data.title;
      redditThreadMetaData.subreddit = thread.data.subreddit_name_prefixed;
    }

    // Gallery post, get a random gallery picture
    else if (thread.data.gallery_data != undefined) {
      var mediaData = Object.entries(thread.data.media_metadata);
      mediaData = mediaData[Math.floor(Math.random() * mediaData.length)][1];
      console.log(mediaData);

      redditThreadMetaData.id = mediaData.id;
      redditThreadMetaData.height = mediaData.s.y;
      redditThreadMetaData.width = mediaData.s.x;
      redditThreadMetaData.upvotes = thread.data.ups
      redditThreadMetaData.landscape = mediaData.s.y <= mediaData.s.x
      redditThreadMetaData.portrait = mediaData.s.y >= mediaData.s.x
      redditThreadMetaData.nsfw = thread.data.over_18;

      redditThreadMetaData.imageURL = mediaData.s.u;
      redditThreadMetaData.threadURL = `https://www.reddit.com/comments/${thread.data.id}`;
      
      redditThreadMetaData.poster = thread.data.author;
      redditThreadMetaData.title = thread.data.title;
      redditThreadMetaData.subreddit = thread.data.subreddit_name_prefixed;
    }

    // Checking if it matches user's criterias.
    if (!wallpaperHistory.includes(redditThreadMetaData.id)
      && redditThreadMetaData.height >= wallpaperProperties.minHeight 
      && redditThreadMetaData.width >= wallpaperProperties.minWidth
      && redditThreadMetaData.upvotes >= wallpaperProperties.minUpvotes) {
  
        if (redditThreadMetaData.nsfw && !wallpaperProperties.includeNSFW) { continue; }
        if (redditThreadMetaData.landscape && !wallpaperProperties.includeLandscape) { continue; }
        if (redditThreadMetaData.portrait && !wallpaperProperties.includePortrait) { continue; }

        addToHistory(redditThreadMetaData.id);

        return redditThreadMetaData;
    }
  }
  return null;
}

/**
 * Get a new wallpaper from reddit.
 * @param {Function} callback Function that takes a json as a parameter.
 * @param {threadID} after Used in reddit's API to determine what threads to show.
 */
function getNewWallpapers(callback, after=null) {
  var request = "";
  if (after === null) {
    request = `https://www.reddit.com/r/${wallpaperProperties.subreddit}/hot.json?raw_json=1`;
  }
  else {
    request = `https://www.reddit.com/r/${wallpaperProperties.subreddit}/hot.json?count=25&after=${after}&raw_json=1`
  }

  console.log(request);

  fetch(request)
    .then(function(res) {
      return res.json();
    })
    .then(function(json) {
      //console.log(json);
      callback(json);
    })
    .catch(function(err) {
      console.log(err);   // Log error if any
    });
}

/**
 * Set a random wallpaper from a response.
 * @param {String} response json response.
 */
function setRandomWallpaper(response) {
  console.log(response);

  var threads = response.data.children;
  shuffle(threads);

  var thread = getRandomThread(wallpaperProperties, threads);
  if (thread === null) {
    getNewWallpapers(setRandomWallpaper, threads[threads.length - 1].data.name);
  }
  else {
    console.log(wallpaperProperties);

    document.getElementById("background").style.backgroundImage = `url(\"${redditThreadMetaData.imageURL}\")`;
    document.getElementById("wallpaper").src = redditThreadMetaData.imageURL;
    document.getElementById("reddit-link").title = redditThreadMetaData.threadURL;
    document.getElementById("popup").innerHTML = redditThreadMetaData.subreddit + "<br />" + 
      redditThreadMetaData.poster + "<br />" + redditThreadMetaData.title + "<br />" + 
      redditThreadMetaData.threadURL;
    document.getElementById("new-wallpaper").onclick = function() {
      if (wallpaperProperties.timer != -1) {
        clearInterval(timer);
        timer = window.setInterval(function() { getNewWallpapers(setRandomWallpaper) }, wallpaperProperties.timer * 60 * 1000);
      }
      getNewWallpapers(setRandomWallpaper);
    };
  }
}

// First call. setRandomWallpaper is a callback function


function startup() {
  if (loaded === false) {
    console.log("Not loaded");
    window.setTimeout(startup, 1000);
  }
  else {
    getNewWallpapers(setRandomWallpaper)
  }
}

startup();

// Subsequent calls by a timer.
var timer = null;
if (wallpaperProperties.timer != -1) {
  timer = window.setInterval(function() { getNewWallpapers(setRandomWallpaper) }, wallpaperProperties.timer * 60 * 1000);
}
