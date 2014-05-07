function get_tags(pid) {
	var ret = null;
	$.ajax ( {
		url: '/Problem/getTags',
		type: 'POST',
		data: {pid: pid},
		async: false,
		success: function(json) {
			ret = json;
		}
	});
	return ret;
}
function add_tags(pid, tag) {
	$.ajax ( {
		url: '/Problem/addTags',
		type: 'POST',
		data: {pid: pid, tag: tag},
		async: false,
		success: function(json) {
			if (json.ok) {
				$('#prob-tags').html(tag_string(json.list));
				$('#notice').show();
				$('#choose').hide();
			} else {
				alert('Error');
			}
		}
	});
}
function tag_string(list) {
	var html = '<div class="panel-body">';
	for (var i = 0;i < list.length; ++i) {
		html += '  <span class="label label-default">' + list[i] + '</span>';
	}
	if (list.length == 0) { html += 'No Tags yet.'; }
	html += '</div>';
	return html;
}
function dotags(pid) {
	if ($('#tag-title').html() == 'Show Tags') { // change to 'Hide Tags', query for tags
		var json = get_tags(pid);
		var access = json.access;
		var list = json.tag;
		$('#prob-tags').html(tag_string(list));
		if (access == 0) {
			$('#notice').html('No edit access');
		} else {
			$('#notice').html('<a href="javascript:choose('+pid+')">edit</a>');
		}
		$('#tags').show();
		$('#notice').show();
		$('#tag-title').html('Hide Tags');
	} else if ($('#tag-title').html() == 'Hide Tags') {
		$('#tag-title').html('Show Tags');
		$('#tags').hide();
		$('#notice').hide();
		$('#choose').hide();
	}
}
function choose(pid) {
	$('#notice').hide();
	$('#choose').show();
	$('#alltags').change(function() { 
		var val = $("#alltags option:selected").text();  
		add_tags(pid, val);
	});
}
