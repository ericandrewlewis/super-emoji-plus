To build JS from http://unicode.org/emoji/charts/full-emoji-list.html:

var rows = document.querySelectorAll('table tr');

var emojiData = [];
for ( i = 0; i < rows.length; i++ ) {
  if ( ! rows[i].querySelector('.code') ) {
    continue;
  }
  // Let's skip skin tones for now.
  if ( rows[i].querySelector('.code a').getAttribute('name').indexOf('_') !== -1 ) {
    continue;
  }
  emojiData.push( {
    annotations: rows[i].querySelector('td:last-child').innerHTML.replace(/(<([^>]+)>)/ig,"").replace(/,/g,""),
    codepoint: parseInt(rows[i].querySelector('.code a').getAttribute('name'), 16)
  } )
}

JSON.stringify(emojiData)
