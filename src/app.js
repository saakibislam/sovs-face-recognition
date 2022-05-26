const path = require('path')
const express = require('express')
const fs = require('fs').promises

const app = express()
const port = process.env.PORT || 8989

const basePath = path.join(__dirname, '../public')

app.use(express.static(basePath))

//start express server
app.listen(port, () => {
    console.log('Server started on port ' + port)
})