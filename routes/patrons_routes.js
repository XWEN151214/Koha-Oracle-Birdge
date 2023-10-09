const express = require('express');
const routes = express.Router()
const {patrons} = require('../controllers/patrons_ctrl');
const {insert, get_stats, get_update, update, batches, valid} = require('../middleware/patrons_mid');

routes.get('/insert', get_stats,  patrons);
routes.post('/insert', insert, patrons);
routes.get('/update', get_update, patrons);
routes.put('/update', update, patrons);
routes.get('/batches', batches, patrons);
routes.get('/valid', valid, patrons);

module.exports = routes;

