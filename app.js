const express = require('express');
const icsToJson = require('./icsToJson')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// set port, listen for requests
const PORT = 8000;
app.listen(PORT, () => {
});



/*
---------------------- sample use
http://localhost:8000/https://www.xul.fr/rss.xml

http://localhost:8000/https://gorest.co.in/public/v2/users

http://localhost:8000/http://agents.baliluxuryvillas.com/api/api.php?MOD=462&AGENT=OWNER_KENT_552_1370&VILLA=1370&NAME=FRANGIPANI

*/
app.use('/', async (req, res) => {
    let requestUrl = req.originalUrl.trim()
    let toUrl = requestUrl.charAt(0) == '/' ? requestUrl.replace('/', '') : requestUrl
    if (toUrl.length > 0 && toUrl != 'favicon.ico') {
        try {
            const response = await fetch(toUrl)
            const urlText = await response.text()
            let data = ''
            res.set('Content-Type', 'application/json');
            if (response.headers.get("content-type").toLowerCase().includes('calendar')) {
                // Convert ics to json 
                data = icsToJson(urlText)
            } else if (response.headers.get("content-type").toLowerCase().includes('xml')) {
                // set xml headers
                res.set('Content-Type', 'text/xml');
                data = urlText
            }
            else
                data = urlText
            res.status(response.status).send(data);
        }
        catch (err) {
            res.status(500).send({ message: 'Url not valid', error: err })
        }
    }
    else
        res.status(404).send({ message: 'Url not entered' })
});
