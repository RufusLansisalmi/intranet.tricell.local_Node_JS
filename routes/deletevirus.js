const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

router.get('/:id',(req,res)=>{

const id = req.params.id;

const connection = ADODB.open(
'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb'
);

async function remove(){

await connection.execute(`
DELETE FROM ResearchObjects WHERE ID=${id}
`);

res.redirect('/api/virusdatabase');

}

remove();

});

module.exports = router;