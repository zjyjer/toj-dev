$(function() {
	sh_highlightDocument();
});

function copyCode() {
	var client = new ZeroClipboard( $("#clip-btn"), {
		moviePath: "/flash/ZeroClipboard.swf",
		debug: false
	});
	
	clientTarget.on( "load", function(clientTarget) {
		clientTarget.on( "complete", function(clientTarget, args) {
			clientTarget.setText( args.text );
			alert('xxxx');
		});
	});
}
