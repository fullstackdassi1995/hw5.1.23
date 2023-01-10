// index.js
const express = require('express')
const router = express.Router()
const path = require('path')
const url = require('url')
const cors = require('cors')
const { response } = require('express')
const knex = require('knex')
const config = require('config')
const { json } = require('body-parser')

const connectedKnex = knex({
    client: 'pg',
    version: config.db.version,
    connection: {
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    }
})


const port = 8080;

const app = express()


app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use(express.static(path.join('.', '/static/'))) 


app.get('/test', async (req, resp) => {
    try {
        const test = await connectedKnex('test').select('*');
        console.log(test);
        resp.status(200).json({ test })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})



app.get('/test/:id', async (req, resp) => {
    try {
        const test = await connectedKnex('test').select('*').where('id', req.params.id).first()
        resp.status(200).json(test)
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})

function is_valid_test(obj) {
    return  obj.hasOwnProperty('name') && 
        obj.hasOwnProperty('courseid') 
}

// ADD
app.post('/test', async (req, resp) => {
    console.log(req.body);
    const test = req.body
    try {
        if (! is_valid_test (test)) {
            resp.status(400).json({ error: 'values of test are not llegal'})
            return
        }
        const result = await connectedKnex('test').insert(test)
        resp.status(201).json({
             new_test : { ...test, id: result[0]},
             url: `http://localhost:8080/test/${result}` 
            })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})

// PUT -- UPDATE/replace (or insert)
app.put('/test/:id', async (req, resp) => {
    console.log(req.body);
    const employee = req.body
    try {
        if (! is_valid_test (employee)) {
            resp.status(400).json({ error: 'values of employee are not llegal'})
            return
        }
        const result = await connectedKnex('test').where('id', req.params.id).update(employee)
        resp.status(200).json({
             status: 'updated',
             'how many rows updated': result
            })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})
// DELETE 
app.delete('/test/:id', async (req, resp) => {
    try {
        const result = await connectedKnex('test').where('id', req.params.id).del()
        resp.status(200).json({
            status: 'success',
            "how many deleted": result
        })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }

})

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})