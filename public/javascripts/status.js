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
	var pid = document.getElementById('pid').value;
	var user = document.getElementById('user').value;
	var result = document.getElementById('result').value;
	var lang = document.getElementById('lang').value;
	//alert(pid+"#"+user+"#"+result+"#"+lang);
	if(!pid) pid = "";
	if(!user) user = "";
	window.location.replace("/Status?pid="+pid+"&username="+user+"&lang="+lang+"&result="+result);
}

// rejudge request
function rejudge(runid) {
	//alert(runid);
	$.ajax ({
		url: '/rejudge/Status',
		type: 'POST',
		data: {runid: runid},
		async: false,
		success: function(result) {
			if (result.success) {
				alert('This submit has been sent to rejudge.');
				var table = document.getElementById('Status');
				for(var i = 1;i < table.rows.length; ++i) {
					var re = table.rows[i].cells[0].innerText;
					var t = '';
					if (re == runid) {
						t += '<font color="green">Judging</font>';
						t += '<img src = "/icon/status_loader2.gif">';
						table.rows[i].cells[2].innerHTML = t;
						break;
					}
				}
			}
			if (result.error) {
				alert('This submit doesn\'t need to rejudge.');
			}
		}
	});
}

// update status
function get_status(reget, rows) {
	$.ajax ( {
		url: '/refresh/Status',
		type: 'POST',
		data: {runid: reget},
		async: false,
		success: function(json_array) {
			var table = document.getElementById('Status');
			for(var i = 0;i < json_array.length; ++i) {
				if (json_array[i].result == 'Waiting' || json_array[i].result == 'Judging') {
					continue;
				}
				var newre = '';
				if (json_array[i].result == 'Accepted') {
					newre += '<font color="red">Accepted</font>';
				} else if (json_array[i].result == 'Compilation Error') {
					newre += '<font color="#6633FF"><a href="/ShowCEError?runid='+json_array[i].runid+'">Compilation Error</a></font>';
				} else if (json_array[i].result == 'Presentation Error') {
					newre += '<font color="orange">Presentation Error</font>';
				} else {
					newre += '<font color="green">'+json_array[i].result+'</font>';
				}
				if (json_array[i].result == 'Judge Error') {
					newre += '\n<button id="' + table.rows[rows[i]].cells[0].innerText + '" class="btn btn-default btn-sm rejudge" style="padding:0px 0px;"><img style="height:12px;width:12px;border-radius:4px;" src = "/icon/status_rejudge.png">rejudge</button>';
				}
				table.rows[rows[i]].cells[2].innerHTML = newre;
				table.rows[rows[i]].cells[4].innerHTML = json_array[i].tu+'MS';
				table.rows[rows[i]].cells[5].innerHTML = json_array[i].mu+'K';
			}
		}
	});
}
function update_status() {
	var table = document.getElementById('Status');
	var reget = [];
	var rows = [];
	for(var i = 1;i < table.rows.length; ++i) {
		//0-runid  1-submit_time 2-result 3-pid 4-time 5-memory 
		var re = table.rows[i].cells[2].innerText;
		if (re.substr(0, 5) == 'Waiti' || re.substr(0,5) == 'Judgi')  {
			reget.push(table.rows[i].cells[0].innerText);
			rows.push(i);
		}
	}
	get_status(reget, rows);
	setTimeout("update_status()", 1500);
}

$(document).ready(function() {
	update_status();	
	$('.rejudge').click(function() {
		rejudge(this.id);
	});
});
function update_all_status() {
	window.location.reload();
}
setTimeout("update_all_status()", 100000);
