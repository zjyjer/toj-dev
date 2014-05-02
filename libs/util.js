var config = require('../config').config;
exports.get_Pagelist = function(volume, counts) {
	var total_volume = Math.floor(counts / config.prob_per_page);
	if(counts % config.prob_per_page) total_volume += 1;

	var page = [];
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
