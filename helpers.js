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

/**
 * Copy text to clipboard
 * @param {String} text 
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    //.then(() => { alert(`Copied!`) })
    .catch((error) => { alert(`Copy failed! ${error}`) })
}
