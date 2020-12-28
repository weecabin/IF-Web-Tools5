

function setup()
{
  
}

function execute()
{
  let lat = document.getElementById("lat");
  let lon = document.getElementById("lon");
  let legs = document.getElementById("legs");
  let radius = document.getElementById("radius");
  let loops = document.getElementById("loops");
  let status = document.getElementById("status"); 
  
  let legangle = Math.PI*2/Number(legs);
  let leglen = 2*Math.sin(legangle/2)*radius;
  
  //HoldPattern(legs,leglen,lat,lon,loops=10)
  status.value="Working: "+"HoldPattern("+concat([legs,leglen,lat,lon,loops],",")+")";
  
  let txt= document.getElementById("txt");
  try 
  {
    //let fltplan = new FlightPlan("name");
    //txt.value=fltplan.ToXml();
    txt.value=HoldPattern(Number(legs), Number(leglen), Number(lat), Number(lon), Number(loops));
  }
  catch(err) 
  {
    document.getElementById("txt").innerHTML = err.message;
  }
 
}

function concat(arrayofstrings,separator="")
{
  let ret = "";
  let len = arrayofstrings.length;
  for(i=0;i<len;i++)
  {
    ret += arrayofstrings[i];
    if (i<(len-1))
      ret+=separator;
  }
  return ret;
}