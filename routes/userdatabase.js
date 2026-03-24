const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');
const pug = require('pug');
const readHTML = require('../readHTML.js');

router.use(express.urlencoded({ extended: false }));

const pug_loggedinmenu = pug.compileFile('./html/loggedinmenu.html');

var htmlhead     = readHTML('./html/head.html');
var htmlheader   = readHTML('./html/header.html');
var htmlmenu     = readHTML('./html/menu.html');
var htmlinfostart = readHTML('./html/infostart.html');
var htmlinfostop = readHTML('./html/infostop.html');
var htmlbottom   = readHTML('./html/bottom.html');

function writeFrame(req, res) {
    res.write(htmlhead);
    res.write(htmlheader);
    if (req.session.loggedin) {
        res.write(readHTML('./html/loggedinmenu_css.html'));
        res.write(readHTML('./html/loggedinmenu_js.html'));
        res.write(pug_loggedinmenu({
            employeecode: req.cookies.employeecode,
            name: req.cookies.name,
            lastlogin: req.cookies.lastlogin,
            logintimes: req.cookies.logintimes,
            securityAccessLevel: req.session.securityAccessLevel
        }));
    }
    res.write(htmlmenu);
    res.write(htmlinfostart);
}

// -------------------- List users + Add New User form --------------------
router.get('/', async (req, res) => {
    if (!req.session.loggedin || req.session.securityAccessLevel !== 'A') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        writeFrame(req, res);
        res.write('<h2>You are not authorised to access this.</h2>');
        res.write(htmlinfostop);
        res.write(htmlbottom);
        return res.end();
    }

    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

    try {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        writeFrame(req, res);

        // Get all users joined with employee info
        const users = await connection.query(`
            SELECT u.employeeCode, u.lockout, e.[name], e.securityAccessLevel
            FROM users u
            LEFT JOIN employee e ON u.employeeCode = e.employeeCode
            ORDER BY u.employeeCode
        `);

        // Get employees that don't have a user account yet (for dropdown)
        const employees = await connection.query(`
            SELECT e.employeeCode, e.[name]
            FROM employee e
            WHERE e.employeeCode NOT IN (SELECT employeeCode FROM users)
            ORDER BY e.employeeCode
        `);

        let html = '<link rel="stylesheet" href="css/personnel_registry.css" />';

        // ---- User list table ----
        html += '<h2>User Database <a href="javascript:void(0)" onclick="document.getElementById(\'addForm\').style.display=document.getElementById(\'addForm\').style.display===\'none\'?\'block\':\'none\'" style="font-size:14px;color:#336699;text-decoration:none;">[+] Add New User</a></h2>';

        html += '<table id="personnel">';
        html += '<tr>';
        html += '<td class="infoheadinglight" width="120">Username</td>';
        html += '<td class="infoheadingdark"  width="220">Full Name</td>';
        html += '<td class="infoheadinglight" width="60">Level</td>';
        html += '<td class="infoheadinglight" width="100">Status</td>';
        html += '<td class="infoheadinglight" width="50">Edit</td>';
        html += '<td class="infoheadinglight" width="50">Del</td>';
        html += '</tr>';

        for (let u of users) {
            const locked  = u.lockout != null && u.lockout !== '';
            const status  = locked ? '<b style="color:#cc0000;">LOCKED</b>' : 'Active';
            const encoded = encodeURIComponent(u.employeeCode);
            html += '<tr>';
            html += `<td class="infolight">${u.employeeCode}</td>`;
            html += `<td class="infodark">${u.name || ''}</td>`;
            html += `<td class="infolight">${u.securityAccessLevel || ''}</td>`;
            html += `<td class="infolight">${status}</td>`;
            html += `<td class="infolight" style="text-align:center;"><a href="/api/userdatabase/edit/${encoded}" style="color:#000;">[E]</a></td>`;
            html += `<td class="infolight" style="text-align:center;"><a href="/api/userdatabase/delete/${encoded}" style="color:#cc0000;" onclick="return confirm('Delete user ${u.employeeCode}?')">[X]</a></td>`;
            html += '</tr>';
        }
        html += '</table>';

        // ---- Add New User form ----
        html += '<div id="addForm" style="display:none;margin-top:20px;padding:16px;border:1px solid #003366;width:400px;background:#f5f5f5;">';
        html += '<h3 style="margin-top:0;">Add New User</h3>';
        html += '<form method="POST" action="/api/userdatabase">';

        html += 'Username (Max 7):<br>';
        html += '<input type="text" name="username" maxlength="7" style="width:140px;"> &nbsp; eller &nbsp;';

        // Employee dropdown
        html += '<select name="employeecode" style="width:130px;"><option value="">-Select-</option>';
        for (let e of employees) {
            html += `<option value="${e.employeeCode}">${e.employeeCode}</option>`;
        }
        html += '</select><br><br>';

        html += 'Full Name:<br><input type="text" name="fullname" style="width:280px;"><br><br>';
        html += 'Password (Max 7):<br><input type="password" name="passwd" maxlength="7" style="width:280px;"><br><br>';
        html += 'Security Level:<br><select name="securitylevel" style="width:280px;">';
        html += '<option value="C">C (Standard)</option>';
        html += '<option value="B">B</option>';
        html += '<option value="A">A (Admin)</option>';
        html += '</select><br><br>';

        html += '<input type="submit" value="Create User" style="background:#003366;color:#fff;border:none;padding:6px 16px;cursor:pointer;">';
        html += '</form></div>';

        res.write(html);
        res.write(htmlinfostop);
        res.write(htmlbottom);
        res.end();
    } catch (err) {
        console.error('userdatabase GET error:', err);
        if (!res.headersSent) res.status(500).end('Server error');
    }
});

