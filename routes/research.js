const express = require('express');
const router = express.Router();


router.get('/', (request, response) =>
{

const ADODB = require('node-adodb');

const connection = ADODB.open(
'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdatabase.mdb;'
);

async function sqlQuery()
{

const result = await connection.query('SELECT * FROM research');

let html = "<h2>Research Database</h2>";

html += "<table border='1'>";

for(let i=0;i<result.length;i++)
{

html += "<tr>";

html += "<td>"+result[i].objectNumber+"</td>";
html += "<td>"+result[i].objectName+"</td>";
html += "<td>"+result[i].objectCreator+"</td>";
html += "<td>"+result[i].objectCreatedDate+"</td>";

html += "<td><a href='/editvirus/"+result[i].ID+"'>Edit</a></td>";
html += "<td><a href='/deletevirus/"+result[i].ID+"'>Delete</a></td>";

html += "</tr>";

}

html += "</table>";

response.send(html);

}

sqlQuery();

});

module.exports = router;