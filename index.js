
function getRandomImageFromChildren(children) {
    var index = Math.floor(Math.random() * children.length);

    return children[index].data.url;
}


fetch('https://www.reddit.com/r/animewallpaper/hot.json')
  .then(function(res) {
    return res.json();   // Convert the data into JSON
  })
  .then(function(res) {
    console.log(res.data.children);   // Logs the data to the console

    var img = document.createElement('img');
    img.src = getRandomImageFromChildren(res.data.children);
    img.style = "width: 100%";
    document.body.appendChild(img);
  })
  .catch(function(err) {
    console.log(err);   // Log error if any
  });
