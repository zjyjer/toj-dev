/**
 *  config
 */

var config = {
	name: 'NewTOJ',
	description: 'NewTOJ is a new vjudge.',

	db: 'mongodb://127.0.0.1/toj',
	db_name: 'toj',
	session_secret: 'newtoj',

	host: '127.0.0.1',
	port: 3000,

	contest_max_probs: 11, //比赛最多题目数

	prob_per_page: 100, //每页显示的题数
	status_per_page: 15, //每页显示的status数
	statistics_per_page: 15, //每页显示的统计数
	users_per_page : 50,	//ranklist每页人数
	contest_per_page : 20,	//ranklist每页人数

	judge_string: 'yourjudgestring',
	error_string: 'yourerrorjudgestring',
	submit_string: 'yoursubmitstring',
	rejudge_string: 'yourrejudgestring',

	judge_host: '127.0.0.1',
	judge_port: 5907,
	
	ojs: ['HDU', 'POJ', 'ZOJ'],

	oj_lang: {
		'HDU': '<option value="1">G++</option><option value="2">GCC</option><option value="3">Java</option><option value="4">Pascal</option><option value="12">C++</option><option value="13">C</option>',

		'POJ': '<option value="1">G++</option><option value="2">GCC</option><option value="3">Java</option><option value="4">Pascal</option><option value="12">C++</option><option value="13">C</option>',

		'ZOJ': '<option value="1">G++</option><option value="2">GCC</option><option value="3">Java</option><option value="4">Pascal</option><option value="5">Python</option><option value="8">Perl</option>',
	},

	digit2result: [
		'Accepted', 
		'Wrong Answer', 
		'Presentation Error', 
		'Compilation Error', 
		'Runtime Error', 
		'Time Limit Exceeded', 
		'Memory Limit Exceeded', 
		'Output Limit Exceeded', 
		'Judge Error'
	],

	corrlang: [
		'None', 	// 0, this is not used
		'G++',  	// 1
		'GCC',  	// 2
		'Java', 	// 3
		'Pascal', 	// 4
		'Python',	// 5
		'',		// 6
		'',		// 7
		'Perl',		// 8
		'',		// 9
		'',		// 10
		'',		// 11
		'C++',		// 12
		'C'		// 13
	],

	site_links: [
		{
			'text': 'Old TOJ',
			'url': 'http://acm.tju.edu.cn'
		}
	],

	// mail SMTP
	// later...
};

module.exports = config;
module.exports.config = config;
