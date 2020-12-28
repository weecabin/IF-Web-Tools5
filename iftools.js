

function setup()
{
  
}

function execute()
{
  document.getElementById("status").value="Working..."+(new Node("root")).ToXML();
  let txt= document.getElementById("txt");
  txt.value="some shit for the textarea";
  let fltplan = new FlightPlan("name");
  window.alert("in Execute");
  document.getElementById("txt").value=fltplan.ToXML();
}