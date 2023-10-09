const express = require('express');
const routes = express.Router();
const {
        insert_patrons, update_patrons, 
        contributions, calculations, 
        employees, bookRent
      } = require('../controllers/front_ctrl');

routes.get('/insert', insert_patrons);
routes.get('/update', update_patrons);
routes.get('/contrib', contributions);
routes.get('/calculation', calculations);
routes.get('/rent', bookRent);
routes.get('/employees', employees);

module.exports = routes;