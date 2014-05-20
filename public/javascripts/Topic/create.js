function getURLParameter(name) {
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function CheckPID() {
	//TODO:验证pid是否合法
	//DONE.
	var pid = $('#pid').val();
	var ret = true;
	if (!pid || pid === '') {
		$('#pid_err_msg').html('');
		return true;
	} else {
		$.ajax ({
			url: '/Contest/CheckPid',
			type: 'POST',
			data:{pid:pid},
			async: false,
			success: function(json) {
				if (json.error == "1") {
					$("#pid").focus();
					$("#pid_err_msg").html('Invalid!');
					ret = false;
				} else $('#pid_err_msg').html('');
			}
		});
	}
	return ret;
}

function validate_topic() {
	if (!CheckPID()) return false;
	var title = $('#dtitle').val();
	var content = $('#wmd-input').val();
	if (!title) {
		$('#err_msg').html('Title can not be empty.');
		$('#err_msg_div').show();
		return false;
	}
	if (!content) {
		$('#err_msg').html('Content can not be empty.');
		$('#err_msg_div').show();
		return false;
	}
	return true;	
}
function Create() {
	if (!validate_topic()) return;
	//var pid = getURLParameter('pid');
	var pid = $('#pid').val();
	var title = $('#dtitle').val();
	var converter = new Markdown.Converter();
	var content = $('#wmd-input').val();
	content = converter.makeHtml(content);

	if (!pid) pid = -1;

	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action = '/Discuss/create';

	var a = document.createElement('input');
	a.type = 'hidden';
	a.name = 'pid';
	a.value = pid;

	var b = document.createElement('input');
	b.type = 'hidden';
	b.name = 'title';
	b.value = title;


	var c = document.createElement('input');
	c.type = 'hidden';
	c.name = 'content';
	c.value = content;

	aform.appendChild(a);
	aform.appendChild(b);
	aform.appendChild(c);

	document.body.appendChild(aform);
	aform.submit();
}
