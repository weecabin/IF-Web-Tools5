

/**
  This is a modified Node.js script
  utilizing my Node and FlightPlan classes to generate an XML flightplan and save it to a file.
  I was just trying to figure things out, so there was a lot of back and forth.
  I need to go back and look at error handling. 
*/

var ask = require ('./qryGoogle')
var askhttps = require('./httpsQuery')
var mx = require('./xmlFlightplan')
const readline = require('readline')
const strings = require('./strings')
const colors = require('colors/safe') 
const fs = require("fs")
const ff = require("./FlightFunctions")

colors.enable()

const print = (msg) => {
  console.log(msg)
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

var search = [
  ['airportnavfinder.com','/airport/'],
  ['skyvector.com','/airport/'],
  ['pilotnav.com','/airport/'],
  ];
  
var use =0;
var response="KSFO";
var latlon ="";
var legs="5";
var length="50";
var radius="50";
var loops="10";
var icao="KSAN";
rl.on('line', (line) => 
{
  var rsp = line.replace(/\0/g, '');
  //print("Entering response handler with: "+rsp)
  if (rsp.length>0)
    response=rsp; 
  //print("response = "+response);
  var cmd = rsp.toUpperCase().split("(")[0];
  var cmdErr=false;
  switch (cmd)
  {
    case "LATLON":
    print("Executing LATLON")
    icao = rsp.toUpperCase().replace(")","(").split("(")[1];
    askhttps.AskWeb(search[use][0],search[use][1]+icao,callback);
    break;
    
    case "HOLD1":
    print("Executing "+rsp)
    var str = rsp.replace("(",",").replace(")",",").split(",")
    icao = str[1]
    //print(icao+","+legs+","+length+","+loops)
    legs = str[2]
    length = str[3]
    loops = str[4]
    askhttps.AskWeb(search[use][0],search[use][1]+icao,holdcallback);
    break;
    
    case "HOLD2":
    print("Executing "+rsp)
    var str = rsp.replace("(",",").replace(")",",").split(",")
    icao = str[1]
    //print(icao+","+legs+","+length +","+loops)
    legs = str[2]
    radius = str[3]
    loops = str[4]
    askhttps.AskWeb(search[use][0],search[use][1]+icao,holdradiuscallback);
    break;
    
    case "HOLD3":
    print("Executing "+rsp)
    var str = rsp.replace("(",",").replace(")",",").split(",")
    var lat = str[1]
    var lon = str[2]
    legs = str[3]
    length = str[4]
    loops = str[5]
    print("Executing HoldPattern("+legs+","+length+","+lat+","+lon+","+loops+")")
    var  xmlfp = ff.HoldPattern(Number(legs),Number(length),Number(lat),Number(lon),Number(loops))
    //print(xmlfp)
    var filename = './flightplans/test.fpl';
    fs.writeFile(filename, xmlfp , function (err) {
      if (err) throw err;
      console.log(filename+ ' Replaced!');
      process.stdout.write("> ");
    });
    break;

    case "XML":
    print("Executing XML Test")
    var xml = new mx.Node("Root","","this=\"is an attribute\"")
    var l1 = xml.AddChild(new mx.Node("Level1","L1Value"))
    var l2 = l1.AddChild(new mx.Node("Level2","L2Value"))
    print(xml.ToXML())
    process.stdout.write("> ");
    break;
    
    case "FP":
    print("Executing FLIGHTPLAN")
    var fp = new mx.FlightPlan("KSAN")
    fp.AddUserFix("fix1",23.1234,-116.1234)
    fp.AddUserFix("fix2",24.1234,-117.1234)
    fp.AddUserFix("fix1",23.1234,-116.1234)
    fp.AddUserFix("fix2",24.1234,-117.1234)
    var xmlfp = fp.ToXml();
    print(xmlfp)
    process.stdout.write("> ");
    break;

    default:
    {
      print("Err: cmd not found")
      cmdErr = true;
    }
   
    }
  print("Exiting response handler")
  if (cmdErr)
    process.stdout.write("> ");
})

function Occurence(count,mainstr,substr)
{
  var offset=0;
  for (i=0;i<count;i++)
  {
    var n = mainstr.substring(offset).indexOf(substr);
    if (n>0)
    {
      offset+=n+substr.length;
    }
    else
    {
      print ("error");
      return -1
    }
    //print (offset);
    //print(mainstr.substring(offset)) 
  }
  //print ("returning "+offset)
  return offset;
}

function GetLatLong(xmlString)
{
    //print(str);
  var n = xmlString.indexOf("Lat/Lng");
  //print(n)
  //icao = "";
  if (n>0)
  {
    var sub = xmlString.substring(n,n+300)
    //print(sub);
    var n1 = Occurence(1,sub,"maps?ll=")
    var n2 = Occurence(1,sub,"&t=h");
    if (n1>0 && n2>0)
    {
      var start =n1+4;
      latlon = sub.substring(n1,n2-4);
      //print (response + " Lat/Long = "+latlon);
      return latlon;
    }
  }
  return ""
}

callback = function(str)
{
  let latlon = GetLatLong(str);
  if (latlon.length>0)
    print (response + " Lat/Long = "+latlon);
  else
    print("Not Found") 
    process.stdout.write("> ");
}

holdcallback = function(str)
{
  let latlon = GetLatLong(str);
  if (latlon.length==0)
  {
    print("Lat/Long not found");
    return
  }
  var splitlatlon = latlon.split(",")
  print("latlon="+latlon)
  let lat = splitlatlon[0]
  let lon = splitlatlon[1]
  print("Executing HoldPattern("+legs+","+length+","+lat+","+lon+","+loops+")")
  let  xmlfp = ff.HoldPattern(Number(legs),Number(length),Number(lat),Number(lon),Number(loops))
  //print(xmlfp)
  let fn = icao+" Hold "+legs+" "+length+".fpl"
  let filename = './flightplans/'+fn;
  fs.writeFile(filename, xmlfp , function (err) 
  {
    if (err) throw err;
    console.log(filename+ ' Replaced!');
    process.stdout.write("> ");
  });
 
}

holdradiuscallback = function(str)
{
  let latlon = GetLatLong(str);
  if (latlon.length==0)
  {
    print("Lat/Long not found");
    return
  }
  var splitlatlon = latlon.split(",")
  print("latlon="+latlon)
  let lat = splitlatlon[0]
  let lon = splitlatlon[1]
  let legangle = Math.PI*2/Number(legs);
  let len = 2*Math.sin(legangle/2)*radius;
  print("Executing HoldPattern("+legs+","+len+","+lat+","+lon+","+loops+")")
  let  xmlfp = ff.HoldPattern(Number(legs),len,Number(lat),Number(lon),Number(loops));
  //print(xmlfp)
  let fn = icao+" HoldRadius "+legs+" "+radius+".fpl"
  let filename = './flightplans/'+fn;
  fs.writeFile(filename, xmlfp , function (err) 
  {
    if (err) throw err;
    console.log(filename+ ' Replaced!');
    process.stdout.write("> ");
  });
}

//print(strings.help)
//print('')
process.stdout.write(strings.optionprompt)
