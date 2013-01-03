var timers = new Array();
var timersManagementArray = new Array();
var NumOfTimers = 0;

$(function(){
  var savingTimer;

  var Timer = function(id, taskName){
    var id = id;
    var rawTaskName = "";
    var state = "stop_state";
    var startTime = 0;
    var recentTime = 0;
    var offsetTime = 0;
    var initializedFlag = false;
    var hourStr = "00";
    var minStr = "00";
    var secStr = "00";

    this.incrementId = function(){
      id++;
    }

    this.setTaskName = function(taskName){
      rawTaskName = taskName;
      var escaped_str = escape(taskName);
      var str_pivot = 0;
      var half_count = 0;
      var str_out = "";
      for (var i = 0; i < escaped_str.length; i++) {
        if(half_count == 15 || half_count == 16 || half_count == 31 || half_count == 32){
          str_out += "\n";
          if(half_count == 15 || half_count == 31){
            half_count++;
          }
        }
        if(46 < half_count){
          str_out += "...";
          break;
        }
        if (escaped_str.charAt(i) == "%") {
          if (escaped_str.charAt(i+1) == "u") {
            i += 5;
            half_count += 2;
          }else{
            i += 2;
            half_count++;
          }
        }else{
          half_count++;
        }
        str_out += taskName.substring(str_pivot, ++str_pivot);
      }
      if(half_count <= 16){
        return "\n" + str_out + "\n";
      }else if(half_count <= 32){
        return str_out + "\n";
      }else{
        return str_out;
      }
    }
    var taskName = this.setTaskName(taskName);

    this.setTimerLabel = function(Name){
      if(rawTaskName != Name)
      {
        var dayString = getDayString();
        this.removeFromLocalStorage(dayString);
        taskName = this.setTaskName(Name);
        $("ul.panel li#tab0 input#button" + id).attr("value", this.getTimerLabel());
        this.saveToLocalStorage(dayString);
      }
    }

    this.getTimerLabel = function(){
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
        state = "running_state";
        $("ul.panel li#tab0 input#button" + id).attr("value", this.getTimerLabel());
      }
      else if(flg == 0)
      {
        state = "stop_state";
        $("ul.panel li#tab0 input#button" + id).attr("value", this.getTimerLabel());
        offsetTime += recentTime - startTime;
        startTime = 0;
        recentTime = 0;
        initializedFlag = false;
      }
    }

    this.loadFromLocalStorage = function(dayString){
      var savedTime = parseInt(localStorage.getItem(this.getLocalStorageKey(dayString)));
      if (isNaN(savedTime))
      {
        offsetTime = 0;
      }else
      {
        offsetTime = savedTime;
      }
      //console.log("Load : " + dayString + "_" + rawTaskName + localStorage.getItem(dayString + "_" + rawTaskName));
    }

    this.saveToLocalStorage = function(dayString){
      localStorage.setItem(this.getLocalStorageKey(dayString), offsetTime + recentTime - startTime);
      //console.log("Save : " + dayString + "_" + rawTaskName + localStorage.getItem(dayString + "_" + rawTaskName));
    }

    this.removeFromLocalStorage = function(dayString){
      localStorage.removeItem(this.getLocalStorageKey(dayString));
      //console.log("Remove : " + dayString + "_" + rawTaskName);
    }

    this.getLocalStorageKey = function(dayString){
      var idString = "";
      if(0 <= id && id <= 9)
      {
        idString += "0" + id;
      }
      else
      {
        idString += id;
      }
      return dayString + "_" + idString + "_" + rawTaskName;
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

  $.get('./database.csv',function(database){
    var dayString = getDayString();
    /*localStorage.clear(); //for Debug
    localStorage.setItem("2013/01/03_00_タスク０", 40000);
    localStorage.setItem("2013/01/03_01_タスク１", 40000);
    localStorage.setItem("2013/01/03_02_その他(Auto)", 40000);*/
    var keys = new Array();
    for(var i = 0; i < localStorage.length; i++){
      var key = localStorage.key(i);
      if(key.substring(0, 10) == dayString)
      {
        keys.push(key);
      }
    }
    keys.sort();
    for(var i = 0; i < keys.length; i++)
    {
      if(keys[i].substring(14) != "その他(Auto)")
      {
        $("ul.panel li#tab0 div dl dd").append($('<br>')).append($('<input type="text">')
          .attr("id", "task" + NumOfTimers).attr("value", keys[i].substring(14)).addClass("task"));
        NumOfTimers++;
      }
    }
    if(NumOfTimers == 0)//日付が変わって最初の実行の場合、csvからロード
    {
      var csv = $.csv()(database);
      $(csv).each(function(index){
        if(index != 0 && this[2] != "その他(Auto)"){
          $("ul.panel li#tab0 div dl dd").append($('<br>')).append($('<input type="text">')
            .attr("id", "task" + NumOfTimers).attr("value", this[2]).addClass("task"));
          NumOfTimers++;
        }
      });
    }
    for(var i = 0; i < NumOfTimers + 1; i++){
      if(i == NumOfTimers)
      {
        timers.push(new Timer(i, "その他(Auto)"));
      }
      else
      {
        timers.push(new Timer(i, $("input#task" + i).attr("value")));
      }
      $("ul.panel li#tab0").append($('<input type="button">').attr("id","button" + i)
        .attr("value", timers[i].getTimerLabel()).addClass("timer").addClass("stop_state"));
      timers[i].loadFromLocalStorage(dayString);
      timers[i].changeTimerState(0);
      timers[i].saveToLocalStorage(dayString);
      timersManagementArray.push("");
    }

    $("input.timer").live("click", function(){
      var button_id = parseInt($(this).attr("id").substring(6));
      if($(this).hasClass("stop_state"))
      {
        $("input.timer").each(function(){
          if($(this).hasClass("running_state"))
          {
            changeState(parseInt($(this).attr("id").substring(6)));
          }
        });
        changeState(button_id);
      }
      else if(button_id != NumOfTimers){
        changeState(button_id);
        changeState(NumOfTimers);
      }
    });

    $("#csv table").append("<tbody>");
    var keys = new Array();
    for(var i = 0; i < localStorage.length; i++){
      var key = localStorage.key(i);
      if(key.substring(0,10).match(/^\d{4}\/\d{2}\/\d{2}$/))
      {
        keys.push(key);
      }
    }
    keys.sort();
    for(var i = 0; i < keys.length; i++)
    {
      var value = localStorage.getItem(keys[i]);
      $("#csv table").append("<tr><td>" + keys[i].substring(0,10) + "</td><td>" + keys[i].substring(11,13)
        + "</td><td>" + keys[i].substring(14) + "</td><td>" + parseInt(value) + "</td></tr>");
    }
    $("#csv table").append("</tbody>");
  });

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
      timers[i].setTimerLabel($("input#task" + i).attr("value"));
    }
    $("#floatWindow").fadeOut("fast");
    return false;
  });

  $("#floatWindow input#task_edit_cancel").click(function(){
    $("#floatWindow").fadeOut("fast");
    return false;
  });

  $("#floatWindow input#task_edit_add").click(function(){
    var other_running_flg = false;
    $("ul.panel li#tab0 div dl dd").append($('<br>')).append($('<input type="text">')
      .attr("id", "task" + NumOfTimers).attr("value", "新規タスク" + NumOfTimers).addClass("task"));
    if($("input#button" + NumOfTimers).hasClass("running_state"))
    {
      other_running_flg = true;
      changeState(NumOfTimers);
    }
    timers[NumOfTimers].removeFromLocalStorage(getDayString());
    timersManagementArray.splice(NumOfTimers, 0, "");
    timers.splice(NumOfTimers, 0, new Timer(NumOfTimers, $("input#task" + NumOfTimers).attr("value")));
    $("ul.panel li#tab0 input#button" + NumOfTimers).attr("id", "button" + (NumOfTimers + 1));
    $("ul.panel li#tab0 input#button" + (NumOfTimers - 1)).after($('<input type="button">').attr("id","button" + NumOfTimers)
      .attr("value", timers[NumOfTimers].getTimerLabel()).addClass("timer").addClass("stop_state"));
    timers[NumOfTimers + 1].incrementId();
    timers[NumOfTimers + 1].saveToLocalStorage(getDayString());
    timers[NumOfTimers].saveToLocalStorage(getDayString());
    NumOfTimers++;
    if(other_running_flg)
    {
      changeState(NumOfTimers);
    }
    //return false;
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

  var changeState = function(button_id){
    var input_button = $("#button" + button_id);
    if(input_button.hasClass("stop_state"))
    {
      input_button.removeClass("stop_state").addClass("running_state");
      timersManagementArray[button_id] = setInterval("timers[" + button_id + "].changeTimerState(1)", 100);
      savingTimer = setInterval("timers[" + button_id + "].saveToLocalStorage(getDayString())", 500);
    }
    else if(input_button.hasClass("running_state"))
    {
      input_button.removeClass("running_state").addClass("stop_state");
      clearInterval(timersManagementArray[button_id]);
      timers[button_id].changeTimerState(0);
      clearInterval(savingTimer);
    }
  }
});

function getDayString(){
  var date = new Date();
  var year = date.getYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (year < 2000)
  {
    year += 1900;
  }
  if (month < 10)
  {
    month = "0" + month;
  }
  if (day < 10)
  {
    day = "0" + day;
  }
  return "" + year + "/" + month + "/" + day;
}

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
