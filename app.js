const express = require('express')
const app = express()
const cors = require('cors')

const mongo =  require('mongodb')
const mongoClient = mongo.MongoClient
const url = "mongodb://localhost:27017/testDB"
let lightmode = true

// Make imgs folder servable, and set view engine to ejs for partials & views to be able to render
app.use("/imgs", express.static(__dirname + '/imgs'))
app.use("/css", express.static(__dirname + '/css'))
app.use(express.json())
app.use(cors())
app.set('view engine', 'ejs')
const port = 8080


//For changing between light and dark mode
app.get("/changeTheme", (req, res) => {
    lightmode = !lightmode
    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mandatoryDB");
        dbo.collection("pages").find({}).toArray(function(err, result) {
          if (err) throw err;
          db.close();

          res.render('pages/index', {result: result, mode: lightmode})

        });
      });
    
})

//Index page serving
app.get("/", (req, res) => {
    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mandatoryDB");
        dbo.collection("pages").find({}).toArray(function(err, result) {
          if (err) throw err;
          db.close();

          res.render('pages/index', {result: result, mode: lightmode})

        });
      });
    
})

//Session page serving from various IDs
app.get("/session/:title", (req, res) => {
    const title = req.params.title
    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mandatoryDB");
        dbo.collection("pages").find({title: title}).toArray(function(err, result) {
            if (err) throw err;
            dbo.collection("pages").find({}).toArray(function(err, allResults) {
                if (err) throw err;
                db.close();

                res.render('pages/session', {result: allResults, pageContent: result, mode: lightmode})
            })
        });
      });
    
})

//Page for new page creation
app.get("/addNewPage", (req, res) => {
    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mandatoryDB");
        dbo.collection("pages").find({}).toArray(function(err, result) {
          if (err) throw err;
          db.close();

          res.render('pages/sessionAdd', {result: result, mode: lightmode})

        });
      });
})

//POST for adding a new page
//TODO Make title property in DB unique, so there wont be duplicate sites
app.post("/newPage", (req, res) => {
    if (req.body.pageTitle !== "" && req.body.pageContent !== "") {

        let title = req.body.pageTitle
        title = title.substr(0, 7) + title.substr(8, title.length)
        let titleRendered = req.body.pageTitle

        mongoClient.connect(url, function(err, db){
            if (err) throw err;
            const dbo = db.db("mandatoryDB");
            let myObj = { title: title, titleRendered: titleRendered, content: req.body.pageContent, tags: req.body.pageTags }

            dbo.collection("pages").insertOne(myObj, function(err, db){
                if (err) res.redirect('/');
                db.close;
            });
        });
    }
})

//Delete collection of pages for a clean slate
app.delete("/pages", (req, res) => {

    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mandatoryDB");
        dbo.collection("pages").drop(function(err, delOK) {
          if (err) throw err;
          if (delOK) console.log("Collection deleted");
          db.close();
        });
      }); 
})

//Delete collection of pages for a clean slate
app.delete("/pages/:title", (req, res) => {

    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mandatoryDB");
        dbo.collection('pages').deleteOne({ title: req.params.title });
        db.close
      }); 
    
})


app.listen(port, (error) => {
    if (error) {
        console.log("Error occured: " + error)
    } else {
        console.log("Server running on port " + port)
    }
})