const express = require('express');
const router = express.Router();
var cookieParser = require('cookie-parser');
router.use(cookieParser());
const ADODB = require('node-adodb');
var fs = require('fs');
const path = require('path');
const readHTML = require('../readHTML');
router.use(express.static('public'));
const pug = require('pug');
const pug_loggedinmenu = pug.compileFile('./html/loggedinmenu.html');

var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');

router.get('/', (req, res) => {
    const employeeid = req.query.femployeecode;
    const passwd = req.query.fpassword;
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

    async function sqlQuery() {
        const result = await connection.query("SELECT passwd, logintimes, lastlogin, lockout FROM users WHERE employeeCode='" + employeeid + "'");
        if (result == "") {
            res.redirect('/api/login/unsuccessful');
        } else {
            str_passwd = result[0]['passwd'];
            str_logintimes = result[0]['logintimes'];
            str_lastlogin = result[0]['lastlogin'];
            str_lockout = result[0]['lockout'];

            async function sqlQuery3() {
                const result3 = await connection.query("SELECT name, securityAccessLevel FROM employee WHERE employeeCode='" + employeeid + "'");
                str_name = result3[0]['name'];
                req.session.securityAccessLevel = result3[0]['securityAccessLevel'];

                if (str_lockout == null) {
                    if (str_passwd == passwd) {
                        req.session.loggedin = true;
                        req.session.username = employeeid;
                        int_logintimes = parseInt(str_logintimes) + 1;
                        let ts = Date.now();
                        let date_ob = new Date(ts);
                        str_lastlogin = date_ob.getDate() + "." + (date_ob.getMonth() + 1) + "." + date_ob.getFullYear();

                        res.cookie('employeecode', employeeid);
                        res.cookie('name', str_name);
                        res.cookie('lastlogin', str_lastlogin);
                        res.cookie('logintimes', int_logintimes);

                        res.cookie("sortAmount", 20);
                        res.cookie("sortType", "ID");

                        async function sqlQuery2() {
                            await connection.execute("UPDATE users SET logintimes='" + int_logintimes + "', lastlogin='" + str_lastlogin + "' WHERE employeeCode='" + employeeid + "'");

                            const logConnection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/activity_log.mdb;');
                            let ts2 = Date.now();
                            let d = new Date(ts2);
                            let loginDate = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
                            let timeOfLogin = d.getHours() + ":" + String(d.getMinutes()).padStart(2, '0');
                            await logConnection.execute("INSERT INTO [Log] (EmployeeCode, [Name], [Date], [Time], Activity) VALUES ('" + employeeid + "', '" + str_name + "', '" + loginDate + "', '" + timeOfLogin + "', 'Login')");
                            await logConnection.execute("DELETE FROM [Log] WHERE ID NOT IN (SELECT TOP 150 ID FROM [Log] ORDER BY ID DESC)");
                        }
                        sqlQuery2();
                        res.redirect('/api/personnelregistry/' + employeeid);
                    } else {
                        res.redirect('/api/login/unsuccessful');
                    }
                } else {
                    res.redirect('/api/login/unsuccessful');
                }
            }
            sqlQuery3();
        }
    }
    sqlQuery().catch(err => { console.error('login error:', err); if (!res.headersSent) res.status(500).end('Server error'); });
});

router.get('/:successful', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    res.write(htmlhead);
    res.write(htmlheader);
    res.write(htmlmenu);
    res.write(htmlinfostart);
    if (req.session.loggedin) { var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html'); res.write(htmlLoggedinMenuCSS); }
    if (req.session.loggedin) { var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html'); res.write(htmlLoggedinMenuJS); }
    if (req.session.loggedin) {
        res.write(pug_loggedinmenu({ employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes, securityAccessLevel: req.session.securityAccessLevel }));
    }
    if (req.session.loggedin) {
        res.write("Login successful<br /><p />");
    } else {
        res.write("Login unsuccessful<br /><p />");
    }
    const logConnection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/activity_log.mdb;');
    const deleteRow150 = logConnection.execute("DELETE FROM [Log] WHERE ID NOT IN (SELECT TOP 150 ID FROM [Log] ORDER BY ID DESC)");
   // getting dat of login
   let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let loginDate = date + "." + month + "." + year;
    //getting time of login
    let hourOFLogin = date_ob.getHours();
    let minuteOfLogin = date_ob.getMinutes();
    let timeOfLogin = hourOFLogin + ":" + minuteOfLogin;

    const updateLog = logConnection.execute("INSERT INTO [Log] (EmployeeCode, [Name], [Date], [Time], Activity) VALUES ('" + req.cookies.employeecode + "', '" + req.cookies.name + "', '" + loginDate + "', '" + timeOfLogin + "', 'Login')");
   
   
    res.write(htmlinfostop);
    res.write(htmlbottom);
    res.end();
});

router.get('/:unsuccessful', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    res.write(htmlhead);
    res.write(htmlheader);
    res.write(htmlmenu);
    res.write(htmlinfostart);
    res.write("Login unsuccessful<br /><p />");
    res.write(htmlinfostop);
    res.write(htmlbottom);
    res.end();
});

module.exports = router;
