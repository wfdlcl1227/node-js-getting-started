const express = require('express')
const path = require('path')
const jsSHA = require('jssha')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => handleGet(req, res))
  //.get('/', handleGet(req, res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))




function handleGet(req, res) {
  var token = "chris"; // replace it with your own toke
  var signature = req.query.signature,
    timestamp = req.query.timestamp,
    echostr = req.query.echostr,
    nonce = req.query.nonce;
  oriArray = new Array();
  oriArray[0] = nonce;
  oriArray[1] = timestamp;
  oriArray[2] = token;
  oriArray.sort();
  var original = oriArray.join('');
  var shaObj = new jsSHA("SHA-1", 'TEXT');
  shaObj.update(original);
  var scyptoString = shaObj.getHash('HEX');
  console.log("calculated string: " + scyptoString);
  if (signature == scyptoString) {
    res.send(echostr);
  } else {
    res.send('bad token');
  }
}