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

const unique_string = "ngonghinhnhilalunnhi";

app.use( bodyParser.json({ limit: "50mb" }) );

app.get('/', (req, res) => {
    res.send({ msg: "Hello World" });
})

app.post(`/api/${unique_string}/navbar/update`, ( req, res ) => {
    const { widgets } = req.body;
    connector( dbo => {
        dbo.collection("ml_admin_ui_widget").findOne( {"name": "ui-navbar"}, ( err, result ) => {
            if( !result ){
                dbo.collection("ml_admin_ui_widget").insert({"name": "ui-navbar", "widgets": widgets }, ( err, result ) => {
                    res.send({ success: true })
                })
            }else{

                dbo.collection("ml_admin_ui_widget").update({"name": "ui-navbar"}, { $set: { widgets: widgets } }, ( err, result ) => {
                    res.send({ success: true })
                })
            }
        })

    })
})

app.get(`/api/${unique_string}/navbar`, ( req, res ) => {
    connector( dbo => {
        dbo.collection('ml_admin_ui_widget').findOne({ name: "ui-navbar" }, (err, result) => {
            res.send({ widgets: result?result.widgets: [] })
        })
    })
})

app.post(`/api/${ unique_string }/page/update`, ( req, res ) => {

    const { page } = req.body;

    connector( dbo => {
        dbo.collection("ml_admin_pages").findOne({ url: page.url }, ( err, result ) => {
            if( !result ){
                dbo.collection("ml_admin_pages").insert(page, ( err, result ) => {
                    res.send( {success: true} )
                });
            }else{
                dbo.collection("ml_admin_pages").updateOne({ url: page.url },
                    {
                        $set: {
                            id: page.id,
                            widgets: page.widgets,
                            title: page.title,
                        }
                    },
                    ( err, result ) => {
                        console.log("updated")
                        res.send( {success: true} )
                });
            }
        })
    })
})

app.get(`/api/${unique_string}/pages`, ( req, res ) => {
    connector( dbo => {
        dbo.collection('ml_admin_pages').find({ }).toArray((err, result) => {
            res.send({ pageList: result ? result : [] })
        })
    })
})


app.get(`/api/${unique_string}/page/:id`, (req, res) => {
    const { id } = req.params;
    connector( dbo => {
        dbo.collection("ml_admin_pages").findOne({ id }, (err, result)=> {
            const page = result;
            res.send({ page });
        })
    })
})


app.post(`/api/${unique_string}/page/widget/by/url`, (req, res) => {
    const { dynamic_url } = req.body;
    console.log(dynamic_url)
    connector( dbo => {
        dbo.collection("ml_admin_pages").findOne({ url: `/${dynamic_url}` }, (err, result) =>{
            res.send({ page: result })
        })
    })
})

app.use((req, res, next) => {
    res.send(404, { msg: "404 not found" });
})
app.listen(5000, ()=>{
    console.log("Server running on www://ws:5000");
});
