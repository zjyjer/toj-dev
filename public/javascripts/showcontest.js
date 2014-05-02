function DisplayTime(){
	if (!document.all && !document.getElementById)
		return
	timeElement=document.getElementById? document.getElementById("curTime"): document.all.tick2;
	var CurrentDate=new Date();
	var hours=CurrentDate.getHours();
	var minutes=CurrentDate.getMinutes();
	var seconds=CurrentDate.getSeconds();
	if (hours==0) hours=0;
	if (minutes<=9) minutes="0"+minutes;
	if (seconds<=9) seconds="0"+seconds;
	var currentTime=hours+":"+minutes+":"+seconds;
	timeElement.innerHTML="<font style='font-family:verdana, arial,tahoma;font-size:12px;color:red; font-weight:bold;'>"+currentTime+"</b>";
	setTimeout("DisplayTime()",1000);
}


//window.onload=DisplayTime;
