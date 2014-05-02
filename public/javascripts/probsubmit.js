$(function() {
	var editor = ace.edit("embedded_ace_code");
	editor.setTheme("ace/theme/chrome");
	editor.getSession().setMode("ace/mode/c_cpp");
	editor.focus();
	document.getElementById('embedded_ace_code').style.fontSize='12px';

});
function SelectLang(choose) {
	var obj = choose.value;
	var editor = ace.edit("embedded_ace_code");
	editor.setTheme("ace/theme/chrome");
	if(obj == "12" || obj == "13" || obj == "1" || obj == "2") {
		editor.getSession().setMode("ace/mode/c_cpp");
	} else if(obj == "3") {
		editor.getSession().setMode("ace/mode/java");
	} else {
		editor.getSession().setMode("ace/mode/pascal");
	}
}

