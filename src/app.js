const path = require('path')
const express = require('express')
const messagebird = require('messagebird')('Fox9jJABmPIJ0FrIKSmMJtNZR')
// const fs = require('fs').promises

const app = express()
const port = process.env.PORT || 8989

const basePath = path.join(__dirname, '../public')

app.use(express.static(basePath))

/* 
async function getLabels(folderName) {
    const storeFiles = await fs.readdir(folderName);
    return storeFiles
}

getLabels('./public/labeled_images')
 */

//start express server
app.listen(port, () => {
    console.log('Server started on port ' + port)
})
