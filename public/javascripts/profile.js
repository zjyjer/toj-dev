function getPunchCard(username) {
	var data = {};
	$.ajax ( {
		url: '/user/getPunchCard',
		type: 'POST',
		data: {username: username},
		async: false,
		success: function(json) {
			data = json;
		}
	});
	return data;
}
function draw(json) {
	$('#punch-card').highcharts({
		chart: {
			defaultSeriesType: 'scatter',
			backgroundColor: 'rgba(255, 255, 255, 0)',  
			plotBorderColor : null,  
		        plotBackgroundColor: null,  
		        plotBackgroundImage:null,  
		        plotBorderWidth: null,  
		        plotShadow: false,    
			orderWidth : 0,  
		},

	title: {
		text: 'Recent ACs in the Past week'
	},

	xAxis: {
		tickInterval: 1
	},

	yAxis: {
		title: '',
		categories: json.y_axis
	},
	series: [{
		name: ' ',
		showInLegend: false,
		data: json.data
	}],
	tooltip: {
		formatter: function() {
			return '' + this.point.marker.radius/2 + ' problem(s) solved.';
		},
		shared: true,
		pointFormat: '{point.marker.radius} problems solved.'
	}

	});
}

function deal_with(username) {
	var data = getPunchCard(username);
	$('#punch-loader').hide();
	$('#punch-card').show();
	draw(data);

}
