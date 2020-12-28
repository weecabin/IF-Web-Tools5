

function setup()
{
  
}

function execute()
{
  document.getElementById("status").value="Working..."+(new Node("root")).ToXML();
  let fltplan = new FlightPlan("name");
  window.alert(fltplan.ToXML());
  document.getElementById("txt").value=fltplan.ToXML();
}