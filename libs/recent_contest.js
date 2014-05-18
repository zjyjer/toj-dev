var http = require('http');
var iconv = require('iconv-lite');
var url=require('url');
var EventProxy = require('eventproxy');

var config = require('../config').config;
var Recent_Contest = require('../proxy').Recent_Contest;

var minutes = 60, the_interval = minutes * 60 * 1000;

function getRecent_Contest() {
	//console.log('...');
	var html = "";
	var getURL = url.parse('http://contests.acmicpc.info/contests.json');
	var req = http.get(getURL, function (res) {
		res.setEncoding('binary');//or hex
		res.on('data',function (data) {//加载数据,一般会执行多次
			html += data;
		}).on('end', function () {
			var buf = new Buffer(html,'binary');//这一步不可省略
			var str = iconv.decode(buf, 'GBK');//将GBK编码的字符转换成utf8的
			var data = JSON.parse(str);

			var ep = new EventProxy();
			ep.after('save', data.length, function (list) {
				console.log(new Date() + ': get successfully');
				return ; 
			});
			for (var i = 0; i < data.length; i++) {
				(function(i) {
					Recent_Contest.getOne({ id: data[i].id }, function(err, doc) {
						if (!doc) {
							Recent_Contest.newAndSave(data[i], function(doc2) {
								ep.emit('save', '');
							});
						} else ep.emit('save', '');
					});
				})(i);
			}

		})
	}).on('error', function(err) {
		console.log(new Date() + ": http get error:",err);
	});
}

setInterval(getRecent_Contest, the_interval);
