(function () {

  'use strict';

  let api_root = 'https://api.github.com/';
  let req_headers = new Headers({
      'Accept': 'application/vnd.github.v3+json'
    , 'credentials': 'include'
  });
  let d = document;
  let w = window;
  let Cont = d.getElementById('emoji-set');


  // Examine the text in the response
  function status (r) {
    if (r.status >= 200 && r.status < 300) {
      return Promise.resolve(r);
    } else {
      console.warn('Looks like there was a problem. Status Code: ' + r.status);
      return Promise.reject(new Error(r.statusText));
    }
  }


  // Parse response text into javascript object
  function json (r) {
    let contentType = r.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return r.json();
    }
    throw new TypeError("Oops, we haven't got JSON!");
  }


  // Get response text
  function text (r) {
    return r.text();
  }


  // Copies a string to the clipboard.
  function copyToClipboard (text) {
    if (w.clipboardData && w.clipboardData.setData) {
      // IE specific code path to prevent textarea being shown while dialog is visible.
      console.log('Copied:', clipboardData);
      return clipboardData.setData('Text', text);

    } else if (d.queryCommandSupported && d.queryCommandSupported('copy')) {
      var ta = d.createElement('textarea');
      ta.textContent = text;
      // Prevent scrolling to bottom of page in MS Edge.
      ta.style.position = 'fixed';
      d.body.appendChild(ta);
      ta.select();
      try {
        console.log('Copied: [', text, ']');
        // Security exception may be thrown by some browsers.
        return d.execCommand('copy');
      } catch (ex) {
        console.warn('Copy to clipboard failed:', ex);
        return false;
      } finally {
        d.body.removeChild(ta);
      }
    }
  }


  let emojis_url = fetch(api_root)
    .then(status)
    .then(json)
    .then(function (lo) {
      // console.log('Request for API info succeeded with JSON response (', typeof lo, '): [', lo, ']');
      return Promise.resolve(lo.emojis_url);
    })
    .catch(function (err) {
      console.warn('Failed to fetch API information: [', err, ']');
    });


  let oEmojis = emojis_url.then(function (url) {
    return fetch(url)
      .then(status)
      .then(json)
      .then(function (lo) {
        let l = Object.keys(lo).length;
        d.getElementById('emoji-count').innerHTML = l;

        let elDiv = d.createElement('div');
        let elImg = d.createElement('img');
        elDiv.className = 'item col-xs-12 col-md-6 col-lg-4 mb-1';
        elImg.className = 'emo-ico';

        _.each(lo, (u, n) => {
          var ico_code = ':' + n + ':';
          var elText = d.createTextNode(ico_code);
          var elImage = elImg.cloneNode();
          elImage.setAttribute('src', u);
          elImage.setAttribute('alt', n);
          var el = elDiv.cloneNode(true);
          el.setAttribute('data-ico-code', ico_code);
          el.appendChild(elImage);
          el.appendChild(elText);
          Cont.appendChild(el);
        });

        return Promise.resolve(lo);
      })
      .catch(function (err) {
        console.warn('Failed to Fetch Emojis: [', err, ']');
      });

    })
    .catch(function (err) {
      console.warn('Fetch Emojis URL Failed: [', err, ']');
      return Promise.reject(err);
    });


  function tryCopyToClipboard (e) {
    e.preventDefault();
    let el = e.target;
    if (el.nodeName !== 'DIV') {
      el = el.parentNode;
    }
    let ico_code = el.getAttribute('data-ico-code');
    let r = copyToClipboard(ico_code);
    if (r) {
      el.classList.toggle('copied', true);
      setTimeout(function () {
        el.classList.toggle('copied', false);
      }, 2500);
    }
  }


  oEmojis.then(function () {
    let items = d.querySelectorAll('div.item');
    if (items.length) {
      for (let n = 0; n < items.length; n++) {
        var item = items[n];
        item.addEventListener('click', tryCopyToClipboard.bind(item), false);
      }
    }
  });


}.call(this));