// -------------------- Create user --------------------
router.post('/', async (req, res) => {
    if (!req.session.loggedin || req.session.securityAccessLevel !== 'A') {
        return res.status(403).end('Access denied.');
    }

    // Use custom username if filled, else use selected employee code
    const employeeCode  = (req.body.username && req.body.username.trim()) ? req.body.username.trim() : req.body.employeecode;
    const fullname      = req.body.fullname || '';
    const passwd        = req.body.passwd || '';
    const securityLevel = req.body.securitylevel || 'C';

    if (!employeeCode) {
        return res.status(400).end('No username or employee code provided.');
    }

    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

    try {
        // Check if user already exists
        const existing = await connection.query(`SELECT employeeCode FROM users WHERE employeeCode='${employeeCode}'`);
        if (existing.length > 0) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            writeFrame(req, res);
            res.write('<h2>Error: User already exists. Use Edit to modify an existing user.</h2>');
            res.write('<a href="/api/userdatabase" style="color:#336699;">Back to User Database</a>');
            res.write(htmlinfostop);
            res.write(htmlbottom);
            return res.end();
        }

        // Insert into users table
        await connection.execute(`INSERT INTO users (employeeCode, passwd, logintimes) VALUES ('${employeeCode}', '${passwd}', 0)`);

        // If custom username (not from employee table), also insert into employee
        if (req.body.username && req.body.username.trim()) {
            const empExists = await connection.query(`SELECT employeeCode FROM employee WHERE employeeCode='${employeeCode}'`);
            if (empExists.length === 0) {
                await connection.execute(`INSERT INTO employee (employeeCode, [name], securityAccessLevel) VALUES ('${employeeCode}', '${fullname}', '${securityLevel}')`);
            }
        } else {
            // Update security level on existing employee record
            await connection.execute(`UPDATE employee SET securityAccessLevel='${securityLevel}' WHERE employeeCode='${employeeCode}'`);
        }

        res.redirect('/api/userdatabase');
    } catch (err) {
        console.error('userdatabase POST error:', err);
        if (!res.headersSent) res.status(500).end('Server error: ' + err.message);
    }
});

