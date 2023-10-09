const express = require('express');
const routes = express.Router();
const {get_item, get_recovery_price, get_policy, get_rent, get_serial} = require('../controllers/forms_ctrl');

routes.get('/item', get_item);
routes.get('/price', get_recovery_price);
routes.get('/policy', get_policy);
routes.get('/rent', get_rent);
routes.get('/serial', get_serial);

module.exports = routes;