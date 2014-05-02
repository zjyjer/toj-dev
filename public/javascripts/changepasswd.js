function CheckMatch(username) {
	var passwd = $('#original').val();
	$.ajax ({
		url: '/CheckPasswd',
		type: 'POST',
		data:{username:username, passwd:passwd},
		async: false,
		success: function(json) {
			if(json.match == 0) {
				$('#original_msg').css({'color':'red'});
				$('#original_msg').html('Password not match.');
				valid = false;
			} else {
				$('#username_msg').html('');
				valid = true;
			}
		}

	});
	return valid;
}
function CheckSame() {
	var passwd1 = $('#password').val();
	var passwd2 = $('#password-repeat').val();
	if(passwd1 != passwd2) {
		$('#passwd-repeat_msg').css({'color':'red'});
		$('#passwd-repeat_msg').html("Password entered twice aren't same.");
		return false;
	} else {
		$('#passwd-repeat_msg').html('');
		return true;
	}
}
function DoChange() {
	$('#change-form').submit();
}
