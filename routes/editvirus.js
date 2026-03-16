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

router.get('/:id', (req,res)=>{

const id = req.params.id;

const connection = ADODB.open(
'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb'
);

async function load(){

const result = await connection.query(`SELECT * FROM ResearchObjects WHERE ID=${id}`);

let v = result[0];

res.write(htmlhead);
res.write(htmlheader);
res.write(htmlmenu);
res.write(htmlinfostart);

let html = `
<h2>Edit Research Object</h2>

<form method="POST">

Object Number:<br>
<input type="text" name="objectNumber" value="${v.objectNumber}"><br>

Object Name:<br>
<input type="text" name="objectName" value="${v.objectName}"><br>

Creator:<br>
<input type="text" name="objectCreator" value="${v.objectCreator}"><br>

Created Date:<br>
<input type="text" name="objectCreatedDate" value="${v.objectCreatedDate}"><br>

Status:<br>
<input type="text" name="objectStatus" value="${v.objectStatus}"><br><br>

<input type="submit" value="Update">

</form>
`;

res.write(html);

res.write(htmlinfostop);
res.write(htmlbottom);
res.end();

}

load();

});

router.post('/:id',(req,res)=>{

const id = req.params.id;

const connection = ADODB.open(
'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdatabase.mdb'
);

async function update(){

await connection.execute(`
UPDATE ResearchObjects SET
objectNumber='${req.body.objectNumber}',
objectName='${req.body.objectName}',
objectCreator='${req.body.objectCreator}',
objectCreatedDate='${req.body.objectCreatedDate}',
objectStatus='${req.body.objectStatus}'
WHERE ID=${id}
`);

res.redirect('/api/virusdatabase');

}

update();

});

module.exports = router;