const express = require('express')
const app = express()
const cors = require('cors')

const mongo =  require('mongodb')
const mongoClient = mongo.MongoClient
const url = "mongodb://localhost:27017/testDB"

// Make imgs folder servable, and set view engine to ejs for partials & views to be able to render
app.use("/imgs", express.static(__dirname + '/imgs'))
app.use(express.json())
app.use(cors())
app.set('view engine', 'ejs')


const port = 8080

//Index page serving
app.get("/", (req, res) => {
    res.render('pages/index')
})

//Session page serving from various IDs
app.get("/session/:id", (req, res) => {
    const pageId = req.params.id
    res.render('pages/session' + pageId)
})

//New page for creating new pages via form page
app.post("/newPage", (req, res) => {
    if (req.body.pageTitle !== "" && req.body.pageContent !== "") {

        mongoClient.connect(url, function(err, db){
            if (err) throw err;
            console.log("Database created!")
            let database = db.db("mandatoryDB")
            let myObj = { title: req.body.pageTitle, content: req.body.pageContent }
            database.collection("pages").insertOne(myObj, function(err, db){
                if (err) throw err;
                console.log("1 document inserted")
                db.close
            });
        })
    }
})

//Find specific page, currently just for inspecting data purposes
app.get("/pages", (req, res) => {

    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mandatoryDB");
        dbo.collection("pages").find({}).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          db.close();

          res.render("pages/testing", {result: result})

        });
      });
})

//Delete collection of pages for a clean slate
app.delete("/pages", (req, res) => {

    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mandatoryDB");
        dbo.collection("pages").drop(function(err, delOK) {
          if (err) throw err;
          if (delOK) console.log("Collection deleted");
          db.close();
        });
      }); 
})

app.listen(port, (error) => {
    if (error) {
        console.log("Error occured: " + error)
    } else {
        console.log("Server running on port " + port)
    }
})