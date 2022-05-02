const express = require('express')
const path = require('path')
const jsSHA = require('jssha')
const PORT = process.env.PORT || 5000
const fs = require('fs')
const bodyParser = require('body-parser')
//var http = require('http')
var url = require('url')
var util = require('util')
//var querystring = require('querystring')
var request = require('request')


var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => calculateWechatSign(req, res));
app.get('/index', (req, res) => res.render('pages/index'));
app.post('/msg', (req, res) => sendMessage(req, res));
//app.post('/', (req, res) => handleGet(req, res));

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));


function calculateWechatSign(req, res) {
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

function sendMessage(req, res) {
  //var body = req.body;
  console.log(req.body);

  body =   {
    "touser": [
      "oPZRb5rSlSMKCa1BQleoeLhQmlhA",
      "oPZRb5mVyPAWZEVdvfFqarxHs85k"
    ],
    "msgtype": "text",
    "text": {
      "content": "hello from test vs code."
    }};

  getWechatToken().then(data=>{callWechatMassMessageAPI(data, body)}).then(function() {
    res.send("success");
  })
}



function getWechatToken() {
  let url = 'http://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx79cbf5ebff286203&secret=47c44be9e62db3d8102ad1a138834bc7';
  // 返回accesstoken格式如下
  // {
  //     "access_token":"string",
  //     "expires_in":7200
  // }
  return new Promise((resolve, reject) => {
    request(url, function (err, response, body) {
      var accessToken = JSON.parse(response.body);
      
      accessToken['expires_in'] = Date.parse(new Date()) + ((7200 - 20) * 1000);
      fs.writeFileSync(path.resolve(__dirname, './token.txt'), JSON.stringify(accessToken));
      resolve(accessToken.access_token);
    })
  })
}


function callWechatMassMessageAPI(token, reqBody) {
  console.log('token==>'+ token);
  /*群發API*/
  /*
  {
    "touser": [
      "oPZRb5rSlSMKCa1BQleoeLhQmlhA",
      "oPZRb5mVyPAWZEVdvfFqarxHs85k"
    ],
    "msgtype": "text",
    "text": {
      "content": "hello from test vs code."
    }
  }*/
  //let url = 'https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token=' + token;
  


  //客服單條
  
  let url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + token;

  return new Promise((resolve, reject) => {
    request({
      url: url,
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: reqBody
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('resp' + JSON.stringify(response.body));
        resolve(response.body);
      } else {
        console.log('errorMsg' + response.statusMessage);
        console.log('errorCode' + response.statusCode);
        reject(response.statusMessage);
      }
    })
  })
}