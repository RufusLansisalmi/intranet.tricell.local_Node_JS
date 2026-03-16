const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

const readHTML = require('../readHTML.js');

var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');

router.get('/', (req,res)=>{

res.write(htmlhead);
res.write(htmlheader);
res.write(htmlmenu);
res.write(htmlinfostart);

let html = `
<h2>Add Research Object</h2>

<form method="POST">

Object Number:<br>
<input type="text" name="objectNumber"><br>

Object Name:<br>
<input type="text" name="objectName"><br>

Creator:<br>
<input type="text" name="objectCreator"><br>

Created Date:<br>
<input type="text" name="objectCreatedDate"><br>

Status:<br>
<input type="text" name="objectStatus"><br><br>

<input type="submit" value="Save">

</form>
`;

res.write(html);

res.write(htmlinfostop);
res.write(htmlbottom);
res.end();

});

router.post('/', (req,res)=>{

const connection = ADODB.open(
'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb'
);

async function insert(){

await connection.execute(`
INSERT INTO ResearchObjects
(objectNumber,objectName,objectCreator,objectCreatedDate,objectStatus)
VALUES
('${req.body.objectNumber}',
'${req.body.objectName}',
'${req.body.objectCreator}',
'${req.body.objectCreatedDate}',
'${req.body.objectStatus}')
`);

res.redirect('/api/virusdatabase');

}

insert();

});

module.exports = router;