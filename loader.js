// Initializing here!
let loaded = false;

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
  poster: "",
  title: "",
  subreddit: ""
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
    loaded = true;
  }
}
