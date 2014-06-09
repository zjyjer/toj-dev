/**
 *  config
 */

var config = {
	name: 'NewTOJ',
	description: 'NewTOJ is a new vjudge.',

	db: 'mongodb://127.0.0.1/toj',
	db_name: 'toj',
	session_secret: 'newtoj',
	auth_cookie_name: 'mycatisturing',

	host: '127.0.0.1',
	port: 3000,

	contest_max_probs: 15, //比赛最多题目数

	prob_per_page: 100, //每页显示的题数
	status_per_page: 15, //每页显示的status数
	statistics_per_page: 15, //每页显示的统计数
	users_per_page : 50,	//ranklist每页人数
	contest_per_page : 20,	//ranklist每页人数
	rcont_per_page: 15,	//首页显示的recent contest数量
	topics_per_page: 30,

	judge_string: 'yourjudgestring',
	error_string: 'yourerrorjudgestring',
	submit_string: 'yoursubmitstring',
	rejudge_string: 'yourrejudgestring',

	judge_host: '127.0.0.1',
	judge_port: 5907,
	


	oj_msg: ['All seems OK.', 'Warning, more than 10 queues.', 'Error, can not connect.'], //OJ_Status的提示语

	ojs: ['HDU', 'POJ', 'ZOJ', 'TOJ', 'SGU', 'Ural', 'UVALive'],

	oj_links: {
		'HDU': ['acm.hdu.edu.cn/showproblem.php?pid=', ''],
		'POJ': ['poj.org/problem?id=', ''],
		'ZOJ': ['acm.zju.edu.cn/onlinejudge/showProblem.do?problemCode=', ''],
		'TOJ': ['acm.tju.edu.cn/toj/showp', '.html'],
		'SGU': ['acm.sgu.ru/problem.php?contest=0&problem=',''],
		'Ural': ['acm.timus.ru/problem.aspx?space=1&num=', ''],
		'UVALive': ['icpcarchive.ecs.baylor.edu/index.php?option=com_onlinejudge&Itemid=8&category=3&page=show_problem&problem=', ''],
	},

	oj_lang: {
		'HDU': '<option value="1">G++</option><option value="2">GCC</option><option value="3">Java</option><option value="4">Pascal</option><option value="12">C++</option><option value="13">C</option>',

		'POJ': '<option value="1">G++</option><option value="2">GCC</option><option value="3">Java</option><option value="4">Pascal</option><option value="12">C++</option><option value="13">C</option>',

		'ZOJ': '<option value="1">G++</option><option value="2">GCC</option><option value="3">Java</option><option value="4">Pascal</option><option value="5">Python</option><option value="8">Perl</option>',

		'TOJ': '<option value="1">G++</option><option value="2">GCC</option><option value="3">Java</option><option value="4">Pascal</option>',
		'SGU': '<option value="2">GNU C (MinGW, GCC 4)</option><option value="1">GNU CPP (MinGW, GCC 4)</option><option value="12">Visual Studio C++ 2010</option><option value="6">C#</option><option value="13">Visual Studio C 2010</option><option value="3">JAVA 7</option><option value="4">Delphi 7.0</option>',
		'Ural': '<OPTION VALUE="4">FreePascal 2.0.4</OPTION><OPTION VALUE="13">Visual C 2010</OPTION><OPTION VALUE="12" SELECTED>Visual C++ 2010</OPTION><OPTION VALUE="6">Visual C# 2010</OPTION><OPTION VALUE="3">Java 1.7</OPTION><OPTION VALUE="16">Go 1.1</OPTION><OPTION VALUE="5">Python 2.7</OPTION><OPTION VALUE="17">Haskell 7.6.1</OPTION><OPTION VALUE="2">GCC 4.7.2</OPTION><OPTION VALUE="1">G++ 4.7.2</OPTION><OPTION VALUE="14">GCC 4.7.2 C11</OPTION><OPTION VALUE="15">G++ 4.7.2 C++11</OPTION>',
		'UVALive': '<option value="1">G++</option><option value="2">GCC</option><option value="3">Java</option><option value="4">Pascal</option><option value="15">C++11</option>',
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
		'C#',		// 6
		'',		// 7
		'Perl',		// 8
		'',		// 9
		'',		// 10
		'',		// 11
		'C++',		// 12
		'C',		// 13
		'C11',		//14
		'C++11',	//15
		'Go',		//16
		'Haskell'	//17
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
