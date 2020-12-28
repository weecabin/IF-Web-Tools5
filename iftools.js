

function setup()
{
  
}

var xmlData="";

function execute()
{
  let lat = document.getElementById("lat").value;
  let lon = document.getElementById("lon").value;
  let legs = document.getElementById("legs").value;
  let radius = document.getElementById("radius").value;
  let loops = document.getElementById("loops").value;
  let status = document.getElementById("status"); 
  
  let legangle = Math.PI*2/Number(legs);
  let leglen = 2*Math.sin(legangle/2)*radius;
  
  //HoldPattern(legs,leglen,lat,lon,loops=10)
  status.value="Working: "+"HoldPattern("+concat([legs,leglen.toFixed(2),lat,lon,loops],",")+")";
  
  let txt= document.getElementById("txt");
  try 
  {
    //let fltplan = new FlightPlan("name");
    //txt.value=fltplan.ToXml();
    xmlData= HoldPattern(Number(legs), Number(leglen), Number(lat), Number(lon), Number(loops));
    txt.value=xmlData;
  }
  catch(err) 
  {
    document.getElementById("txt").innerHTML = err.message;
  }
 
}

function save() 
{
  let status=document.getElementById("status");
  if (xmlData.length>50)
  {
    let fn = document.getElementById("filename").value;
    if (fn.indexOf(".")>=0)
      fn=fn.split(".")[0];
    fn+=".fpl"
    download(fn,xmlData)
    status.value=fn+" downloaded"
  }
  else
  {
    status.value="Nothing to save";
  }
}

function download(filename, text) 
{

  var element = document.createElement('a');

  element.setAttribute('href', 'data:fpl/plain;charset=utf-8,' + encodeURIComponent(text));

  element.setAttribute('download', filename);
  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();

  document.body.removeChild(element);

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