const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3')
var db = new sqlite3.Database('data.db')
var bodyParser = require('body-parser');

var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res, next) => {
   const url = (req.url == '/') ? '/?page=1' : req.url


    let filterResult = [];
    let ck1 = req.query.ck1, ck2 = req.query.ck2, ck3 = req.query.ck3, ck4 = req.query.ck4, ck5 = req.query.ck5, ck6 = req.query.ck6;
    let x = req.query
    let filter = false;
    const page = req.query.page || 1;
    const limit = 3;
    const offset = (page - 1) * limit;

    if (ck1 && x.idbox) {
        filter = true;
        filterResult.push(`id = ${x.idbox}`)
    }
    if (ck2 && x.string) {
        filter = true;
        filterResult.push(`string ='${x.string}'`)
    }
    if (ck3 && x.integer) {
        filter = true;
        filterResult.push(`integer =${x.integer}`)
    }
    if (ck4 && x.float) {
        filter = true;
        filterResult.push(`float =${x.float}`)
    }
    if (ck5 && x.datestart) {
        filter = true;
        filterResult.push(`date >="${x.datestart}"`)
        filterResult.push(`date <="${x.dateend}"`)
    }
    if (ck6 && 'x.boolean') {
        filter = true;
        filterResult.push(`boolean ='${x.boolean}'`)
    }
    let sql = 'SELECT COUNT(*) as total FROM bread'
    if (filter) {
        sql += ` WHERE ${filterResult.join(" AND ")}`
    }
    db.all(sql, (err, count) => {
        const total = count[0].total;
        const pages = Math.ceil(total / limit);
        sql = 'SELECT * FROM bread'
        if (filter) {
            sql += ` WHERE ${filterResult.join(" AND ")}`
        }
        sql += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`
        db.all(sql, (err, response) => {
            res.render('index' , {
                query: req.query, data: response, pagination: {
                    page, pages, url
                }
            })
        })

    })
})
app.get('/add', (req, res) => {
    res.render('add')
})
app.post('/add', (req, res) => {
    db.all(`INSERT INTO bread (string, integer, float, date, boolean) VALUES ($1, $2, $3, $4, $5)`, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean], (err, rows) => {
        res.redirect('/')
    })
});
app.get('/delete/:id', (req, res) => {
    let id = req.params.id
    db.all(`DELETE FROM bread WHERE id='${id}'`, (err) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/')
        }
    })
})
app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    let item = `SELECT * FROM bread`
    db.all(item, (err, rows) => {
        let urut = rows[id - 1];
        console.log(urut);
        if (!err) {
            res.render('edit', { urut, id })
        } else {
            res.send("jangan coba2 kamu hack ya website saya")
        }
    })
})
app.post('/edit/:id', (req, res) => {
    let id = req.params.id
    let item = `SELECT * FROM bread`
    db.all(item, (err, rows) => {
        let urut = rows[id - 1];
        db.each(`UPDATE bread SET id=$1, string=$2, integer=$3, float=$4, date=$5, boolean=$6 WHERE id = ${id}`, [req.body.id, req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean], (err, rows) => {
        })
        res.redirect('/')
    })
});
app.listen(3000, () => {
    console.log('Web nyala');
})

// app.post('/add', (req, res) => {
//     data.push({
//         string: req.body.string,
//         integer: req.body.integer,
//         float: req.body.float,
//         date: req.body.date,
//         boolean: req.body.boolean
//     })

// })
/*CREATE TABLE bread (
id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
string TEXT NOT NULL,
integer INTEGER NOT NULL,
float float NOT NULL,
date date NOT NULL,
boolean TEXT NOT NULL
);

app.get('/', (req, res) => {
    const page = req.query.page;
    const limit = 3;
    const offset = (page - 1) * limit;
    db.all(`SELECT COUNT(*) as total FROM bread`, (err, response) => {
        let sql = `SELECT * FROM bread LIMIT ${limit} ORDER BY id OFFSET ${offset}`
        console.log(rows);
        const total = response.rows[0].total;
        const pages = Math.ceil(rows / limit);
        db.all(`SELECT * FROM bread LIMIT ${limit} ORDER BY id OFFSET ${offset}`, (err, rows) => {
            res.render('index', {
                data: response.rows, pagination: {
                    page, limit, offset, total, pages
                }
            })
        })
    })
})



<ul class="pagination">
        <li class="page-item<%= pagination.page == 1 ? ' disabled' : '' %>"><a class="page-link"
            href="/?page=<%= parseInt(pagination.page) - 1 %>" style="color:coral">Previous</a></li>
            <% for (let i = 1; i<= pagination.pages; i++){ %>}
        <li class="page-item<%= i == pagination.page ? ' active' : '' %>"><a class="page-link" style="color:coral" href="/?page=<%= i %>"> <%= i %></a></li>
        <% } %>
        <li class="page-item<%= pagination.page < pagination.pages ? ' disabled' : '' %>"><a class="page-link"
            href="/?page=<%= parseInt(pagination.page) + 1 %>" style="color:coral">Previous</a></li>
      </ul>
*/