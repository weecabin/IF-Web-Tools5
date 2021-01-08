let icao="";

var runwaylatlon="";

var myAirports;

var myRunways;

var xmlData="";

function AddStatus(str)
{
  document.getElementById("status").value+="\n"+str
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

function DownloadXML() 
{
  let fn = document.getElementById("filename").value;
  if (fn.toUpperCase().indexOf(".FPL")<3)
  {
    AddStatus("Invalid filename")
    return;
  }
  if (xmlData.length>50)
  {
   
    if (fn.indexOf(".")>=0)
      fn=fn.split(".")[0];
    fn+=".fpl"
    download(fn,xmlData)
    AddStatus(fn+" downloaded");
  }
  else
  {
    AddStatus("Nothing to save");
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
