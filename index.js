const historySize = 50;

// User properties.
var wallpaperProperties = {
  subreddit: "wallpapers",
  minWidth: 0,
  minHeight: 0,
  includeNSFW: false,
  includeLandscape: true,
  includePortrait: true,
  minUpvotes: 0,
  timer: -1
}

// Contains meta data of the current thread being considered.
var redditThreadMetaData = {
  imageURL: "",
  threadURL: "",
  id: null,
  height: null,
  width: null,
  upvotes: null,
  landscape: null,
  portrait: null,
  nsfw: null,
}

/*
  User properties set in wallpaper engine.
*/
window.wallpaperPropertyListener = {
  applyUserProperties: function(properties) {
    if (properties.subreddit) {
      wallpaperProperties.subreddit = properties.subreddit.value;
    }
    if (properties.minheight) {
      wallpaperProperties.minHeight = properties.minheight.value;
    }
    if (properties.minwidth) {
      wallpaperProperties.minWidth = properties.minwidth.value;
    }
    if (properties.includensfw) {
      wallpaperProperties.includeNSFW = properties.includensfw.value;
    }
    if (properties.includelandscape) {
      wallpaperProperties.includeLandscape = properties.includelandscape.value;
    }
    if (properties.includeportrait) {
      wallpaperProperties.includePortrait = properties.includeportrait.value;
    }
    if (properties.minupvotes) {
      wallpaperProperties.minUpvotes = properties.minupvotes.value;
    }
    if (properties.timer) {
      wallpaperProperties.timer = properties.timer.value;
      clearInterval(timer);

      if (wallpaperProperties.timer != -1) {
        timer = window.setInterval(function() { getNewWallpapers(setRandomWallpaper) }, wallpaperProperties.timer * 60 * 1000);
      }
    }
  }
}

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
    //document.getElementById("reddit-link").href = redditThreadMetaData.threadURL;
    document.getElementById("reddit-link").title = redditThreadMetaData.threadURL;
    document.getElementById("reddit-link").onclick = function() {
      copyToClipboard(redditThreadMetaData.threadURL);
    }
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
getNewWallpapers(setRandomWallpaper)

// Subsequent calls by a timer.
var timer = null;
if (wallpaperProperties.timer != -1) {
  timer = window.setInterval(function() { getNewWallpapers(setRandomWallpaper) }, wallpaperProperties.timer * 60 * 1000);
}