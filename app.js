const express = require('express');

const secret = require('./secret');
const { connector } = require('./db/connector.js');
const mongo = require('mongodb');

const cors = require('cors');
const app = express()

// const { cropIMG } = require('./templates/img/cropImage.js');


/* OBJECTs */

const { Account } = require('./module/account');
const { Tables } = require('./module/tables');
const { Table } = require('./module/table');
const { Field } = require('./module/field');
const { Model } = require('./module/model');
/* middlewares */



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
    connector( dbo => {
        dbo.collection("ml_admin_pages").findOne({ url: `/${dynamic_url}` }, (err, result) =>{
            res.send({ page: result })
        })
    })
})

app.post(`/api/${unique_string}/api/new`, (req, res) => {

    const { api } = req.body;
    const { tables } = api;

    for(let i = 0; i < tables.length; i++){
        let table = tables[i];
        table.fields = table.fields.filter( f => f.is_hidden != true )
        table.fields = table.fields.map( f => { return { ...f, is_hidden: null } } )
    }
    connector( dbo => {
        dbo.collection('api').insertOne(api, (err, result) => {

            res.send({success: true})
        })
    })
})

app.get('/api/session/check', (req, res) => {
    const credential = req.session.credential;
    if( credential ){
        res.send({ isSigned: true, credential })
    }else{
        res.send({ isSigned: false, credential })
    }
})

app.get('/api/signout', (req, res) => {
    delete req.session.credential;
    res.send({ success: true })
})

app.get('/api/:rel/fields', (req, res) => {
    const { rel } = req.params;
    const tb = new Table(rel);
    tb.getFieldsByName( (result) => {
        const { fields, foreign_keys, keys } = result;

        res.send( { fields, foreign_keys, keys } );
    })
})

app.get('/api/:rel/data', (req, res) => {
    const { rel } = req.params;
    const model = new Model( rel );
    model.get( (data) => {
        res.send({ data });
    })
})

app.get('/api/tables', (req, res) => {
    const tables = new Tables();
    tables.getAll( ( list ) => {
        res.send({ tables: list  })
    })
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    const account = new Account(username, password);
    account.login( (code, result) => {
        const response = {
            code,
            credential: result,
        }

        if( code === 200 ){
            req.session.credential = result;
        }
        res.send(code,  response )
    })
})

app.post('/api/models/new/table', (req, res) => {
    const { name } = req.body;
    const relation = new Table( name, [], [], [] );
    relation.save( (id) => {
        res.send({ id ,success: true})
    });
})

app.post('/api/models/modify/table', (req, res) => {
    const { table } = req.body;
    const tb = new Table( table.name, table.fields, table.keys, table.foreign_keys );
    tb.setId( table.id );
    tb.modify( (result) => {
        res.send({ success: true })
    });
});

app.post('/api/models/delete/table', (req, res) => {
    const { id } = req.body;

    const tables = new Tables();
    tables.remove(id, (result) => {
        res.send({ success: true })
    })
})

app.post('/api/:rel/add/data', (req, res) => {
    const { rel }  = req.params;
    const { data } = req.body;
    const model = new Model( rel );
    model.insertOne( data , (result) => {
        res.send({ success: result })
    });

});


app.use((req, res, next) => {
    res.send(404, { msg: "404 not found" });
})
app.listen(5000, ()=>{
    console.log("Server running on www://ws:5000");
});
