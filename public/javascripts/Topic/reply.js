function Reply() {
	var data = {};
	var tid = window.location.href.split('/')[5];
	tid = tid.split('#')[0];
	var converter = new Markdown.Converter();
	var content = $('#wmd-input').val();
	content = converter.makeHtml(content);

	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action = '/Discuss/reply/' + tid;
	var a = document.createElement('input');
	a.type = 'hidden';
	a.name = 'r_content';
	a.value = content;
	aform.appendChild(a);
	document.body.appendChild(aform);
	aform.submit();
}
