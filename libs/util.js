var config = require('../config').config;
exports.get_Pagelist = function(volume, counts) {
	var total_volume = Math.floor(counts / config.prob_per_page);
	if(counts % config.prob_per_page) total_volume += 1;

	var page = [];
	if(total_volume <= 10) {
		for(var i = 1;i <= total_volume; ++i) page.push(i);
		return page;
	}

	if(volume >= 4) {
		if(volume + 3 < total_volume - 2) {
			if(volume == 4) {
				page.push(-1);		
			} else {
				page.push(volume - 4);
			}
			for(var i = -3;i <= 3; ++i) {
				page.push(volume + i);
			}
			page.push('...');
			page.push(total_volume - 2);
			page.push(total_volume - 1);
			page.push(total_volume);
			page.push(total_volume + 4);
		} else {
			page.push(-1);
			page.push(1);
			page.push(2);
			page.push(3);
			page.push('...');
			for(var i = total_volume - 6;i <= total_volume; ++i) {
				page.push(i);
			}
			page.push(-1);
		}
	} else {
		page.push(-1);
		for(var i = 1;i <= 7; ++i) {
			page.push(i);
		}
		page.push('...');
		page.push(total_volume - 2);
		page.push(total_volume - 1);
		page.push(total_volume);
		page.push(8);
	}
	return page;
};

function getPenalty(start_time, submit_time) {
	return Math.ceil((submit_time - start_time)/60000);
}

exports.get_standing_via_status = function(contest, contest_probs, status_array) {
	var prob_num = contest_probs.length;
	var stat_num = status_array.length;
	var pid2nid = {};
	var users = {};
	var solve = {};
	var first_blood = [];
	for(var i = 0;i < prob_num; ++i) pid2nid[contest_probs[i].pid] = contest_probs[i].nid;

	for(var i = 0;i < stat_num; ++i) {
		var user = status_array[i].username;
		var pid = status_array[i].pid;
		var submit_time = status_array[i].submit_time;
		var result = status_array[i].result;
		var nid = pid2nid[pid];

		if (!users[user]) {
			users[user] = [];
			for(var j = 0;j < prob_num; ++j) users[user][j] = 0; //users[user][0 ... prob_num-1] 记录提交次数，负数表示还没AC，否则AC
			users[user][prob_num] = users[user][prob_num+1] = 0; //users[user][prob_num, prob_num+1] 记录总AC数，以及罚时，方便后续赋值排序使用
		}
		if (!solve[user]) {
			solve[user] = [];
			for(var j = 0;j < prob_num; ++j) solve[user][j] = -1; //solve[user][0 ... prob_num-1] 记录第一次AC时间
		}

		if (result == 'Accepted') {
			if (!first_blood[nid]) first_blood[nid] = user;

			if (users[user][nid] <= 0) {
				users[user][prob_num] += 1;
				users[user][prob_num+1] += -users[user][nid] * 20;
				users[user][prob_num+1] += getPenalty(contest.start_time, submit_time);
				users[user][nid] = -users[user][nid] + 1;

				solve[user][nid] = getPenalty(contest.start_time, submit_time);
			}
		} else {
			if (users[user][nid] <= 0) {
				users[user][nid] -= 1;
			}
		}
	}
	var result = [];
	var ret = {};
	for (var user in users) {
		var p = {};
		p.probs = [];
		for (var i = 0;i < prob_num; ++i) {
			p.probs[i] = users[user][i];
		}
		p.user = user;
		p.ac = users[user][prob_num];
		p.penalty = users[user][prob_num+1];

		result.push(p);
	}

	result.sort(function(a, b) {
		if (a.ac == b.ac) {
			return a.penalty > b.penalty;
		} else {
			return a.ac < b.ac;
		}
	});

	ret['standing'] = result;
	ret['fb'] = first_blood;
	ret['solve'] = solve;
	return ret;
};

function formate_date(d) {
	var month = d.getMonth();
	var day = d.getDate();
	var mm, dd;
	if (month < 10) mm = '0' + month;
	else mm = '' + month;

	if (day < 10) dd = '0' + day;
	else dd = '' + day;
	return mm + '-' + dd;
};;

exports.getPunchCard = function(stats) {
	var list = [], ret = [], y_axis = [];
	for (var i = 0;i < 7; ++i) {
		list[i] = [];
		for (var j = 0;j < 24; ++j) {
			list[i][j] = 0;
		}
	}
	var now = new Date();
	var now_day = now.getDate();

	for (var i = 6;i >= 0; --i) {
		var tmp = now;
		tmp.setDate(tmp.getDate()-i);
		y_axis.push(formate_date(tmp));
	}
	
	for (var i = 0;i < stats.length; ++i) {
		var t_day = stats[i].submit_time.getDate();
		var t_hour = stats[i].submit_time.getHours();
		list[6-(now_day-t_day)][t_hour] += 1;
	}
	for (var i = 0;i < 7; ++i) {
		for (var j = 0;j < 24; ++j) {
			var tmp = {};
			tmp.y = i;
			tmp.x = j;
			tmp.marker = { radius: list[i][j] };
			ret.push(tmp);
		}
	}
	return { y_axis: y_axis, data: ret };
};
