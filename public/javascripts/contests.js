function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function SearchContest(type) {
	var info = $('#title_source').val();
	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action='/ContestSearch';
	var a=document.createElement('input');
	a.type='hidden';
	a.name='info';
	a.value = info;
	var b=document.createElement('input');
	b.type='hidden';
	b.name='type';
	b.value = type;
	aform.appendChild(a);
	aform.appendChild(b);
	document.body.appendChild(aform);
	aform.submit();
}
$(function() {
	$('#admin_arrange').hide();
	if (getURLParameter('type') == 2) {
		$('#arrange').hide();
		$('#admin_arrange').show();
	}	
});
