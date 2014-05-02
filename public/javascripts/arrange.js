function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
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
	$("#datetimepicker1").data("DateTimePicker").setMinDate(today);
	$("#datetimepicker2").data("DateTimePicker").setMinDate(today);
	$("#datetimepicker2").data("DateTimePicker").setMaxDate(today.setDate(today.getDate()+10));

	$('#datetimepicker1').on("dp.change", function(e) {
		$("#datetimepicker2").data("DateTimePicker").setMinDate(e.date);
	});
	$('#datetimepicker2').on("dp.change", function(e) {
		$("#datetimepicker1").data("DateTimePicker").setMaxDate(e.date);
	});
});

function Submit() {
	$("#carrange").submit();
}
