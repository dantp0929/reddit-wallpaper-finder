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

  export { setCookie, getCookie, shuffle };