// -------------------- Edit user form --------------------
router.get('/edit/:username', async (req, res) => {
    if (!req.session.loggedin || req.session.securityAccessLevel !== 'A') {
        return res.status(403).end('Access denied.');
    }

    const username   = decodeURIComponent(req.params.username);
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

    try {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        writeFrame(req, res);

        const users = await connection.query(`SELECT u.employeeCode, u.lockout, e.[name], e.securityAccessLevel FROM users u LEFT JOIN employee e ON u.employeeCode = e.employeeCode WHERE u.employeeCode='${username}'`);

        if (users.length === 0) {
            res.write('<h2>User not found.</h2>');
            res.write('<a href="/api/userdatabase" style="color:#336699;">Back</a>');
            res.write(htmlinfostop);
            res.write(htmlbottom);
            return res.end();
        }

        const u      = users[0];
        const locked = (u.lockout != null && u.lockout !== '');

        let html = '<link rel="stylesheet" href="css/personnel_registry.css" />';
        html += '<h2>Edit User</h2>';
        html += `<form method="POST" action="/api/userdatabase/edit/${encodeURIComponent(username)}" style="padding:16px;border:1px solid #003366;width:360px;background:#f5f5f5;">`;

        html += `Username:<br><input type="text" value="${u.employeeCode}" disabled style="width:280px;background:#ddd;"><br><br>`;
        html += `Full Name:<br><input type="text" value="${u.name || ''}" disabled style="width:280px;background:#ddd;"><br><br>`;

        html += 'Security Level:<br><select name="securitylevel" style="width:280px;">';
        for (let lvl of ['A', 'B', 'C']) {
            const sel = (u.securityAccessLevel === lvl) ? ' selected' : '';
            html += `<option value="${lvl}"${sel}>${lvl}${lvl==='A'?' (Admin)':lvl==='C'?' (Standard)':''}</option>`;
        }
        html += '</select><br><br>';

        html += 'Lock out:<br><select name="lockout" style="width:280px;">';
        html += `<option value="no"${!locked ? ' selected' : ''}>No</option>`;
        html += `<option value="yes"${locked  ? ' selected' : ''}>Yes</option>`;
        html += '</select><br><br>';

        html += 'New Password (leave blank to keep current):<br><input type="password" name="passwd" maxlength="7" style="width:280px;"><br><br>';

        html += '<input type="submit" value="Edit user" style="background:#003366;color:#fff;border:none;padding:6px 16px;cursor:pointer;">';
        html += '</form>';

        res.write(html);
        res.write(htmlinfostop);
        res.write(htmlbottom);
        res.end();
    } catch (err) {
        console.error('userdatabase edit GET error:', err);
        if (!res.headersSent) res.status(500).end('Server error');
    }
});

// -------------------- Save edit --------------------
router.post('/edit/:username', async (req, res) => {
    if (!req.session.loggedin || req.session.securityAccessLevel !== 'A') {
        return res.status(403).end('Access denied.');
    }

    const username      = decodeURIComponent(req.params.username);
    const securityLevel = req.body.securitylevel || 'C';
    const lockout       = req.body.lockout === 'yes' ? 'locked' : null;
    const newPasswd     = req.body.passwd || '';

    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

    try {
        // Update lockout
        if (lockout === null) {
            await connection.execute(`UPDATE users SET lockout=Null WHERE employeeCode='${username}'`);
        } else {
            await connection.execute(`UPDATE users SET lockout='${lockout}' WHERE employeeCode='${username}'`);
        }

        // Update password only if a new one was provided
        if (newPasswd.trim() !== '') {
            await connection.execute(`UPDATE users SET passwd='${newPasswd}' WHERE employeeCode='${username}'`);
        }

        // Update security level in employee table
        await connection.execute(`UPDATE employee SET securityAccessLevel='${securityLevel}' WHERE employeeCode='${username}'`);

        res.redirect('/api/userdatabase');
    } catch (err) {
        console.error('userdatabase edit POST error:', err);
        if (!res.headersSent) res.status(500).end('Server error');
    }
});

// -------------------- Delete user --------------------
router.get('/delete/:username', async (req, res) => {
    if (!req.session.loggedin || req.session.securityAccessLevel !== 'A') {
        return res.status(403).end('Access denied.');
    }

    const username   = decodeURIComponent(req.params.username);
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

    try {
        await connection.execute(`DELETE FROM users WHERE employeeCode='${username}'`);
        res.redirect('/api/userdatabase');
    } catch (err) {
        console.error('userdatabase delete error:', err);
        if (!res.headersSent) res.status(500).end('Server error');
    }
});

module.exports = router;
