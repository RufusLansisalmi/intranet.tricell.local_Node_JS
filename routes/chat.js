const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

// GET - return all chat messages as HTML
router.get('/', (req, res) => {
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

    async function getMessages() {
        const result = await connection.query('SELECT * FROM chat ORDER BY id ASC');
        let html = '';
        for (let i = 0; i < result.length; i++) {
            const employeecode = result[i]['employeecode'] || '';
            const message = result[i]['message'] || '';
            const postdate = result[i]['postdate'] || '';
            const posttime = result[i]['posttime'] || '';
            html +=
                '<div style="margin-bottom:6px;">' +
                '<span style="font-weight:bold;color:#336699;">' + employeecode + '</span> ' +
                '<span style="font-size:10px;color:#999;">' + postdate + ' ' + posttime + '</span><br/>' +
                '<span>' + message + '</span>' +
                '</div>';
        }
        res.send(html);
    }

    getMessages().catch(err => {
        console.error('chat GET error:', err);
        if (!res.headersSent) res.status(500).end('Server error');
    });
});

// POST - save a new chat message
router.post('/', (req, res) => {
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');
    const message = req.body.chatmessage || '';
    const employeecode = req.cookies ? (req.cookies.employeecode || 'unknown') : 'unknown';

    if (!message.trim()) {
        return res.send('');
    }

    const today = new Date();
    const postdate = today.toISOString().slice(0, 10);
    const posttime = today.toTimeString().slice(0, 8);

    async function insertMessage() {
        await connection.execute(
            `INSERT INTO chat (employeecode, message, postdate, posttime, readby) VALUES ('${employeecode}', '${message.replace(/'/g, "''")}', '${postdate}', '${posttime}', '${employeecode}')`
        );
        res.send('');
    }

    insertMessage().catch(err => {
        console.error('chat POST error:', err);
        if (!res.headersSent) res.status(500).end('Server error');
    });
});

module.exports = router;
