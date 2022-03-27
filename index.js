const express = require('express')
const path = require('path')
const jsSHA = require('jssha')
const PORT = process.env.PORT || 5000
const fs = require('fs')
const bodyParser = require('body-parser')
var http = require('http')
var url = require('url')
var util = require('util')
var querystring = require('querystring');



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
  var token = req.body.access_token;
  callWechatMassMessageAPI(token);
  res.send("success");
}


/*
function getWechatToken() {
    const url = `http://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`
    // 返回accesstoken格式如下
    // {
    //     "access_token":"string",
    //     "expires_in":7200
    // }
    return new Promise((resolve, reject) => {
        request(url, function(err, response, body){
            var accessToken = JSON.parse(response.body)
            accessToken['expires_in'] = Date.parse(new Date())+((7200 - 20)*1000)
            fs.writeFileSync(path.resolve(__dirname, './token.txt') , JSON.stringify(accessToken))
            resolve(accessToken.access_token)
        })
    })
}*/


function callWechatMassMessageAPI(token) {
  var options = {
    host: 'api.weixin.qq.com',
    path:'/cgi-bin/message/mass/send?access_token=55_sY3zol29qXeV4zf9KVsCYcyrlRKVVZfOBXgPz394lAWiT2NTFtM-etXgGrulZK267Otxpk5d15rqz11bEMe4wGxt8fF5u7hpVVo27nhErN-ATWux62xvqB11pBGzJVGO-9IWLddiD6M8Ea3mFCDbAJAPMN',
    method: 'POST'
  };

  var reqBody = {
    "touser": [
      "oPZRb5rSlSMKCa1BQleoeLhQmlhA",
      "oPZRb5mVyPAWZEVdvfFqarxHs85k"
    ],
    "msgtype": "text",
    "text": {
      "content": "hello from test."
    }
  }

  var post_data = querystring.stringify(reqBody);



  var req = http.request(options, function (res) {
    console.log('STATUS: ' + res.statusMessage);
    console.log('HEADERS: ' + JSON.stringify(reqBody));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  // write data to request body
  req.write(post_data + "\n");
  req.end();



}