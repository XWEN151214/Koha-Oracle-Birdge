const express = require("express");
const app = express();
const api_patrons = require('./routes/patrons_routes');
const patrons = require('./routes/front_end');
const api_emp = require('./routes/emp_routes.js');
const forms = require('./routes/forms_routes');

app.use(express.static(__dirname));
app.use('/api/patrons', api_patrons);
app.use('/api/emp', api_emp);
app.use('/patrons', patrons);
app.use('/biblio', forms);
app.listen(3000);