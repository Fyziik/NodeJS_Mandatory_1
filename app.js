const express = require('express')
const app = express()

const port = 8080

//Index page serving
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

//Session page serving from various IDs
app.get("/session/:id", (req, res) => {
    res.sendFile(__dirname + "/session" + req.params.id + ".html")
})



app.listen(port, (error) => {
    if (error) {
        console.log("Error occured: " + error)
    } else {
        console.log("Server running on port " + port)
    }
})