function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

$(function() {
	$('#admin_arrange').hide();
	if (getURLParameter('type') == 2) {
		$('#arrange').hide();
		$('#admin_arrange').show();
	}	
});
