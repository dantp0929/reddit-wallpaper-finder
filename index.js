
function getRandomImageFromChildren(children) {
    var index = Math.floor(Math.random() * children.length);

    return children[index].data.url;
}


fetch('https://www.reddit.com/r/animewallpaper/top.json')
  .then(function(res) {
    return res.json();   // Convert the data into JSON
  })
  .then(function(res) {
    console.log(res);   // Logs the data to the console

    var fetchedImage = getRandomImageFromChildren(res.data.children);

    var background = document.getElementById("background").style.backgroundImage = `url(\"${fetchedImage}\")`;
    
    var wallpaper = document.getElementById("wallpaper");
    var img = document.createElement("img");
    img.src = fetchedImage
    img.setAttribute("class", "wallpaper");
    wallpaper.appendChild(img);
  })
  .catch(function(err) {
    console.log(err);   // Log error if any
  });
