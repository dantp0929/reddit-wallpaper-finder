
const maxHistorySize = 50;

// User properties.
var wallpaperProperties = {
  subreddit: "animewallpaper",
  minWidth: 0,
  minHeight: 0,
  includeNSFW: true,
  includeLandscape: true,
  includePortrait: true,
  minUpvotes: 0,
  timer: 60
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
    console.log(properties.minheight.value);
  }
}

/**
 * Set a cookie value.
 * @param {String} cname Name of cookie.
 * @param {String} cvalue Value of cookie.
 * @param {number} exdays Days until the cookie expires.
 */
 function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Get a cookie.
 * @param {String} cname Name of cookie. 
 * @returns Value of a cookie.
 */
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
 function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

  // Only the last 50 are saved.
  if (wallpaperHistory.length > 50) {
    wallpaperHistory.shift();
  }

  setCookie("wallpaper-history", JSON.stringify(wallpaperHistory));
  console.log(wallpaperHistory);
}

/**
 * Gets an image from threads in the subreddit.
 * @param {array} threads The threads in the subreddit.
 * @returns {string} Unique thread data. null if there are no unique threads on the current page.
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
 * @param {*} after Used in reddit's API to determine what threads to show.
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
 * Gets a new wallpaper and displays it.
 * @param {String} subreddit The string after "r/" for reddit subreddits.
 * @param {number} minWidth The minimum width an image can be.
 * @param {number} minHeight The minimum height an image can be.
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
    document.getElementById("reddit-link").href = redditThreadMetaData.threadURL;
    document.getElementById("new-wallpaper").onclick = function() {
      clearInterval(timer);
      timer = window.setInterval(function() { getNewWallpapers(setRandomWallpaper) }, wallpaperProperties.timer * 60 * 1000);
      getNewWallpapers(setRandomWallpaper);
    };
  }
}

// First call.
getNewWallpapers(setRandomWallpaper)

// Subsequent calls by a timer.
var timer = null;
timer = window.setInterval(function() { getNewWallpapers(setRandomWallpaper) }, wallpaperProperties.timer * 60 * 1000);