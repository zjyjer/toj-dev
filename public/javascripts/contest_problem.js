function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function dhm() {
	var len = new Date() - new Date();
	var cd = 24 * 60 * 60 * 1000,
	    ch = 60 * 60 * 1000,
	    d = Math.floor(len / cd),
	    h = '0' + Math.floor((len-d*cd)/ch),
	    m = '0' + Math.round((len-d*cd-h*ch)/60000);
	$("#tm_remain").innerHTML([d, h.substr(-2), m.substr(-2)].join(':'));
}
