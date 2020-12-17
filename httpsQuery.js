var https = require('https');

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
  host: '',
  path: ''
};

callback = function(response) {
  var str = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () 
  {
    //console.log(str);
    //console.log("response.on")
    askCB(str);
   
  });
}
var askCB = function(str){};
function AskWeb(host,askString,askCallback)
{
  //console.log("In https.AskWeb")
  options.host = host;
  options.path = askString;
  https.request(options, callback).end();
  askCB=askCallback;
}

module.exports.AskWeb=AskWeb;