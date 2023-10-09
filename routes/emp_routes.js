const express = require('express')
const routes = express.Router();
const {emp} = require('../controllers/emp_ctrl');
const {get_stats, insert, get_update} = require('../middleware/emp_mid');

routes.get('/insert', get_stats, emp);
routes.post('/insert', insert, emp);
routes.get('/update', get_update, emp);

module.exports = routes;