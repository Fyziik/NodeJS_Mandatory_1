const express = require('express')
const app = express()
const cors = require('cors')

const mongo =  require('mongodb')
const mongoClient = mongo.MongoClient
const url = "mongodb://localhost:27017/testDB"
let lightmode = true
let themeButtonText = "Darkmode"
let currentPage = ""

// Make imgs folder servable, and set view engine to ejs for partials & views to be able to render
app.use("/imgs", express.static(__dirname + '/imgs'))
app.use("/css", express.static(__dirname + '/css'))
app.use(express.json())
app.use(cors())
app.set('view engine', 'ejs')
const port = 8080

// mongoDB databased stored locally so I dont have to connect to the DB each time spending precious ressources
// this happens on startup and is then saved locally in the 'pagesDatabase' variable, then updated appropiately during runtime
let pagesDatabase
mongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("mandatoryDB");
    dbo.collection("pages").find({}).toArray(function(err, result) {
      if (err) throw err;
      pagesDatabase = result
      db.close();
    });
});

//For changing between light and dark mode
//OPTIMIZED
app.get("/changeTheme", (req, res) => {
    lightmode = !lightmode
    if (lightmode) {
        themeButtonText = "Darkmode"
    } else {
        themeButtonText = "Lightmode"
    }
    res.render('pages/index', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText})
})

//Index page serving
//OPTIMIZED
app.get("/", (req, res) => {
    res.render('pages/index', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText})
})

//Session page serving from various IDs
//This method will look through the pagesDatabase variable (holding all of the pages) and serve both the entire array of pages AND the specific page
//OPTIMIZED
app.get("/session/:title", (req, res) => {
    const title = req.params.title
    const allResults = pagesDatabase
    const result = pagesDatabase.filter(element => element.title === title)

    // allResults = all pages, result = single page looking for, mode = light or dark mode, themeButtonText = text on button depending on state
    res.render('pages/session', {result: allResults, pageContent: result, mode: lightmode, themeButtonText: themeButtonText})
    
})

//Page for new page creation
//OPTIMIZED
app.get("/addNewPage", (req, res) => {
    res.render('pages/sessionAdd', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText})
})

//POST for adding a new page
//OPTIMIZED
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
            //If no errors with mongoDB, insert into local db
            pagesDatabase.push(myObj)
        });
    }
})

//Delete collection of pages for a clean slate
//OPTIMIZED
app.delete("/pages", (req, res) => {

    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mandatoryDB");
        dbo.collection("pages").drop(function(err, delOK) {
          if (err) throw err;
          if (delOK) console.log("Collection deleted");
          db.close();
        });
        pagesDatabase.clear()
      }); 
})

//Delete collection of pages for a clean slate
//OPTIMIZED
app.delete("/pages/:title", (req, res) => {

    const title = req.params.title

    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mandatoryDB");
        dbo.collection('pages').deleteOne({ title: title });
        db.close
      });
      pagesDatabase = pagesDatabase.filter(element => element.title !== title)
})


app.listen(port, (error) => {
    if (error) {
        console.log("Error occured: " + error)
    } else {
        console.log("Server running on port " + port)
    }
})