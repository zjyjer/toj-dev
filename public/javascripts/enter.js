function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function enter() {
	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action='/Contest/Enter?cid='+getURLParameter('cid');
	var a=document.createElement('input');
	a.type='hidden';
	a.name='passwd';
	a.value = document.getElementById('passwd').value;
	aform.appendChild(a);
	document.body.appendChild(aform);
	aform.submit();
}
