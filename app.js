// index.js
const express = require('express')
const router = express.Router()
const path = require('path')
const url = require('url')
const cors = require('cors')
const { response } = require('express')
const knex = require('knex')
const config = require('config')

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

// to use body parameters
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use(express.static(path.join('.', '/static/'))) // /static/index.html
// page1.html

app.get('/fruit', (req, resp) => {
    resp.writeHead(201);
    resp.end('Banan is my favorite fruit!')
})

// parameters -
// 1. query params  <url> ? x = 1 & y = 2
// 2. path params   <url> / 1 
// 3. body 
// 4. headers
app.get('/add', (req, resp) => {
    // http://localhost:8080/ add ? x = 3 & y = 4

    console.log(req.url);
    console.log(req.query);

    const x = Number(req.query.x)
    const y = Number(req.query.y)

    if (isNaN(x)) {
        resp.writeHead(400)
        resp.end(`${req.query.x} is not a number`)
        return
    }
    if (isNaN(y)) {
        resp.writeHead(400)
        resp.end(`${req.query.y} is not a number`)
        return
    }
})

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



// get end point by id
app.get('/employee/:id', async (req, resp) => {
    try {
        const employees = await connectedKnex('employee').select('*').where('id', req.params.id).first()
        resp.status(200).json(employees)
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})

function is_valid_employee(obj) {
    return obj.hasOwnProperty('name') && obj.hasOwnProperty('age') && 
        obj.hasOwnProperty('address') && obj.hasOwnProperty('salary') 
}

// ADD
app.post('/employee', async (req, resp) => {
    console.log(req.body);
    const employee = req.body
    try {
        if (! is_valid_employee (employee)) {
            resp.status(400).json({ error: 'values of employee are not llegal'})
            return
        }
        const result = await connectedKnex('employee').insert(employee)
        resp.status(201).json({
             new_employee : { ...employee, ID: result[0] },
             url: `http://localhost:8080/employee/${result}` 
            })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})

// PUT -- UPDATE/replace (or insert)
app.put('/employee/:id', async (req, resp) => {
    console.log(req.body);
    const employee = req.body
    try {
        if (! is_valid_employee (employee)) {
            resp.status(400).json({ error: 'values of employee are not llegal'})
            return
        }
        const result = await connectedKnex('employee').where('id', req.params.id).update(employee)
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
app.delete('/employee/:id', async (req, resp) => {
    try {
        const result = await connectedKnex('employee').where('id', req.params.id).del()
        resp.status(200).json({
            status: 'success',
            "how many deleted": result
        })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }

})
// PATCH -- UPDATE 
app.patch('/employee/:id', (req, resp) => {
    console.log(req.params.id);
    // actually delete ... later
    // response
    resp.writeHead(200)
    resp.end('Successfully updated patched')
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})