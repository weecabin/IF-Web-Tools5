

function setup()
{
  
}

function execute()
{
  document.getElementById("status").value="Working..."+(new Node("root")).ToXML();
  let txt= document.getElementById("txt");
  try 
  {
    let fltplan = new FlightPlan("name");
    document.getElementById("txt").value=fltplan.ToXML();
  }
  catch(err) 
  {
    document.getElementById("txt").innerHTML = err.message;
  }
 
}