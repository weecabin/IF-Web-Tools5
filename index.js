

/**
  This is a modified Node.js script
  utilizing my Node and FlightPlan classes to generate an XML flightplan and save it to a file.
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
var icao="KSAN";
rl.on('line', (line) => 
{
  var rsp = line.replace(/\0/g, '');
  //print("Entering response handler with: "+rsp)
  if (rsp.length>0)
    response=rsp; 
  //print("response = "+response);
  if (rsp.toUpperCase().indexOf("LATLON")>=0)
  {
    print("executing LATLON")
    icao = rsp.toUpperCase().replace(")","(").split("(")[1];
    askhttps.AskWeb(search[use][0],search[use][1]+icao,callback);
  }
  else if (rsp.toUpperCase().indexOf("HOLD2")>=0)
  {
    // HOLD(lat,lon,legs,length)
    var str = rsp.replace("(",",").replace(")",",").split(",")
    var lat = str[1]
    var lon = str[2]
    legs = str[3]
    length = str[4]
    //print("Executing Hold with "+lat+","+lon+","+legs+","+length)
    var  xmlfp = ff.HoldPattern(Number(legs),Number(length),Number(lat),Number(lon))
    //print(xmlfp)
    var filename = './flightplans/test.fpl';
    fs.writeFile(filename, xmlfp , function (err) {
      if (err) throw err;
      console.log(filename+ ' Replaced!');
    });
  }
    else if (rsp.toUpperCase().indexOf("HOLD1")>=0)
  {
    // HOLD(ICAO,legs,length)
    var str = rsp.replace("(",",").replace(")",",").split(",")
    icao = str[1]
    print(icao+","+legs+","+length)
    legs = str[2]
    length = str[3]
    print(icao+","+legs+","+length)
    askhttps.AskWeb(search[use][0],search[use][1]+icao,holdcallback);
  }
  else if (rsp.toUpperCase().indexOf("XML")>=0)
  {
    print("executing XML Test")
    var xml = new mx.Node("Root","","this=is an attribute")
    var l1 = xml.AddChild(new mx.Node("Level1","L1Value"))
    var l2 = l1.AddChild(new mx.Node("Level2","L2Value"))
    print(xml.ToXML())
  }
  else if (rsp.toUpperCase().indexOf("FP")>=0)
  {
    print("executing FLIGHTPLAN")
    var fp = new mx.FlightPlan("KSAN")
    fp.AddUserFix("fix1",23.1234,-116.1234)
    fp.AddUserFix("fix2",24.1234,-117.1234)
    fp.AddUserFix("fix1",23.1234,-116.1234)
    fp.AddUserFix("fix2",24.1234,-117.1234)
    var xmlfp = fp.ToXml();
    print(xmlfp)
  }
  print("Exiting response handler")
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
  print("Executing HoldPattern("+lat+","+lon+","+legs+","+length+")")
  let  xmlfp = ff.HoldPattern(Number(legs),Number(length),Number(lat),Number(lon))
  //print(xmlfp)
  let fn = icao+" Hold-"+legs+" "+length+".fpl"
  let filename = './flightplans/'+fn;
  fs.writeFile(filename, xmlfp , function (err) 
  {
    if (err) throw err;
    console.log(filename+ ' Replaced!');
  });
}
print(strings.help)
print('')
process.stdout.write(strings.optionprompt)
