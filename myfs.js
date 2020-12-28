const fs = require("fs")

var printHold = ""
const print = (msg) => {
  printHold+=msg;
}
const println = (msg) => {
  console.log(printHold+msg);
  printHold="";
}

/*
if the passed in directory exists, does nothing
of it doesnt, it creates it, checking each folder as it goes.
supports ./dir1/dir1  or  ../../dir1/dir2
*/
function mkdir(path,debug=false)
{
  if(debug)println("mkdir "+path)
  // split the path by folder, then check the existance of each one and create as needed
  let split = path.split("/")
  //println(split)
  let dir=""
  let sofar=""
  for (dir of split)
  {
    //println(dir) 
    let dotpos = dir.indexOf(".")
    let dotindir = dotpos>=0?true:false
    if (dotpos>0)
    {
      if(debug)println("exiting, filename found: "+dir)
      return
    }
    if (sofar.length==0)
      sofar = dir
    else 
      sofar+="/"+dir
    if (!dotindir)
    {
      if(debug)println("check: "+sofar)
      if(!fs.existsSync(sofar))
      {
        let createErr=false
        if(!debug)
        {
          fs.mkdirSync(sofar, 0766, function(err)
          {
            if(err)
            {
              createErr=true
              console.log(err);
              // echo the result back
              response.send("ERROR! Can't make directory! "+sofar+"\n");
            }
          });
        }
        if(!createErr) println(sofar+" created");
      }
      else
      {
        if (debug)println(sofar+" already exists")
      }
    }
  }
}

module.exports =
{
  mkdir:mkdir
}