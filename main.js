$(function(){
	$("ul.panel li:not("+$("ul.tab li a.selected").attr("href")+")").hide()
	$("ul.tab li a").click(function(){
		$("ul.tab li a").removeClass("selected");
		$(this).addClass("selected");
		$("ul.panel li").hide();
		$($(this).attr("href")).show();
		return false;
	});

	//$("selected").change(function(){
//	});
});

$(function(){
	$("a.open").click(function(){
		$("#floatWindow").fadeIn("fast");
		return false;
	});

	$("#floatWindow a.close").click(function(){
		$("#floatWindow").fadeOut("fast");
		return false;
	});

	$("#floatWindow dl dt").mousedown(function(e){
		$("#floatWindow")
			.data("clickPointX" , e.pageX - $("#floatWindow").offset().left)
			.data("clickPointY" , e.pageY - $("#floatWindow").offset().top);

		$(document).mousemove(function(e){
			$("#floatWindow").css({
				top:e.pageY  - $("#floatWindow").data("clickPointY")+"px",
				left:e.pageX - $("#floatWindow").data("clickPointX")+"px"
			});
		});
	}).mouseup(function(){
		$(document).unbind("mousemove");
	});
});
