import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

const pool = mysql.createPool({
    host: "nwhazdrp7hdpd4a4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "qqv6hy4j7rbddqyl",
    password: "aad3igcuqf1bev1c",
    database: "knpq9kqfuqvfgfvz",
    connectionLimit: 10,
    waitForConnections: true
});

app.get('/', async (req, res) => {
    let sql = `SELECT authorId, firstName, lastName
              FROM authors
              ORDER BY lastName`;
    const [authors] = await pool.query(sql);
    let sql2 = `SELECT DISTINCT category FROM quotes ORDER BY category`;
    const [categories] = await pool.query(sql2);
    res.render('home.ejs', {authors, categories})
});


//API to get the author information based on an author Id
app.get('/api/author/:author_Id', async (req, res) => {
    console.log(req);
    let authorId = req.params.author_Id
    let sql = `SELECT *
              FROM authors
              WHERE authorId = ?`;
    const [authorInfo] = await pool.query(sql,[authorId]);
    res.send(authorInfo);//displays info in JSON format
});

// app.get('/api/author/:authorId', async (req, res) => {
//     let authorId = req.params.authorId
//     let sql = `SELECT * FROM authors WHERE authorId = ?`;
//    const [authorInfo] = await pool.query(sql,[authorId]);
//    // res.render('home.ejs', {authors})
//     res.send(authorInfo);
// });

app.get('/searchByAuthor', async (req, res) => {
    let authorId = req.query.authorId;
    let sql = `SELECT quote, firstName, lastName
              FROM quotes
              NATURAL JOIN authors
              WHERE authorId = ?`;
    const [rows] = await pool.query(sql,[authorId]);
    res.render('quotes.ejs', {rows})
});
app.get('/searchByCategory', async (req, res) => {
    let category = req.query.category;
    let sql = `SELECT quote, firstName, lastName, authorId
              FROM quotes
              NATURAL JOIN authors
              WHERE category = ?`;
    const [rows] = await pool.query(sql,[category]);
    res.render('quotes.ejs', {rows})
});
app.get('/searchByLikes', async (req, res) => {
    let min = req.query.min;
    let max = req.query.max;
    let sql = `SELECT quote, firstName, lastName, authorId
              FROM quotes
              NATURAL JOIN authors
              WHERE Likes BETWEEN ? AND ?`;
    const [rows] = await pool.query(sql,[min,max]);
    res.render('quotes.ejs', {rows})
});
//Searching quotes by keyword
//NEVER have user input within the SQL statement!!
app.get("/searchByKeyword", async(req, res) => {
    try {
        //console.log(req);
        let keyword = req.query.keyword;
        let sql = `SELECT quote, firstName, lastName, authorId
                   FROM quotes
                   NATURAL JOIN authors
                   WHERE quote LIKE ? `;
        let sqlParams = [`%${keyword}%`];
        const [rows] = await pool.query(sql, sqlParams);
        res.render("quotes.ejs", {rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

// app.get('/searchByAuthor', async (req, res) => {
//    let authorId = req.query.authorId;
//    let sql = `SELECT quote, firstName, lastName
//               FROM quotes
//               NATURAL JOIN authors
//               WHERE authorId = ?`;
//    const [rows] = await pool.query(sql, [authorId]);
//    res.render('quotes.ejs', {rows})
// });

// let authorId = req.query.authorId;
// let sql = `SELECT quote, firstName, lastName
//               FROM quotes
//               NATURAL JOIN authors
//               WHERE authorId = ?`;
// const [rows] = await pool.query(sql, [authorId]);
// res.render('quotes.ejs', {rows})

// app.get("/searchByKeyword", async(req, res) => {
//    try {
//         //console.log(req);
//         let keyword = req.query.keyword;
//         let sql = `SELECT quote, firstName, lastName,authorId
//                    FROM quotes
//                    NATURAL JOIN authors
//                    WHERE quote LIKE ? `;
//         let sqlParams = [`%${keyword}%`];
//         const [rows] = await pool.query(sql, sqlParams);
//         res.render("quotes.ejs", {rows});
//     } catch (err) {
//         console.error("Database error:", err);
//         res.status(500).send("Database error!");
//     }
// });


app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})