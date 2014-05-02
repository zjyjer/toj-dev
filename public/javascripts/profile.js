$('.pbody').height($('#info').height());
function Save() {
	var email = $('#email').html();
	var univer = $('#univer').html();
	var country = $('#country').html();
	var decl = $('#decl').html();

	var aform = document.createElement('form');
	aform.method = 'post';
	aform.action='/SaveProfile';

	var a=document.createElement('input');
	a.type='hidden';
	a.name='nickname';
	a.value=$('#nickname').html();

	var b=document.createElement('input');
	b.type='hidden';
	b.name='email';
	b.value=$('#email').html();

	var c=document.createElement('input');
	c.type='hidden';
	c.name='univer';
	c.value=$('#univer').html();

	var d=document.createElement('input');
	d.type='hidden';
	d.name='country';
	d.value=$('#country').html();

	var e=document.createElement('input');
	e.type='hidden';
	e.name='decl';
	e.value=$('#decl').html();

	aform.appendChild(a);
	aform.appendChild(b);
	aform.appendChild(c);
	aform.appendChild(d);
	aform.appendChild(e);
	document.body.appendChild(aform);
	aform.submit();
}
function edit_profile() {
	if($('#editbtn').html() == "Edit my profile") {
		$('#info').editableTableWidget();
		$('#editbtn').html('Type the filed to change');
	} else if($('#editbtn').html() == 'Save') {
		Save();
	}
}
