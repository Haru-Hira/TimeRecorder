var timers = new Array();
var NumOfTimers = 12; //ToDo 項目リストからのデータ読み込み

$(function(){
  var timersManagementArray = new Array();

  var Timer = function(id, taskName){
    var id = id;
    var taskName = "\n" + taskName + "\n";
    var startTime = 0;
    var recentTime = 0;
    var offsetTime = 0;
    var initializedFlag = false;
    var hourStr = "00";
    var minStr = "00";
    var secStr = "00";

    this.setTaskName = function(Name){
      taskName = "\n" + Name + "\n";
      $("ul.panel li#tab0 input#button" + id).attr("value", this.initialTimerLabel("stop_state"));
    }

    this.initialTimerLabel = function(state){
      var label = "";
      if(state == "stop_state")
      {
        label += "【 停止中 】\n";
      }
      else
      {
        label += "【工数計測中】\n";
      }
      return label + taskName + "\n" + hourStr + ":" + minStr + ":" + secStr;
    }

    this.changeTimerState = function(flg){
      hourStr = "";
      minStr = "";
      secStr = "";

      if(!initializedFlag)
      {
        startDate = new Date();
        startTime = startDate.getTime();
        initializedFlag = true;
      }
      recentDate = new Date();
      recentTime = recentDate.getTime();

      datet = parseInt((offsetTime + recentTime - startTime) / 1000);
      hour = parseInt(datet / 3600);
      min = parseInt((datet / 60) % 60);
      sec = datet % 60;

      if (hour < 10) {
        hourStr += "0" + hour;
      } else {
        hourStr += hour;
      }
      if (min < 10) {
        minStr += "0" + min;
      } else {
        minStr += min;
      }
      if (sec < 10) {
        secStr += "0" + sec;
      } else {
        secStr += sec;
      }
      if(flg == 1)
      {
        $("ul.panel li#tab0 input#button" + id).attr("value", this.initialTimerLabel("running_state"));
      }
      else if(flg == 0)
      {
        $("ul.panel li#tab0 input#button" + id).attr("value", this.initialTimerLabel("stop_state"));
        offsetTime += recentTime - startTime;
        initializedFlag = false;
      }
    }
  }

	$("ul.panel li:not("+$("ul.tab li a.selected").attr("href")+")").hide()
	$("ul.tab li a").click(function(){
		$("ul.tab li a").removeClass("selected");
		$(this).addClass("selected");
		$("ul.panel li").hide();
		$($(this).attr("href")).show();
		return false;
	});

  for(var i = 0; i < NumOfTimers; i++){
    $("ul.panel li#tab0 div dl dd input.ok_button").before($('<input type="text">').attr("id", "task" + i)
      .attr("value", "タスク" + i).addClass("task")).before($('<br>'));
  }

  for(var i = 0; i < NumOfTimers; i++){
    timers.push(new Timer(i, $("input#task" + i).attr("value")));
    $("ul.panel li#tab0").append($('<input type="button">').attr("id","button" + i)
      .attr("value", timers[i].initialTimerLabel("stop_state")).addClass("timer").addClass("stop_state"));
    timersManagementArray.push("");
  }
  timers.push(new Timer(parseInt(NumOfTimers), "その他(Auto)"));
  $("ul.panel li#tab0").append($('<input type="button">').attr("id","button" + NumOfTimers)
    .attr("value", timers[NumOfTimers].initialTimerLabel("stop_state")).addClass("timer").addClass("stop_state"));
  timersManagementArray.push("");

	$("a.open").click(function(){
		$("#floatWindow").fadeIn("fast");
		return false;
	});

	$("#floatWindow a.close").click(function(){
		$("#floatWindow").fadeOut("fast");
		return false;
	});

  $("#floatWindow input#task_edit_ok").click(function(){
    for(var i = 0; i < NumOfTimers; i++){
      timers[i].setTaskName($("input#task" + i).attr("value"));
    }
  });

  $("#floatWindow input#task_edit_cancel").click(function(){
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

	$("ul.panel li#tab0 input.timer").click(function(){
		if($(this).hasClass("stop_state"))
		{
      $("ul.panel li#tab0 input").each(function(){
        if($(this).hasClass("running_state"))
        {
          $(this).removeClass("running_state").addClass("stop_state");
          var id = parseInt($(this).attr("id").substring(6));
          clearInterval(timersManagementArray[id]);
          timers[id].changeTimerState(0);
        }
      });
			$(this).removeClass("stop_state").addClass("running_state");
      var id = parseInt($(this).attr("id").substring(6));
      timersManagementArray[id] = setInterval("timers[" + id + "].changeTimerState(1)", 100);
		}
		else if($(this).attr("id").substring(6) != NumOfTimers){
      $(this).removeClass("running_state").addClass("stop_state");
      var id = parseInt($(this).attr("id").substring(6));
      clearInterval(timersManagementArray[id]);
      timers[id].changeTimerState(0);

      $("ul.panel li#tab0 input#button" + NumOfTimers).removeClass("stop_state").addClass("running_state");
      timersManagementArray[parseInt(NumOfTimers)] = setInterval("timers[" + NumOfTimers + "].changeTimerState(1)", 100);
		}
	});
});

//DigitalTimer
$(function(){
  var _context;
  var _hour1;
  var _hour2;
  var _min1;
  var _min2;
  var _sec1;
  var _sec2;

  var HOUR_ONE = 0;
  var HOUR_TWO = 50;
  var MINUTE_ONE = 125;
  var MINUTE_TWO = 175;
  var SECOUND_ONE = 255;
  var SECOUND_TWO = 305;

  var DIGIT = {
    0:[{'x':10,'y':10,'l':true},{'x':10,'y':40,'l':true},{'x':40,'y':10,'l':true},{'x':40,'y':40,'l':true},{'x':10,'y':10,'l':false},{'x':10,'y':70,'l':false}],
    1:[{'x':40,'y':10,'l':true},{'x':40,'y':40,'l':true}],
    2:[{'x':10,'y':40,'l':true},{'x':40,'y':10,'l':true},{'x':10,'y':10,'l':false},{'x':10,'y':40,'l':false},{'x':10,'y':70,'l':false}],
    3:[{'x':40,'y':40,'l':true},{'x':40,'y':10,'l':true},{'x':10,'y':10,'l':false},{'x':10,'y':40,'l':false},{'x':10,'y':70,'l':false}],
    4:[{'x':10,'y':10,'l':true},{'x':40,'y':10,'l':true},{'x':40,'y':40,'l':true},{'x':10,'y':40,'l':false}],
    5:[{'x':10,'y':10,'l':true},{'x':40,'y':40,'l':true},{'x':10,'y':10,'l':false},{'x':10,'y':40,'l':false},{'x':10,'y':70,'l':false}],
    6:[{'x':10,'y':10,'l':true},{'x':10,'y':40,'l':true},{'x':40,'y':40,'l':true},{'x':10,'y':10,'l':false},{'x':10,'y':40,'l':false},{'x':10,'y':70,'l':false}],
    7:[{'x':40,'y':10,'l':true},{'x':40,'y':40,'l':true},{'x':10,'y':10,'l':false}],
    8:[{'x':10,'y':10,'l':true},{'x':10,'y':40,'l':true},{'x':40,'y':10,'l':true},{'x':40,'y':40,'l':true},{'x':10,'y':10,'l':false},{'x':10,'y':40,'l':false},{'x':10,'y':70,'l':false}],
    9:[{'x':10,'y':10,'l':true},{'x':40,'y':10,'l':true},{'x':40,'y':40,'l':true},{'x':10,'y':10,'l':false},{'x':10,'y':40,'l':false},{'x':10,'y':70,'l':false}],
    'clear':{'x':5,'y':5,'w':40,'h':70}
  };

  function drawColon(x) {
    _context.beginPath();
    _context.arc(x, 25, 5, 0, Math.PI*2, false);
    _context.fill();
    _context.beginPath();
    _context.arc(x, 55, 5, 0, Math.PI*2, false);
    _context.fill();
  }

  function interval() {
    var dt = new Date();
    var hour1;
    var hour2;
    var min1;
    var min2;
    var sec1;
    var sec2;

    var hour = dt.getHours();
    if (hour > 9) {
      hour1 = (''+hour).substring(0,1);
      hour2 = (''+hour).substring(1,2);
    } else {
      hour1 = 0;
      hour2 = hour;
    }

    var min = dt.getMinutes();
    if (min > 9) {
      min1 = (''+min).substring(0,1);
      min2 = (''+min).substring(1,2);
    } else {
      min1 = 0;
      min2 = min;
    }

    var sec = dt.getSeconds();
    if (sec > 9) {
      sec1 = (''+sec).substring(0,1);
      sec2 = (''+sec).substring(1,2);
    } else {
      sec1 = 0;
      sec2 = sec;
    }

    if (_hour1 != hour1) draw(hour1, HOUR_ONE);
    if (_hour2 != hour2) draw(hour2, HOUR_TWO);
    if (_min1 != min1) draw(min1, MINUTE_ONE);
    if (_min2 != min2) draw(min2, MINUTE_TWO);
    if (_sec1 != sec1) draw(sec1, SECOUND_ONE);
    if (_sec2 != sec2) draw(sec2, SECOUND_TWO);

    _hour1 = hour1;
    _hour2 = hour2;
    _min1 = min1;
    _min2 = min2;
    _sec1 = sec1;
    _sec2 = sec2;
  }

  function clearDigit(t) {
    var c = DIGIT['clear'];
    var x = t + c['x'];
    _context.clearRect(x, c['y'], c['w'], c['h']);
  }

  function draw(num, t) {
    _context.beginPath();
    clearDigit(t);
    var data = DIGIT[num];
    for (var i = 0; i < data.length; i++) {
      var x = t + data[i]['x'];
      drawParts(x, data[i]['y'], data[i]['l']);
    }
    _context.fill();
  }

  function drawParts(x, y, l) {
    _context.moveTo(x, y);
    if (l) {
      _context.lineTo(x + 5, y + 5);
      _context.lineTo(x + 5, y + 25);
      _context.lineTo(x, y + 30);
      _context.lineTo(x - 5, y + 25);
      _context.lineTo(x - 5, y + 5);
    } else {
      _context.lineTo(x + 5, y - 5);
      _context.lineTo(x + 25, y - 5);
      _context.lineTo(x + 30, y);
      _context.lineTo(x + 25, y + 5);
      _context.lineTo(x + 5, y + 5);
    }
    _context.closePath();
  }
  _context = document.getElementById('canvas').getContext('2d');

  drawColon(115);
  drawColon(240);

  interval();

  setInterval(interval, 1000);
});
