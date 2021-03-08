const express = require('express')
const app = express()


app.use("/imgs", express.static(__dirname + '/imgs'))
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



app.listen(port, (error) => {
    if (error) {
        console.log("Error occured: " + error)
    } else {
        console.log("Server running on port " + port)
    }
})