function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
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
function Submit() {
	$("#carrange").submit();
}
