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

/**
 * Gets an image from threads in the subreddit.
 * @param {array} threads The threads in the subreddit.
 * @returns {string} Thread data of the image selected.
 */
function getRandomThread(wallpaperProperties, threads) {

  for (var i = 0; i < threads.length; ++i) {
    var thread = threads[i];
    console.log(thread);

    // Single image post
    if (thread.data.preview != undefined) {
      if (!wallpaperHistory.includes(thread.data.name)
        && thread.data.preview.images[0].source.height >= wallpaperProperties.minHeight 
        && thread.data.preview.images[0].source.width >= wallpaperProperties.minWidth
        && thread.data.ups >= wallpaperProperties.minUpvotes) {

        var landscape = thread.data.preview.images[0].source.height < thread.data.preview.images[0].source.width;
        var portrait = thread.data.preview.images[0].source.height > thread.data.preview.images[0].source.width;
    
        if (thread.data.over_18 && !wallpaperProperties.includeNSFW) { continue; }
        if (landscape && !wallpaperProperties.includeLandscape) { continue; }
        if (portrait && !wallpaperProperties.includePortrait) { continue; }

        wallpaperHistory.push(thread.data.name);
        setCookie("wallpaper-history", JSON.stringify(wallpaperHistory));
        console.log(wallpaperHistory);
        return thread.data;
      }
    }
    // Gallery post
    else if (thread.data.gallery != undefined) {

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

  var thread = getRandomThread(wallpaperProperties, threads);
  if (thread === null) {
    getNewWallpapers(setRandomWallpaper, threads[threads.length - 1].data.name);
  }
  else {
    var image = thread.url;
    var link = `https://www.reddit.com/${thread.permalink}`;

    console.log(wallpaperProperties);

    document.getElementById("background").style.backgroundImage = `url(\"${image}\")`;
    document.getElementById("wallpaper").src = image;
    document.getElementById("reddit-link").href = link;
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