// smart navigation=true
window.onload = function(){
	var strCook = document.cookie;
	if(strCook.indexOf("!~")!=0){
		var intS = strCook.indexOf("!~");
		var intE = strCook.indexOf("~!");
		var strPos = strCook.substring(intS+2,intE);
		document.body.scrollTop = strPos;
	}
}
function SetScrollPosition(){
	var intY = document.body.scrollTop;
	//document.title = intY;
	document.cookie = "yPos=!~" + intY + "~!";
}
window.onscroll = SetScrollPosition;

function Search() {
	var cid = <% JSON.stringify(fcont.cid) %>;
	var pid = document.getElementById('pid').value;
	var user = document.getElementById('user').value;
	var result = document.getElementById('result').value;
	var lang = document.getElementById('lang').value;
	//alert(pid+"#"+user+"#"+result+"#"+lang);
	if(!pid) pid = "";
	if(!user) user = "";
	window.location.replace("/Contest/Status?cid="+cid+"&pid="+pid+"&username="+user+"&lang="+lang+"&result="+result);
}
