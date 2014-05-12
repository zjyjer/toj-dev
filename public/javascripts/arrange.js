function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function Addmore() {
	$('#moreprob').show();
	$('#addmorelabel').hide();
}

function CheckPID(id) {
	var oj_id = "oj" + id;
	var prob_id = "pid" + id;
	var oj = $("#"+oj_id).val();
	var pid = $("#"+prob_id).val();
	$.ajax ({
		url: '/Contest/CheckPid',
		type: 'POST',
		data:{oj:oj, pid:pid},
		async: false,
		success: function(json) {
			if (json.error == "1") {
				$("#"+prob_id).focus();
				$("#title"+id).html('Error!Problem doesn\'t exists.');
			} else {
				$("#title"+id).html(json.title);
			}
		}
	});
}
$(function () {
	$('#datetimepicker1').datetimepicker();
	$('#datetimepicker2').datetimepicker();
	var today = new Date();
	today.setDate(today.getDate()-1);
	$("#datetimepicker1").data("DateTimePicker").setMinDate(today);
	$("#datetimepicker2").data("DateTimePicker").setMinDate(today);
	$("#datetimepicker2").data("DateTimePicker").setMaxDate(today.setDate(today.getDate()+15));

	$('#datetimepicker1').on("dp.change", function(e) {
		$("#datetimepicker2").data("DateTimePicker").setMinDate(e.date);
	});
	$('#datetimepicker2').on("dp.change", function(e) {
		$("#datetimepicker1").data("DateTimePicker").setMaxDate(e.date);
	});
});

function validate() {
	var _type = getURLParameter('type');
	if (_type == 0) { //check, should at least one problem
		var pid = $('#pid1001').val();
		if (!pid) return false;
	} else { //check, should at least 9 problems
		for (var i = 1001;i <= 1009; ++i) {
			var tmp = $('#pid'+i).val();
			if (!tmp) {
				return false;
			}
		}
	}
	return true;
}

function Submit() {
	if (!validate()) {
		$('#errmsg').html('Invalid Problems.');
		$('#errmsg').show();
	} else {
		$('#errmsg').hide();
		$("#carrange").submit();
	}
}
