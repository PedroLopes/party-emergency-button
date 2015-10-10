//test
var test_complete = false;

function replaceElementText(id, text)
{
  if (document.getElementById)
  {
    var e=document.getElementById(id);
    if (e)
    {
      if (e.childNodes[0])
      {
        e.childNodes[0].nodeValue=text;
      }
      else if (e.value)
      {
        e.value=text;
      }
      else 
      {
        e.innerHTML=text;
      }
    }
  }
}

function replaceClassname(id, text)
{
  if (document.getElementById)
  {
    var e=document.getElementById(id);
    if (e)
    {
      if (e.childNodes[0])
      {
        e.childNodes[0].className=text;
      }
    }
  }
}

function sendMessageServer(id,d){
    client.publish('/emergency', {
      data: d
  });
}

  
function execute(who,what) {
  if (!test_complete){ 
    sendMessageServer("1");
    replaceElementText("1", "saving the emergency!"); // loop through musicians and disable test.
    }
    test_complete = true;
  }

function re_label(e,text) {
  e.innerHTML=text; 
}

function re_label_all(text) {
    var e=document.getElementById("1");
    e.innerHTML=text; 
}
