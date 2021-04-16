require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const {validateToken } = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

app.use(express.json({limit: '170mb'}));
app.use(express.urlencoded({limit: '170mb', extended:false}));

var corsOptions = {
    origin: '*',
    limit:'50mb',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use('/uploads', express.static('uploads'));
app.use(validateToken)

//Request Handler 
app.use('/users', require('./users/user.controller'));
app.use('/roles', require('./roles/role.controller'));
app.use('/orders', require('./orders/order.controller'));
app.use('/shopify', require('./shopify/shopify.controller'));
// global error handler
app.use(errorHandler);

// start server
const port = 4100;//process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4100;
const server = app.listen(port, function () {
    console.log('Adlytic Server listening on port ' + port);
});
server.timeout = 600000;
