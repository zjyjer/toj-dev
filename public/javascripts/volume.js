function getURLParameter(name) {
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function SearchProb() {
	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action='/ProblemSearch';
	var a=document.createElement('input');
	a.type='hidden';
	a.name='info';
	a.value = document.getElementById('pid_or_title').value;
	if(!a.value) return ;
	var b=document.createElement('input');
	b.type='hidden';
	b.name='oj';
	b.value = getURLParameter('oj');
	aform.appendChild(a);
	aform.appendChild(b);
	document.body.appendChild(aform);
	aform.submit();
}
$(document).ready(function(){
	$('#ojs').change(function() {
		var val = $("#ojs option:selected").text();
		//alert(val);
		window.location.replace("/Problems?oj="+val);

	});
});

function get_acs() {
	var table = document.getElementById('problemList');
	var pids = [];
	for(var i = 1;i < table.rows.length; ++i) {
		var pid = table.rows[i].cells[1].innerText;
		pids.push(pid);
	}
	$.ajax ({
		url: '/Problem/getAC',
		type: 'POST',
		data: {pids: pids},
		async: false,
		success: function(json) {
			var table = document.getElementById('problemList');
			for(var i = 1;i < table.rows.length; ++i) {
				var pid = table.rows[i].cells[1].innerText;
				if (json[pid] == 1) table.rows[i].cells[i].addClass('ac');
				else if (json[pid] == -1) table.rows[i].cells[i].addClass('not-ac');
			}
		}
	});
}

$(document).ready(function(){
	// hide #back-top first
	$("#back-top").hide();
	// fade in #back-top
	$(function () {
		$(window).scroll(function () {
			if ($(this).scrollTop() > 100) {
				$('#back-top').fadeIn();
			} else {
				$('#back-top').fadeOut();
			}
		});

		// scroll body to 0px on click
		$('#back-top a').click(function () {
			$('body,html').animate({
				scrollTop: 0,
				speed: fast
			}, 800);
			return false;
		});
	});
	//get_acs();
});
