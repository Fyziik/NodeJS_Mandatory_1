const express = require('express')
const app = express()
const cors = require('cors')
const {spawn} = require('child_process')

const mongo =  require('mongodb')
const mongoClient = mongo.MongoClient
const dbUsername = process.env.DB_USERNAME
const dbPassword = process.env.DB_PASSWORD
const url = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.vxa4u.mongodb.net/Cluster0?retryWrites=true&w=majority`
let lightmode = true
let themeButtonText = "Darkmode"
let pythonResponse = 0

let loggedIn = false
let loggedInUsername

let editPageOldTitle;

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
let usersDatabase

getPagesMongoDB()
getUsersMongoDB()

function getPagesMongoDB() {
  mongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("mandatoryDB");
    dbo.collection("pages").find({}).toArray(function(err, result) {
      if (err) throw err;
      pagesDatabase = result
      db.close();
    });
  });
}

function getUsersMongoDB() {
  mongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("mandatoryDB");
    dbo.collection("users").find({}).toArray(function(err, result) {
      if (err) throw err;
      usersDatabase = result
      db.close();
    });
  });
}


//For changing between light and dark mode
app.get("/changeTheme", (req, res) => {
    lightmode = !lightmode
    if (lightmode) {
        themeButtonText = "Darkmode"
    } else {
        themeButtonText = "Lightmode"
    }
    res.render('pages/index', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, loggedIn: loggedIn})
})

//Index page serving
app.get("/", (req, res) => {
    res.render('pages/index', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, loggedIn: loggedIn})
})

//Session page serving from various IDs
app.get("/pages/:title", (req, res) => {
    const title = req.params.title
    const allResults = pagesDatabase
    const result = pagesDatabase.filter(element => element.title === title)

    // allResults = all pages, result = single page looking for, mode = light or dark mode, themeButtonText = text on button depending on state
    res.render('pages/session', {result: allResults, pageContent: result, mode: lightmode, themeButtonText: themeButtonText, loggedIn: loggedIn})
})

//Session editing
app.get("/edit/:title", (req, res) => {
  const title = req.params.title
  console.log(title)
  editPageOldTitle = title

  //Find page for insertion into the editor for easier use
  const result = pagesDatabase.filter(element => element.title === title)

  if (loggedIn) {
    res.render('pages/sessionAdd', {resultToInsert: result, result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, loggedIn: loggedIn})
  } 
  res.redirect('/')

})

//Page for new page creation
app.get("/addNewPage", (req, res) => {
    if (loggedIn) {
      const emptyObj = [{
        title: "",
        content: ""
      }]

      res.render('pages/sessionAdd', {resultToInsert: emptyObj, result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, loggedIn: loggedIn})
    }
    res.redirect('/')
})

//POST for adding a new page
app.post("/pages", (req, res) => {
  if (req.body.pageTitle !== "" && req.body.pageContent !== "") {

    titleData = req.body.pageTitle.replace(/\s/g, '');

      mongoClient.connect(url, function(err, db){
          if (err) throw err;
          const dbo = db.db("mandatoryDB");
          let myObj = { title: req.body.pageTitle, titleData: titleData, content: req.body.pageContent, tags: req.body.pageTags }

          const result = pagesDatabase.filter(element => element.title === editPageOldTitle)

          //If already in DB, update it instead
          console.log(result.length)
          if (result.length !== 0) {

            //Update mongoDB
            let myQuery = { title : editPageOldTitle }
            let newValues = { $set: {
              title : req.body.pageTitle,
              titleData : titleData,
              content : req.body.pageContent,
              tags : req.body.pageTags
            }}

            dbo.collection("pages").updateOne(myQuery, newValues, (err, res) => {
              if (err) throw err;
              console.log("1 document updated")
              db.close
            })

            //Update locally
            getPagesMongoDB()
            
          } else { //Else insert brand new document

            dbo.collection("pages").insertOne(myObj, function(err, db){
              if (err) {
                console.log(err); 
                res.redirect('/');
              } 
              else {
                //If no errors with mongoDB, insert into local db
                pagesDatabase.push(myObj)
                db.close
              }
            });
          }


      });
  }
})

app.get("/login", (req, res) => {
  res.render('pages/login', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, loggedIn: loggedIn})
})

//Post for login
app.post("/login", (req, res) => {
  const inputUsername = req.body.username
  const inputPassword = req.body.password

  usersDatabase.forEach(element => {
    if (element.username === inputUsername && element.password === inputPassword) {
       loggedInUsername = element.username
       loggedIn = true
    }
  });
  res.redirect('/')
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
        pagesDatabase.clear()
      }); 
})

//Delete single page via title
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

//Retrieve Python calculator page
app.get("/python", (req, res) => {
  res.render('pages/python', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, pythonResponse: pythonResponse, loggedIn: loggedIn})
})

//Retrieve game page
app.get("/game", (req, res) => {
  res.render('pages/game', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText})
})

//Post request with the inserted values at the python page, this connects with the python script, runs it, and the value is returned to the python page in the result box
app.post("/python", (req, res) => {

  const toCalculate = [
    'test.py',
    req.body.base,
    req.body.pow
  ]

  console.log(typeof req.body.base)
  console.log(typeof req.body.pow)

  if (req.body.base === '9' && req.body.pow === '3') {
    pythonResponse = "I Love You"
    res.render('pages/python', { result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, pythonResponse: pythonResponse })
  }
  else {
    const python = spawn('python', toCalculate)

    python.stdout.on('data', function(data) {
      pythonResponse = Number(data.toString())

      res.render('pages/python', { result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, pythonResponse: pythonResponse })
    })

    python.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`)
    })
  }
})

app.get("/tmp", (req, res) => {
  res.render('pages/tmp', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, loggedIn: loggedIn})
})

app.listen(process.env.PORT || port, (error) => {
    if (error) {
        console.log("Error occured: " + error)
    } else {
        console.log("Server running on port " + port)
    }
})