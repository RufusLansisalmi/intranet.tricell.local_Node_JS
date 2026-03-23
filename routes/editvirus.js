const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');
const pug = require('pug');
const {response} = require('express');
const pug_loggedinmenu = pug.compileFile('./html/loggedinmenu.html');
const pug_editvirus = pug.compileFile('./html/editvirus.html');
const {getVirusImagesHTML} = require('./virusimages.js');
const readHTML = require('../readHTML.js');

var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');
var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html');
var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html');
var loggedinMenu = readHTML('./html/loggedinmenu.html');
var htmlVirusimagesCSS = readHTML('./html/virusimages_css.html');

router.get('/:id', (req,res)=>{

const id = req.params.id;

const connection = ADODB.open(
'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb'
);

async function load(){

try {

const result = await connection.query(`SELECT * FROM ResearchObjects WHERE ID=${id}`);

let v = result[0];

res.write(htmlhead);
res.write(htmlheader);
res.write(htmlmenu);
res.write(htmlVirusimagesCSS);
res.write(htmlinfostart);

let html = `
<h2>Edit Research Object</h2>

<form method="POST">

Object Number:<br>
<input type="text" name="objectNumber" value="${v.objectNumber || ''}"><br><br>

Object Name:<br>
<input type="text" name="objectName" value="${v.objectName || ''}"><br><br>

Creator:<br>
<input type="text" name="objectCreator" value="${v.objectCreator || ''}"><br><br>

Created Date:<br>
<input type="text" name="objectCreatedDate" value="${v.objectCreatedDate || ''}"><br><br>

Status:<br>
<input type="text" name="objectStatus" value="${v.objectStatus || ''}"><br><br>

Text:<br>
<textarea name="objectText" rows="10" cols="60">${v.objectText || ''}</textarea><br><br>

Security DataSheet:<br>
<input type="text" name="pdfFile" value="${v.pdfFile || ''}"><br><br>

Presentation Video (URL):<br>
<input type="text" name="presentationVideoLink" value="${v.presentationVideoLink || ''}"><br><br>

Security Handling Video (URL):<br>
<input type="text" name="securityVideoLink" value="${v.securityVideoLink || ''}"><br><br>

<input type="submit" value="Save">

</form>
`;

res.write(html);

res.write(htmlinfostop);
htmlNewvirusCSS = readHTML('./html/newvirus_css.html');
res.write(htmlNewvirusCSS);
htmlNewvirusJS = readHTML('./html/newvirus_js.html');
res.write(htmlNewvirusJS);
res.write(htmlVIrusimagesCSS);
res.write(pug_editvirus({
    id: id,
    virusnumber: str_objectNumber,
    virusname: str_objectName,
    createdate: str_objectCreatedDate,
    creator: str_objectCreator,
    description: str_objectText,
    viruspdf: pdf,
    virusvideo: str_presentationVideoLink,
    virushanlingvideo: str_securityVideoLink,

}));
res.write(getVirusImagesHTML(id));

res.write(htmlbottom);
res.end();

} catch(err) {
    console.error('editvirus load error:', err);
    res.status(500).end('Error loading form: ' + err.message);
}

}

load();

});

router.post('/:id',(req,res)=>{

const id = req.params.id;

const connection = ADODB.open(
'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb'
);

async function update(){

try {

await connection.execute(`
UPDATE ResearchObjects SET
objectNumber='${req.body.objectNumber}',
objectName='${req.body.objectName}',
objectCreator='${req.body.objectCreator}',
objectCreatedDate='${req.body.objectCreatedDate}',
objectStatus='${req.body.objectStatus}',
objectText='${(req.body.objectText || '').replace(/'/g, "''")}',
presentationVideoLink='${req.body.presentationVideoLink || ''}',
securityVideoLink='${req.body.securityVideoLink || ''}'
WHERE ID=${id}
`);

res.redirect('/api/virus');

} catch(err) {
    console.error('editvirus update error:', err);
    res.status(500).send('Error saving changes: ' + err.message);
}

}

update();

});

module.exports = router;