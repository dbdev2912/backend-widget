const express = require('express');

const secret = require('./secret');
const { connector } = require('./db/connector.js');
const mongo = require('mongodb');

const cors = require('cors');
const app = express()

// const { cropIMG } = require('./templates/img/cropImage.js');

/* middlewares */

app.use(require('cookie-parser')(secret.cookie));
app.use(require('express-session')());
app.use( express.static('public') );
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
}));

app.use( bodyParser.json({ limit: "50mb" }) );

app.get('/', (req, res) => {
    res.send({ msg: "Hello World" });
})

app.use((req, res, next) => {
    res.send(404, { msg: "404 not found" });
})
app.listen(5000, ()=>{
    console.log("Server running on www://ws:5000");
});
