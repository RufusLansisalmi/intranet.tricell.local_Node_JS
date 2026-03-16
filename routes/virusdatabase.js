const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(express.static('./public'));

const readHTML = require('../readHTML.js');
const pug = require('pug');

const pug_loggedinmenu = pug.compileFile('./html/loggedinmenu.html');

// Masterframe
var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');


router.get('/', (req, res) =>
{

let str_objectNumber, str_objectName, str_objectCreator, str_objectCreatedDate, str_objectStatus;

const connection = ADODB.open(
'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb'
);

async function sqlQuery()
{

// masterframe top
res.write(htmlhead);
res.write(htmlheader);

if(req.session.loggedin)
{
var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html');
res.write(htmlLoggedinMenuCSS);
}

if(req.session.loggedin)
{
var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html');
res.write(htmlLoggedinMenuJS);
}

if(req.session.loggedin)
{
res.write(pug_loggedinmenu({
employeecode: req.cookies.employeecode,
name: req.cookies.name,
lastlogin: req.cookies.lastlogin,
logintimes: req.cookies.logintimes
}));
}

res.write(htmlmenu);
res.write(htmlinfostart);


// PAGE CONTENT

let htmloutput = 
"<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>";

if(req.session.loggedin)
{

htmloutput += "<table border=\"0\">";

htmloutput += "<tr><td width=\"350\" align=\"left\">";

htmloutput += "<h2>Research Database:</h2>";

htmloutput += "</td><td width=\"350\" align=\"right\">";

htmloutput += "<a href=\"http://localhost:3000/api/newvirus\" style=\"color:#336699;text-decoration:none;\">Add New Research Object</a>";

htmloutput += "</td></tr></table>";

}
else
{
htmloutput += "<h2>Research Database:</h2>";
}


htmloutput += 
"<table id=\"personnel\">"+
"<tr>"+
"<td class=\"infoheadinglight\" width=\"150\">OBJECT NUMBER</td>"+
"<td class=\"infoheadingdark\" width=\"220\">OBJECT NAME</td>"+
"<td class=\"infoheadinglight\" width=\"150\">CREATED BY</td>"+
"<td class=\"infoheadinglight\" width=\"150\">CREATED DATE</td>"+
"<td class=\"infoheadinglight\" width=\"120\">STATUS</td>";

if(req.session.loggedin)
{

htmloutput += 
"<td class=\"table-header-cell-light\">Edit</td>"+
"<td class=\"table-header-cell-light\">Delete</td>";

}

htmloutput += "</tr>";


// DATABASE QUERY

try
{

const result = await connection.query(`
SELECT
ID,
objectNumber,
objectName,
objectCreator,
objectCreatedDate,
objectText,
objectStatus,
presentationVideoLink,
securityVideoLink
FROM ResearchObjects
`);

var count = result.length;

for(let i=0;i<count;i++)
{

id = result[i]['ID'];

str_objectNumber = result[i]['objectNumber'];
str_objectName = result[i]['objectName'];
str_objectCreator = result[i]['objectCreator'];
str_objectCreatedDate = result[i]['objectCreatedDate'];
str_objectStatus = result[i]['objectStatus'];

htmloutput +=
"<tr>"+
"<td class=\"infolight\">"+str_objectNumber+"</td>"+
"<td class=\"infodark\">"+str_objectName+"</td>"+
"<td class=\"infolight\">"+str_objectCreator+"</td>"+
"<td class=\"infolight\">"+str_objectCreatedDate+"</td>"+
"<td class=\"infolight\">"+str_objectStatus+"</td>";

if(req.session.loggedin)
{

htmloutput +=
"<td><a href=\"http://localhost:3000/api/editvirus/"+id+"\" style=\"color:#336699;\">E</a></td>"+
"<td><a href=\"http://localhost:3000/api/deletevirus/"+id+"\" style=\"color:#336699;\">D</a></td>";

}

htmloutput += "</tr>";

}

}
catch(err)
{

console.error("ADODB query failed:",err);

htmloutput += "<tr><td colspan=\"6\">Database error</td></tr>";

}

htmloutput += "</table>";

res.write(htmloutput);


// masterframe bottom
res.write(htmlinfostop);
res.write(htmlbottom);
res.end();

}

sqlQuery();

});


module.exports = router;