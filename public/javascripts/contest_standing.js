function getPenalty(st, submit_time) {
	submit_time = submit_time.replace(' ','T');
	var start = new Date(st);
	var sub = new Date(submit_time);
	return Math.ceil((sub - start)/60000);
}

function compareDate(sa, sb) {
	sa = sa.replace(' ', 'T');
	sb = sb.replace(' ', 'T');
	if(sa > sb) return 1;
	return 0;
}

function get_result(stats, cont) {
	var result = [];
	var len = stats.length;
	var prob_num = cont.problem.length;

	var tmp = {}; tmp.ac = 0; tmp.penalty = 0; tmp.prob = [];
	for(var j = 0;j < prob_num; ++j)
		tmp.prob[j] = {'cnt':0};
	for(var i = 0;i < len; ++i) {
		if(i > 0 && stats[i].username != stats[i-1].username) {
			tmp.username = stats[i-1].username;
			result.push(jQuery.extend(true, {}, tmp));
			tmp = {}; tmp.ac = 0; tmp.penalty = 0; tmp.prob = [];
			for(var j = 0;j < prob_num; ++j)
				tmp.prob[j] = {'cnt':0};
		}
		var nid = parseInt(stats[i].nid) - 1001;
		if(stats[i].result == 'Accepted') {
			tmp.ac ++;
			tmp.prob[nid].ac_time = stats[i].submit_time;
			if(tmp.prob[nid].cnt == 0) {
				tmp.prob[nid].cnt ++;
				tmp.penalty += getPenalty(cont.start_time, stats[i].submit_time);
			} else if(tmp.prob[nid].cnt < 0) {
				tmp.penalty += -tmp.prob[nid].cnt * 20 + getPenalty(cont.start_time, stats[i].submit_time);
				tmp.prob[nid].cnt = -tmp.prob[nid].cnt + 1;
			}
		} else {
			tmp.prob[nid].cnt --;
		}
		if(i == len - 1) {
			tmp.username = stats[i].username;
			result.push(jQuery.extend(true, {}, tmp));
		}
	}
	result.sort(function(a, b) {
		if(a.ac == b.ac) return a.penalty > b.penalty;
		else return a.ac < b.ac;
	});

	var user_num = result.length;

	for(var i = 0;i < prob_num; ++i) {
		var fb = "2204-02-14 20:00:00";
		var blood = -1;
		for(var j = 0;j < user_num; ++j) {
			if(result[j].prob[i].cnt > 0 && compareDate(fb, result[j].prob[i].ac_time)>0) {
				fb = result[j].prob[i].ac_time;
				blood = j;
			}
		}
		if(blood != -1) result[blood].prob[i].fb = 1;
	}
	var table = "<table id='standing' class='table table-condensed table-hover table-striped table-centered'>";
	table += $('#ranking_head').html();
	table += "<tbody id='ranking_body'>";
	for(var i = 0;i < user_num; ++i) {
		table += "<tr>";
		table += "<td>" + (i+1+"") + "</td>";
		table += "<td>" + result[i].username + "</td>";
		table += "<td>" + result[i].ac + "</td>";
		for(var j = 0;j < prob_num; ++j) {
			if(result[i].prob[j].cnt > 0) {
				if(result[i].prob[j].fb) table += "<td class='prob-fb'>";
				else table += "<td class='prob-ac'>";
				table += result[i].prob[j].cnt + "/" + getPenalty(cont.start_time, result[i].prob[j].ac_time) + "</td>";
			} else if(result[i].prob[j].cnt < 0) {
				table += "<td class='prob-wa'>" + result[i].prob[j].cnt + "</td>";
			} else table += "<td>0</td>";
		}
		table += "<td>" + result[i].penalty + "</td>";
		table += "</tr>";
	}
	table += "</tbody></table>";
	$('#standing').html(table);

}




	/*
	 tmp = { username: , ac: , prob: [{cnt: , ac_time:}, ...], penalty: ,};
	*/


/*
	//[ac, penalty, [0, -1, -3, ]]
	var tmp = [];
	tmp[0] = 0; tmp[1] = 0; tmp[2] = []; 
	for(var i = 0;i < prob_num; ++i)
		tmp[2][i] = 0;
	for(var i = 0;i < len; ++i) {
		if(i > 0 && stats[i].username != stats[i-1].username) {
			tmp[3] = stats[i-1].username;
			result.push(jQuery.extend(true, {}, tmp));
			tmp[0] = 0; tmp[1] = 0; tmp[2] = []; tmp[3] = '';
			for(var j = 0;j < prob_num; ++j)
				tmp[2][j] = 0;
		}

		var prob = parseInt(stats[i].nid) - 1001;
		if(stats[i].result == "Accepted") {
			if(tmp[2][prob] == 0) {
				tmp[0] ++;
				tmp[1] += getPenalty(cont.start_time, stats[i].submit_time);
				tmp[2][prob] = 1;
			} else if(tmp[2][prob] < 0) {
				tmp[0] ++;
				tmp[1] += -tmp[2][prob] * 20 + getPenalty(cont.start_time, stats[i].submit_time);
				tmp[2][prob] = -tmp[2][prob] + 1;
			}
		} else {
			tmp[2][prob] --;
		}

		if(i == len - 1) {
			tmp[3] = stats[i].username;
			result.push(jQuery.extend(true, {}, tmp));
		}
	}
	result.sort(function(a, b) {
		if(a[0] == b[0]) return a[1] > b[1];
		else return a[0] < b[0];
	});
	var unum = result.length;
	var table = "<table id='standing' class='table table-bordered table-hover table-striped table-centered'>";
	table += $('#ranking_head').html();
	table += "<tbody id='ranking_body'>";
	for(var i = 0;i < unum; ++i) {
		table += "<tr>";
		table += "<td>" + (i+1+"") + "</td>";
		table += "<td>" + result[i][3] + "</td>";
		table += "<td>" + result[i][0] + "</td>";
		for(var j = 0;j < prob_num; ++j) {
			if(result[i][2][j] > 0) {
				table += "<td class='prob-ac'>+"
			} else if(result[i][2][j] < 0) {
				table += "<td class='prob-wa'>"
			} else table += "<td>";
			table += result[i][2][j] + "</td>";
		}
		table += "<td>" + result[i][1] + "</td>";
		table += "</tr>";
	}
	table += "</tbody></table>";
	$('#standing').html(table);
	//$($('#standing0')).rankingTableUpdate($('#standing'));
*/
