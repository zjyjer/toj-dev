function CheckUsername() {
	var checkRegex = /^[a-zA-Z0-9\_]+$/;
	var username = $('#username').val();
	if(!username.match(checkRegex)) {
		$('#username_msg').css({'color':'red'});
		$('#username_msg').html("Username should consists of alphabet, digit and '_'.");
		return false;
	} else if(username.length < 2 || username.length > 18) {
		$('#username_msg').css({'color':'red'});
		$('#username_msg').html("Username length should be 2-18.");
		return false;
	} else {
		var valid;
		$.ajax ({
			url: '/CheckUsernameExists',
			type: 'POST',
			data:{username:username},
			async: false,
			success: function(json) {
				if(json.exists == 1) {
					$('#username_msg').css({'color':'red'});
					$('#username_msg').html('Username already exists.');
					valid = false;
				} else {
					$('#username_msg').html('');
					valid = true;
				}
			}

		});
		return valid;
	} 
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
function Reg() {
	if(CheckSame() && CheckUsername()) {
		$('#reg-form').submit();
	}
}
