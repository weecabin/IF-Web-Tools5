

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

var printHold = ""
const print = (msg) => {
  printHold+=msg;
}
const println = (msg) => {
  console.log(printHold+msg);
  printHold="";
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

var search = [
  ['https://www.airnav.com/airport/'],
  ['https://www.airport-data.com/world-airports/']
  ];
  
var srchStringIndex =0;
/*
var response="KSFO";
var latlon ="";
var legs="5";
var length="50";
var radius="50";
var loops="10";
var icao="KSAN";
*/
rl.on('line', (line) => 
{
  var rsp = line.replace(/\0/g, '');
  //print("Entering response handler with: "+rsp)
  if (rsp.length>0)
    response=rsp; 
  //print("response = "+response);
  var splitcmd= rsp.toUpperCase().replace(")",",").replace("(",",").split(",")
  //console.log(parsedcmd)
  var cmd = splitcmd[0]
  var icao = splitcmd[1]
  //console.log("cmd="+cmd+" icao="+icao)
  var waitingForResponse=false;
  var url = search[srchStringIndex]+icao
  console.log(url)
  switch (cmd)
  {
    case "LATLON":
    println("Executing LATLON")
    askhttps.getContent(url)
      .then((html)=>{
        //console.log(html)
        let latlon = GetLatLong(html)
        console.log(latlon)
        process.stdout.write(strings.optionprompt)
        }
      )
      .catch((err)=>console.log(err));
    break;
    
    case "HOLD1":
    println("Executing "+rsp)
    //print(icao+","+legs+","+length+","+loops)
    legs = splitcmd[2]
    length = splitcmd[3]
    loops = splitcmd[4]
    askhttps.getContent(url)
      .then((html)=>{
        //console.log(html)
        let latlon = GetLatLong(html)
        HoldLegLen(latlon,icao,legs,length,loops)
        process.stdout.write(strings.optionprompt)
        }
      )
      .catch((err)=>console.log(err));
    break;
    
    case "HOLD2":
    println("Executing "+rsp)
    //print(icao+","+legs+","+length +","+loops)
    legs = splitcmd[2]
    radius = splitcmd[3]
    loops = splitcmd[4]
    askhttps.getContent(url)
      .then((html)=>{
        //console.log(html)
        let latlon = GetLatLong(html)
        HoldRadius(latlon,icao,legs,radius,loops)
        process.stdout.write(strings.optionprompt)
        }
      )
      .catch((err)=>console.log(err));
    break;
    
    case "HOLD3":
    println("Executing "+rsp)
    var lat = splitcmd[1]
    var lon = splitcmd[2]
    legs = splitcmd[3]
    length = splitcmd[4]
    loops = splitcmd[5]
    //println("Executing HoldPattern("+legs+","+length+","+lat+","+lon+","+loops+")")
    var  xmlfp = ff.HoldPattern(Number(legs),Number(length),Number(lat),Number(lon),Number(loops))
    //print(xmlfp)
    var filename = FpPath('test.fpl');
    fs.writeFile(filename, xmlfp , function (err) {
      if (err) throw err;
      println(filename+ ' Replaced!');
      process.stdout.write(strings.optionprompt)
    });
    break;
    
    case "CIRCLE":
    //rsp="CIRCLING(23,116,24,116.1,90)"
    //CIRCLE(lat1,lon1,lat2,lon2,entryHeading)
    let cmd = cmdParts(rsp,",");
    //println(cmd);
    let fix1 = [cmd[1],cmd[2]]
    let fix2 = [cmd[3],cmd[4]]
    let circxml = ff.Circling(fix1,fix2,Number(cmd[5]))
    //println(circxml)
    var filename = FpPath('Circling.fpl');
    fs.writeFile(filename, circxml , function (err) {
      if (err) throw err;
      println(filename+ ' Replaced!');
      process.stdout.write(strings.optionprompt)
    });
    break;

    case "XML":
    println("Executing XML Test")
    var xml = new mx.Node("Root","","this=\"is an attribute\"")
    var l1 = xml.AddChild(new mx.Node("Level1","L1Value"))
    var l2 = l1.AddChild(new mx.Node("Level2","L2Value"))
    println(xml.ToXML())
    process.stdout.write(strings.optionprompt)
    break;
    
    case "FP":
    println("Executing FLIGHTPLAN")
    var fp = new mx.FlightPlan("KSAN")
    fp.AddUserFix("fix1",23.1234,-116.1234)
    fp.AddUserFix("fix2",24.1234,-117.1234)
    fp.AddUserFix("fix1",23.1234,-116.1234)
    fp.AddUserFix("fix2",24.1234,-117.1234)
    var xmlfp = fp.ToXml();
    println(xmlfp)
    process.stdout.write(strings.optionprompt)
    break;

    default:
    {
      println("Err: cmd not found")
      process.stdout.write("> ");
    }
  }
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
      println ("error");
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
  var n = xmlString.indexOf("Lat/Long");
  //print(n)
  //icao = "";
  if (n>0)
  {
    var sub = xmlString.substring(n,n+300)
    //print(sub);
    var n1 = Occurence(2,sub,"<BR>")
    var n2 = Occurence(3,sub,"<BR>");
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

function FpPath(str)
{
  return strings.Flightplans+"/"+str;
}

function cmdParts(cmdstr,delim)
{
  let str = cmdstr.replace("(",delim).replace(")",delim).split(delim)
  /*
  let parts="";
  for(i=0;i<str.length;i++)
  {
    parts+=str[i];
    if (i!=(str.length-1))
      parts+=",";
  }
  print (parts)
  */
  return str;
}

callback = function(str)
{
  let latlon = GetLatLong(str);
  if (latlon.length>0)
    println(" Lat/Long = "+latlon);
  else
    println("Not Found") 
    process.stdout.write("> ");
}

function HoldLegLen (latlon,icao,legs,length,loops)
{
  if (latlon.length==0)
  {
    println("Lat/Long not found");
    return
  }
  var splitlatlon = latlon.split(",")
  println("latlon="+latlon)
  let lat = splitlatlon[0]
  let lon = splitlatlon[1]
  println("Executing HoldPattern("+legs+","+length+","+lat+","+lon+","+loops+")")
  let  xmlfp = ff.HoldPattern(Number(legs),Number(length),Number(lat),Number(lon),Number(loops))
  //print(xmlfp)
  let fn = icao+" Hold "+legs+" "+length+".fpl"
  let filename = FpPath(fn);
  fs.writeFile(filename, xmlfp , function (err) 
  {
    if (err) throw err;
    console.log(filename+ ' Replaced!');
    process.stdout.write(strings.optionprompt);
  });
 
}

function HoldRadius(latlon,icao,legs,radius,loops)
{
  if (latlon.length==0)
  {
    println("Lat/Long not found");
    return
  }
  var splitlatlon = latlon.split(",")
  println("latlon="+latlon)
  let lat = splitlatlon[0]
  let lon = splitlatlon[1]
  let legangle = Math.PI*2/Number(legs);
  let len = 2*Math.sin(legangle/2)*radius;
  println("Executing HoldPattern("+legs+","+len+","+lat+","+lon+","+loops+")")
  let  xmlfp = ff.HoldPattern(Number(legs),len,Number(lat),Number(lon),Number(loops));
  //print(xmlfp)
  let fn = icao+" HoldRadius "+legs+" "+radius+".fpl"
  let filename = FpPath(fn);
  fs.writeFile(filename, xmlfp , function (err) 
  {
    if (err) throw err;
    console.log(filename+ ' Replaced!');
    process.stdout.write(strings.optionprompt);
  });
}

//print(strings.help)
//print('')
process.stdout.write(strings.optionprompt)
