var express = require('express');
var router = express.Router();
var conn = require("../services/dbconnection");
var jsonexport = require('jsonexport');

router.post('/', function(req, res) {
    conn.getConnection((err, connection) => {
        connection.query("SELECT survey._id, survey.userid, user.username, survey.survey_json, date_format(survey.create_time,'%Y-%m-%d %T') as create_time FROM survey, user where survey.userid = user.userid;",
            (err, rows) => {
                if (err) {
                    res.sendStatus(409);
                } else {
                    if (rows[0] == undefined) {
                        res.sendStatus(404);
                    } else {
                        res.status(200).send({ result: rows });
                    }
                }
            });
        connection.release();

    });
});

router.post('/:id', function(req, res) {
    conn.getConnection((err, connection) => {
        connection.query('INSERT INTO survey(userid, survey_json) VALUES (?, ?)', [req.params.id, req.body.json],
            (err, rows) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(409);
                } else {
                    res.sendStatus(201);
                }
            });
        connection.release();
    });
});

router.post('/csv/:id', function(req, res) {
    if (req.params.id == '*') {
        conn.getConnection((err, connection) => {
            connection.query("SELECT survey._id, survey.userid, user.username, survey.survey_json, date_format(survey.create_time,'%Y-%m-%d %T') as create_time FROM survey, user where survey.userid = user.userid;",
                (err, rows) => {
                    if (err) {
                        res.sendStatus(409);
                    } else {
                        if (rows[0] == undefined) {
                            res.sendStatus(404);
                        } else {
                            var jsonArray = new Array;
                            for (var i in rows) {
                                var jsonElement = new Object;
                                var jsonParsed = new Object;
                                jsonElement.id = rows[i]._id;
                                jsonElement.userid = rows[i].userid;
                                jsonElement.username = rows[i].username;
                                jsonElement.create_time = rows[i].create_time;
                                jsonParsed = JSON.parse(rows[i].survey_json);
                                Object.assign(jsonElement, jsonParsed);
                                jsonArray.push(jsonElement);
                            }
                            jsonexport(jsonArray, (err, csv) => {
                                res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                                res.set('Content-Type', 'text/csv; charset=euc-kr');
                                res.status(200).send(csv);
                            });
                        }
                    }
                });
            connection.release();
        });
    } else {
        conn.getConnection((err, connection) => {
            connection.query('SELECT * FROM survey WHERE _id=?', [req.params.id],
                (err, rows) => {
                    if (err) {
                        res.sendStatus(409);
                    } else {
                        if (rows[0] == undefined) {
                            res.sendStatus(404);
                        } else {
                            res.status(201).send({ result: rows });
                        }
                    }
                });
            connection.release();
        });
    }
});

router.post('/json/:id', function(req, res) {
    conn.getConnection((err, connection) => {
        connection.query('SELECT _id, userid, survey_json FROM survey WHERE _id=?', [req.params.id],
            (err, rows) => {
                if (err) {
                    res.sendStatus(409);
                } else {
                    if (rows[0] == undefined) {
                        res.sendStatus(404);
                    } else {
                        res.status(200).send({ result: rows[0] });
                    }
                }
            });
        connection.release();
    });
});

module.exports = router;