var config = require('../config').config;
exports.get_Pagelist = function(volume, counts) {
	var total_volume = Math.floor(counts / config.prob_per_page);
	if(counts % config.prob_per_page) total_volume += 1;

	var page = [];
	if(total_volume <= 10) {
		page.push(-1);
		for(var i = 1;i <= total_volume; ++i) page.push(i);
		page.push(-1);
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
		if (a.ac === b.ac) {
			return a.penalty - b.penalty;
		} else {
			return b.ac - a.ac;
		}
	});

	ret['standing'] = result;
	ret['fb'] = first_blood;
	ret['solve'] = solve;
	return ret;
};

function formate_date(d) {
	var month = d.getMonth() + 1;
	var day = d.getDate();
	var mm, dd;

	mm = month < 10 ? '0' + month : '' + month;
	dd = day < 10 ? '0' + day : '' + day;
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
		var tmp = new Date();
		tmp.setDate(tmp.getDate()-i);
		y_axis.push(formate_date(tmp));
	}
	
	for (var i = 0;i < stats.length; ++i) {
		var t_day = parseInt((now - stats[i].submit_time) / (1000 * 60 * 60 * 24));
		var t_hour = stats[i].submit_time.getHours();
		list[6-t_day][t_hour] += 1;
	}
	for (var i = 0;i < 7; ++i) {
		for (var j = 0;j < 24; ++j) {
			var tmp = {};
			tmp.y = i;
			tmp.x = j;
			tmp.marker = { radius: list[i][j] * 2}; //radius为题目数的两倍
			ret.push(tmp);
		}
	}
	return { y_axis: y_axis, data: ret };
};

exports.format_date2 = function (date, friendly) {
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();

	if (friendly) {
		var now = new Date();
		var mseconds = -(date.getTime() - now.getTime());
		var time_std = [ 1000, 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000 ];
		if (mseconds < time_std[3]) {
			if (mseconds > 0 && mseconds < time_std[1]) {
				return Math.floor(mseconds / time_std[0]).toString() + ' seconds ago';
			}
			if (mseconds > time_std[1] && mseconds < time_std[2]) {
				return Math.floor(mseconds / time_std[1]).toString() + ' minutes ago';
			}
			if (mseconds > time_std[2]) {
				return Math.floor(mseconds / time_std[2]).toString() + ' hours ago';
			}
		}
	}

	//month = ((month < 10) ? '0' : '') + month;
	//day = ((day < 10) ? '0' : '') + day;
	hour = ((hour < 10) ? '0' : '') + hour;
	minute = ((minute < 10) ? '0' : '') + minute;
	second = ((second < 10) ? '0': '') + second;

	var thisYear = new Date().getFullYear();
	year = (thisYear === year) ? '' : (year + '-');
	return year + month + '-' + day + ' ' + hour + ':' + minute;
};
