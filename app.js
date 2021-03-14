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
mongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("mandatoryDB");
    dbo.collection("pages").find({}).toArray(function(err, result) {
      if (err) throw err;
      pagesDatabase = result
      db.close();
    });
});

mongoClient.connect(url, function(err, db) {
  if (err) throw err;
  const dbo = db.db("mandatoryDB");
  dbo.collection("users").find({}).toArray(function(err, result) {
    if (err) throw err;
    usersDatabase = result
    db.close();
  });
});



//This is only for other people if their database is empty, then this will load a local "default" database with some of the session pages I've created earlier
app.get("/loadDatabase", (req, res) => {
    pagesDatabase = [
        {
          _id: '604a2e605fdb051eb4c4d792',
          title: 'Session 1',
          titleData: 'Session1',
          content: '<h2>What is Node.js</h2>\n' +
            '          <p>\n' +
            '            Before talking about Node.js, we have to talk about Javascript. \n' +
            '            Javascript is a programming language used for front-end / client-side computing, \n' +
            '            but some people thought it would be nice if you could separate the workload, so that client-side and \n' +
            '            server-side could work side by side, instead of only the client-side. Therefore Node.js was created, \n' +
            '            making it possible to run Javascript in a stand-alone machine. Therefore Node.js is a Runtime Environment, \n' +
            '            not a programming language or a framework in itself. Together with an HTTP module, \n' +
            '            it makes it possible to connect this server-side processing with the front-end. \n' +
            '            This is bounded with the Express framework (and an endless amount of other frameworks via NPM) \n' +
            '            we can easily create applications as needed.\n' +
            '          </p>\n' +
            '        </div>\n' +
            '        \n' +
            '        <div class="sessionContent">\n' +
            '          <h2>Setup of server using Node.js</h2>\n' +
            '          <ol>\n' +
            '            <li>Create a folder for the project</li>\n' +
            '            <li>Add a new file, and call it package.json and add {} inside it for it to be valid JSON</li>\n' +
            '            <li>Run <em>“npm install”</em> in the terminal</li>\n' +
            '            <li>Run <em>“npm install express”</em> in the terminal to install Express dependency</li>\n' +
            '            <li>Create entry file (app.js)</li>\n' +
            '            <li>Add imports (require keyword) to top of the file for Express</li>\n' +
            '            <li>app.listen(port) added to the bottom of the file</li>\n' +
            '            <strong>Optional</strong>\n' +
            '            <li>Add necessary routes from the app.get method, here is a template</li>\n' +
            '            <!-- TODO make images work -->\n' +
            '            <img src="/imgs/getRouteExample.PNG" alt="Example of get route">\n' +
            '          </ol>\n' +
            '        </div>\n' +
            '\n' +
            '        <div class="sessionContent">\n' +
            '          <h2>Execution of Node.js server</h2>\n' +
            '          <ul>\n' +
            '            <li>First of all, make sure that Node.js is installed on the machine.</li>\n' +
            '            <li>cd into the root directory (not a necessity but will make the process easier), \n' +
            '              and run <em>“node [filename]”</em> in the terminal. These have to be .js files.</li>\n' +
            '          </ul>\n' +
            '        </div>',
          tags: [
            'What is Node.js',
            'Setup of server using Node.js',
            'Execution of Node.js server'
          ]
        },
        {
          _id: '604a2fcc5fdb051eb4c4d793',
          title: 'Session 2',
          titleData: 'Session2',
          content: '<h1>APIs <button type="button" class="btn btn-primary" id="APIButton">Show</button></h1>\n' +
            '        \n' +
            '        <div id="APISection" class="contentSection" hidden>\n' +
            '          <div class="sessionContent">\n' +
            "            <h2>What's a RESTful API</h2>\n" +
            '            <p>An RESTful API is an API which follows the principles of REST, which consists of:</p>\n' +
            "            <!-- TODO insert picture 'RESTfulAPICheclist.png' -->\n" +
            '            <img src="/imgs/RESTfulAPIChecklist.PNG" alt="">\n' +
            '          </div>\n' +
            '  \n' +
            '          <div class="sessionContent">\n' +
            '            <h2>RESTful APIs philosophy</h2>\n' +
            "            <!-- TODO insert picture 'APIPhilosophy.png' -->\n" +
            '            <img src="/imgs/APIPhilosophy.PNG" alt="">\n' +
            '            <p>Basically, a RESTful API should have endpoints of which makes sense, for instance, \n' +
            '              if we hit /users with a HTTP GET, we’d expect to retrieve a list of users. \n' +
            '              Or if we hit /users/id with a HTTP DELETE, we’d expect to be able to delete a specific user by an id.</p>\n' +
            '          </div>\n' +
            '  \n' +
            '          <div class="sessionContent">\n' +
            '            <h2>How to design a fully CRUD RESTful API</h2>\n' +
            '            <!-- TODO insert picture APIDesign.png -->\n' +
            '            <img src="/imgs/APIDesign.png" alt="">\n' +
            '            <p>We can use an excel spreadsheet or any textual editor for the creation of the endpoints for a RESTful API. \n' +
            '              Here we can see what the different endpoints would result in, for instance would the endpoint /users \n' +
            '              as a HTTP GET retrieve a list of all the users.</p>\n' +
            '          </div>\n' +
            '        </div>\n' +
            '        \n' +
            '\n' +
            '        <h1>Functions <button type="button" class="btn btn-primary" id="FunctionsButton">Show</button></h1>\n' +
            '\n' +
            '        <div id="FunctionsSection" class="contentSection" hidden>\n' +
            '          <div class="sessionContent">\n' +
            '            <h2>Hoisting</h2>\n' +
            '            <p>\n' +
            '              Javascript "loads" the entire file before executing, which means you can call functions early in the file, \n' +
            `              even though they're not defined at that point, so it sorta "understands the future", I suppose. \n` +
            "              Only works on specific keywords, such as function. Won't work on const or let etc.\n" +
            '            </p>\n' +
            '          </div>\n' +
            '          \n' +
            '          <div class="sessionContent">\n' +
            '            <h2>Regular function</h2>\n' +
            '            <img src="/imgs/regularFunction.png" alt="">\n' +
            '          </div>\n' +
            '\n' +
            '          <div class="sessionContent">\n' +
            '            <h2>Variable function / Anonymous function</h2>\n' +
            '            <img src="/imgs/anonymousFunction.png" alt="">\n' +
            '          </div>\n' +
            '\n' +
            '          <div class="sessionContent">\n' +
            '            <h2>Arrow function</h2>\n' +
            '            <img src="/imgs/arrowFunction.png" alt="">\n' +
            '          </div>\n' +
            '\n' +
            '          <div class="sessionContent">\n' +
            '            <h2>Callback function</h2>\n' +
            '            <img src="/imgs/callbackFunction.png" alt="">\n' +
            '          </div>\n' +
            '        </div>\n' +
            '        \n' +
            '\n' +
            '      </div>\n' +
            '    </div>\n' +
            '</div>\n' +
            '\n' +
            '<!-- Have to include Jquery link here, and not in footer, since Jquery has to be loaded before assigning $ values \n' +
            '     Could fix this by making an "end.ejs" file with only the body & html end tags, and a seperate .ejs file\n' +
            '     for script insertions -->\n' +
            '<script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>\n' +
            '\n' +
            '<script>\n' +
            '  $(function() {\n' +
            '\n' +
            '    let APIHidden = true\n' +
            '    let FunctionsHidden = true\n' +
            '\n' +
            '    $("#APIButton").click(function() {\n' +
            '      if (APIHidden) {\n' +
            '        // Toggle hidden class and make visible, then change button text\n' +
            `        $("#APISection").removeAttr('hidden')\n` +
            '        $("#APIButton").text("Hide")\n' +
            '      } else { //Else give it the hidden attribute and change button text\n' +
            `        $("#APISection").attr('hidden', true)\n` +
            '        $("#APIButton").text("Show")\n' +
            '      }\n' +
            '      //Toggle boolean of hidden to the opposite\n' +
            '      APIHidden = !APIHidden\n' +
            '    })\n' +
            '\n' +
            '    $("#FunctionsButton").click(function() {\n' +
            '      if (FunctionsHidden) {\n' +
            `        $("#FunctionsSection").removeAttr('hidden')\n` +
            '        $("#FunctionsButton").text("Hide")\n' +
            '      } else {\n' +
            `        $("#FunctionsSection").attr('hidden', true)\n` +
            '        $("#FunctionsButton").text("Show")\n' +
            '      }\n' +
            '      FunctionsHidden = !FunctionsHidden\n' +
            '    })\n' +
            '\n' +
            '  })\n' +
            ' \n' +
            '</script>',
          tags: [ 'APIs', 'Functions' ]
        },
        {
          _id: '604a30005fdb051eb4c4d794',
          title: 'Session 3',
          titleData: 'Session3',
          content: '<div class="sessionContent">\n' +
            '          <h2>Theory about variables (var vs let & const)</h2>\n' +
            '          <p>\n' +
            '            Var outdated because it caused errors since it was a variable that had global access, \n' +
            '            so major programs and having vars would result in major errors. Therefore we now use let & const. \n' +
            '            Let is mutable and can be changed throughout its lifespan, but a const is immutable, and can not be changed once assigned.\n' +
            '          </p>\n' +
            '        </div>\n' +
            '\n' +
            '        <div class="sessionContent">\n' +
            '          <h2>Type Coercion</h2>\n' +
            '          <p>\n' +
            '            When programming in Javascript, you have to know the difference between == and ===.\n' +
            '            When using double == we’re comparing the values of whatever is on the sides of the equal signs. \n' +
            '            For instance, when comparing the string “5” and the number 5 i.e: <br>\n' +
            '            <img src="/imgs/TypeCoercion1.PNG" alt="" class="centerImage"> <br>\n' +
            '            This will evaluate to true, because the actual value inside each is 5, \n' +
            "            but in programs it's risky to have this kind of loose evaluation, therefore we’d like to \n" +
            '            compare both to value AND to the data type, so we make sure that they’re actually the same. \n' +
            '            Therefore we use triple equal signs “===” to both compare by value & data type. <br>\n' +
            '            <img src="/imgs/TypeCoercion2.PNG" alt="" class="centerImage"> <br>\n' +
            "            Now this will evaluate to false, even though we didn't change anything BUT add another equal sign. \n" +
            '            Using triple equals sign is the right way to program with Javascript, since both the programmer \n' +
            '            and the computer should be able to tell data types apart, and using === makes sure \n' +
            '            both you and the computer do exactly that.\n' +
            '          </p>\n' +
            '        </div>\n' +
            '\n' +
            '        <div class="sessionContent">\n' +
            '          <h2>NPM (Node Package Manager)</h2>\n' +
            '          <p>\n' +
            '            NPM er hvad Node.js anvender som package manager, og bruges til at hente og installere dependencies \n' +
            '            til pakker man godt vil anvende i ens kode. Såsom når vi indtaster <em>“npm install express”</em> i terminalen, \n' +
            '            dermed henter NPM de nødvendige filer indenfor Express frameworket som vi har behov for, for at \n' +
            '            kunne anvende Express i vores projekt.\n' +
            '          </p>\n' +
            '        </div>\n' +
            '\n' +
            '        <div class="sessionContent">\n' +
            '          <h2>Nodemon</h2>\n' +
            '          <p>\n' +
            '            Nodemon is a build tool we install, and makes it automatic to shutdown and setup the listening server, \n' +
            `            so that we don't have to do it ourselves. Nodemon is activated in the terminal by typing <em>"nodemon [file]"</em>\n` +
            '          </p>\n' +
            '        </div>',
          tags: [
            'Theory about variables',
            'Type Coercion',
            'NPM (Node Package Manager)',
            'Nodemon'
          ]
        },
        {
          _id: '604a302a5fdb051eb4c4d795',
          title: 'Session 4',
          titleData: 'Session4',
          content: '<div class="sessionContent">\n' +
            '          <h2>Functional Loops</h2>\n' +
            '          <p>\n' +
            '            <img src="/imgs/FunctionalLoops.PNG" alt=""> <br>\n' +
            '            In this example we use the .map() method, where we console log each element inside the map. \n' +
            '            So it’s sort of a minimized for each loop. \n' +
            '          </p>\n' +
            '        </div>\n' +
            '\n' +
            '        <div class="sessionContent">\n' +
            '          <h2>URL Anatomy</h2>\n' +
            '          <p>\n' +
            '            <img src="/imgs/URLAnatomy.PNG" alt="" class="centerImage">\n' +
            '            <img src="/imgs/URLExample.PNG" alt="" class="centerImage">\n' +
            '            This GET method will for instance be able to tell specifics about the URL, \n' +
            '            even though our URL can be completely randomized (sorta). :id and :title tells us \n' +
            '            that we should expect any value at these parts of the URL, though these values should make \n' +
            "            sense in a context of what's beforehand in the URL. For instance if we’re hitting the \n" +
            '            endpoint /users/:id we would expect id to be a number, or if the endpoint was /users/:name \n' +
            '            we should expect a string, because the scenario is (most likely) a search in the users via a name\n' +
            '          </p>\n' +
            '        </div>\n' +
            '\n' +
            '        <div class="sessionContent">\n' +
            '          <h2>Receiving data in Express</h2>\n' +
            '          <p>\n' +
            '            With the Express framework we can fast and efficiently create methods in our app.js file \n' +
            '            for receiving various POST calls, these are written, for instance\n' +
            '            <img src="/imgs/ExpressDataReceiving.PNG" alt="" class="centerImage">\n' +
            '            Here we are ready to receive data at endpoint /whatever, where we expect to receive some sort of \n' +
            '            data packed into the req variable of the method. In this case we just respond with the JSON object, as a JSON object. <br>\n' +
            '            <img src="/imgs/ExpressPostmanExample.PNG" alt="" id="postmanExample"> <br>\n' +
            "            Here we send the POST call through Postman (since we don't have a form for our site)\n" +
            '            <ol>\n' +
            '              <li>First we click “Body”.</li>\n' +
            '              <li>Then we click “raw”.</li>\n' +
            '              <li>Then change the format to JSON.</li>\n' +
            '              <li>Next we write our JSON object, the keys have to be within quotation marks.</li>\n' +
            '              <li>Click send.</li>\n' +
            '              <li>Lastly we can see the response from the server, which in our case was the object we sent to the server in the first case.</li>\n' +
            '            </ol>\n' +
            '          </p>\n' +
            '        </div>',
          tags: [ 'Functional Loops', 'URL Anatomy', 'Receiving data in Express' ]
        },
        {
          _id: '604a30375fdb051eb4c4d796',
          title: 'Session 5',
          titleData: 'Session5',
          content: '  <div class="sessionContent">\n' +
            '          <h2>How to serve .html files</h2>\n' +
            '          <p>\n' +
            '            Html files are always stored inside a folder called ‘public’ when working with Node.js. \n' +
            '            Therefore we create a folder called ‘public’ inside of the root folder. In this public folder we create .html files \n' +
            '            for various paths and serving. After this is done, we can make a path inside our app.js file \n' +
            '            for serving the necessary .html file, in this case the welcome.html file.\n' +
            '            <img src="/imgs/serveHtml.PNG" alt="" class="centerImage">\n' +
            '            Visual Studio Code can also create a HTML boilerplate for us, just make a new .html file \n' +
            '            and type html, then select html 5, and thus we have a boilerplate.\n' +
            '          </p>\n' +
            '        </div>',
          tags: [ 'How to serve .html files' ]
        }
      ]
      res.redirect("/")
})

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
      const emptyObj = {
        title: "",
        content: ""
      }

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

          const result = pagesDatabase.filter(element => element.title === req.body.pageTitle)

          //If already in DB, update it instead
          if (result !== undefined) {

            //Update locally
            pagesDatabase = pagesDatabase.map(page => {
              if (page.title === editPageOldTitle) {
                  const pageToReturn = {...myObj}
                  return {pageToReturn}
              }
              return page
          })
            
            //Update mongoDB
            let myQuery = { title : editPageOldTitle }
            let newValues = { $set: {
              title : req.body.pageTitle,
              titleData : titleData,
              content : req.body.pageContent,
              tags : ["TMP"]
            }}

            console.log(myQuery)
            console.log(newValues)

            dbo.collection("pages").updateOne(myQuery, newValues, (err, res) => {
              if (err) throw err;
              console.log("1 document updated")
              db.close
            })
            
            
          }

          //Else insert brand new document
          else {
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

          res.render('pages/index', {result: pagesDatabase, mode: lightmode, themeButtonText: themeButtonText, loggedIn: loggedIn})

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