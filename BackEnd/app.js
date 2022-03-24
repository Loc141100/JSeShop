require('dotenv/config');
const express = require('express');
const app = express();
const api = process.env.API_URL;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJt = require('./helpers/jwt');
const errorHandler = require('./helpers/error.handler');


app.use(authJt());
app.use(cors());
app.options('*',cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(errorHandler);

//route
const productsRoutes = require('./routers/products');
const ordersRoutes = require('./routers/orders');
const usersRoutes = require('./routers/users');
const categoriesRoutes = require('./routers/categories');
const authJwt = require('./helpers/jwt');




app.use(`${api}/products`, productsRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/categories`, categoriesRoutes);

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'mean-eshop'
})
.then(()=>{
    console.log('You have connected to the Database...')
})
.catch((err)=> {
    console.log(err);
})

//Server
app.listen(3000, ()=>{

    console.log('server is running http://localhost:3000');
})