 var fs = require('fs');
function readHTML(htmlfile)
{
    let htmltext = '';
    try {
        htmltext = fs.readFileSync(htmlfile, 'utf8');
    }
  catch (err) {
    console.error(`Error reading file from disk: ${err}`);
  }
   return htmltext;
}

module.exports = readHTML;