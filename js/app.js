(function() {
    var datetime = tizen.time.getCurrentDateTime(),
        timerUpdateDate = 0,
        hourLastUpdate = 0,
        latitude = '53.1235',
        longitude = '18.0084',
        locationName = "",
        previousDay = 0,
        flagConsole = false,
        flagDigital = false,
        battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery,
        interval,
        BACKGROUND_URL = "url('./images/bg.jpg')",
        arrDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        arrMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    	arrStepsHourly = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    	currentStepsTotal = 0,
    	previousStepsTotal = 0,
    	timeColor = "#FFFFFF";
    
    // file read
    var res,file,text,jsonInit,obj,jsonString;

    /**
     * Updates the date and sets refresh callback on the next day.
     * @private
     * @param {number} prevDay - date of the previous day
     */
    function updateDate(prevDay) {
        var nextInterval,
            strDay = document.getElementById("day"),
            strWeekDay = document.getElementById("weekDay"),
            strMonth = document.getElementById("month"),
            strFullDate,
            getDay = datetime.getDay(),
            getDate = datetime.getDate(),
            getMonth = datetime.getMonth();
            getYear = datetime.getFullYear();

        // Check the update condition.
        // if prevDate is '0', it will always update the date.
        if (prevDay !== null) {
            if (prevDay === getDay) {
                /**
                 * If the date was not changed (meaning that something went wrong),
                 * call updateDate again after a second.
                 */
                nextInterval = 1000;
            } else {
                /**
                 * If the day was changed,
                 * call updateDate at the beginning of the next day.
                 */
                // Calculate how much time is left until the next day.
                nextInterval =
                    (23 - datetime.getHours()) * 60 * 60 * 1000 +
                    (59 - datetime.getMinutes()) * 60 * 1000 +
                    (59 - datetime.getSeconds()) * 1000 +
                    (1000 - datetime.getMilliseconds()) +
                    1;
            }
        }

        if (getDate < 10) {
            getDate = "0" + getDate;
        }

        strFullDate = arrDay[getDay] + " " + getDate + " " + arrMonth[getMonth];
        //strDay.innerHTML = strFullDate;
        strWeekDay.innerHTML = arrDay[getDay] + "&nbsp;";
        strDay.innerHTML = getDate + "&nbsp;";
        strMonth.innerHTML = arrMonth[getMonth];

        
     
        // If an updateDate timer already exists, clear the previous timer.
        if (timerUpdateDate) {
            clearTimeout(timerUpdateDate);
        }

        // Set next timeout for date update.
        timerUpdateDate = setTimeout(function() {
            updateDate(getDay);
        }, nextInterval);
    }
    
    function updateHourly() {
        var hour = datetime.getHours();
        if (hour != hourLastUpdate) {
            getWeather();
            hourLastUpdate = hour;
        }
    }

    function onceADay() {
        var day = datetime.getDay();
        if (day != previousDay) {
        	currentStepsTotal = previousStepsTotal = 0;
            stopPedometer();
            startPedometer();
            previousDay = day;
            getLocation();
            getSuntime();
        }
    }

    /**
     * Updates the current time.
     * @private
     */
    function updateTime() {
        var strHours = document.getElementById("str-hours"),
            strConsole = document.getElementById("str-console"),
            strMinutes = document.getElementById("str-minutes"),
            hour = datetime.getHours(),
            minute = datetime.getMinutes();

        strHours.innerHTML = hour;
        strMinutes.innerHTML = minute;

        if (hour < 12) {
            if (hour < 10) {
                strHours.innerHTML = "0" + hour;
            }
        }

        if (minute < 10) {
            strMinutes.innerHTML = "0" + minute;
        }

        // Each 0.5 second the visibility of flagConsole is changed.
        if(flagDigital) {
            if (flagConsole) {
                strConsole.style.visibility = "visible";
                flagConsole = false;
            } else {
                strConsole.style.visibility = "hidden";
                flagConsole = true;
            }
        }
        else {
            strConsole.style.visibility = "visible";
            flagConsole = false;
        }
    }

    /**
     * Sets to background image as BACKGROUND_URL,
     * and starts timer for normal digital watch mode.
     * @private
     */
    function initDigitalWatch() {
        flagDigital = true;
        document.getElementById("digital-body").style.backgroundImage = BACKGROUND_URL;
        interval = setInterval(updateTime, 500);
    }

    /**
     * Clears timer and sets background image as none for ambient digital watch mode.
     * @private
     */
    function ambientDigitalWatch() {
        flagDigital = false;
        clearInterval(interval);
        document.getElementById("digital-body").style.backgroundImage = "none";
        updateTime();
    }

    /**
     * Gets battery state.
     * Updates battery level.
     * @private
     */
    function getBatteryState() {
    	var mainCircle = document.getElementById("mainCircle");
        mainCircle.className = "c100 center p" + Math.round(battery.level * 100);
    }

    /**
     * @private
     */
    function updateWatch() {
        datetime = tizen.time.getCurrentDateTime();
        updateTime();
        updateDate(0);
        updateHourly();
        onceADay();
    }
    
    
    
    /**
     * Steps
     */
    function onsuccessCB(pedometerInfo) {
       //console.log("Step status: " + pedometerInfo.stepStatus);
       var stepsDiv = document.getElementById('steps');
       currentStepsTotal = pedometerInfo.cumulativeTotalStepCount;
       stepsDiv.innerHTML = currentStepsTotal;
    }
    function onerrorCB(error) {
      console.log("Error occurs, name: " + error.name + ", message: " + error.message);
    }
    function onchangedCB(pedometerdata) {
      tizen.humanactivitymonitor.getHumanActivityData("PEDOMETER", onsuccessCB, onerrorCB);
    }
    function startPedometer() {
        tizen.humanactivitymonitor.start("PEDOMETER", onchangedCB);
    }
    function stopPedometer() {
        tizen.humanactivitymonitor.stop("PEDOMETER");
    }

    /**
     * Filesystem
     */   
    function createFile(){
        tizen.filesystem.resolve("documents", function(dir) {
            res = dir.createDirectory("res");
            file = res.createFile("data.json");

            file.openStream(
                    "w",
                    function(fs) {
                        jsonInit = '{"data1":"a","data2":"b"}';
                        fs.write(jsonInit);
                        //alert("JSON file Created");
                        fs.close();
                    }, function(e) {
                        console.log("Error " + e.message);
                    }, "UTF-8");
            });
        }
    function addInfo(){ 
        tizen.filesystem.resolve("documents", function(dir) {
               file = dir.resolve("res/data.json");  
               file.openStream(
                "rw",
                function(fs) {
                    text = fs.read(file.fileSize);               
                    var obj  = JSON.parse(text);
                    obj.data3 = 'c';
                    jsonString =  JSON.stringify(obj);
                    fs.position = 0;
                    fs.write(jsonString);
                    fs.close();
                    //alert("New Info added on data3 key");           
                }, function(e) {
                    console.log("Error " + e.message);
                }, "UTF-8");
            });
        }

    function readFromFile(){
        tizen.filesystem.resolve("documents", function(dir) 
                {
                   var file = dir.resolve("res/data.json");
                   file.openStream(
                        "r", 
                        function(fs) {
                            text = fs.read(file.fileSize);       
                            fs.close();
                            obj  = JSON.parse(text);
                            console.log("Test read --> value on data2:" +obj.data2);
                            console.log("Test read --> value on data3:" +obj.data3);
                        }, function(e) {
                            console.log("Error " + e.message);
                        }, "UTF-8");
                });
        } 
    
    /**
     * Reads weather API
     */
    function getWeather() {
    	
    	function getColorByWeather(weatherStringH1, weatherStringH2, weatherStringH3) {
    		if (weatherStringH1 == "Rain" || weatherStringH2 == "Rain" || weatherStringH3 == "Rain") return "#008cff";
    		if ((weatherStringH1 == "Clear" && weatherStringH2 == "Clear") || 
    			(weatherStringH2 == "Clear" && weatherStringH3 == "Clear") ||
    			(weatherStringH1 == "Clear" && weatherStringH3 == "Clear")) return "#FFD700";
    		return "#FFFFFF";
    	}
    	
        var xhr = new XMLHttpRequest();
		WEATHER_URL = WEATHER_URL.replace('<LAT>', latitude);
		WEATHER_URL = WEATHER_URL.replace('<LON>', longitude);
        xhr.open('GET', WEATHER_URL, true);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200) {
                    console.log('Weather server did not respond...');                   
                    return;
                }
                //console.log('Weather connection ok');
                var resp = JSON.parse(this.responseText);
                var weatherSpan = document.getElementById('weather-val');
                var weatherSpan3 = document.getElementById('weather-val3');
                var weatherSpan6 = document.getElementById('weather-val6');
                var weatherSpan9 = document.getElementById('weather-val9');
                var weatherUpdateTimeDiv = document.getElementById('weatherUpdateTime');
                var temp =  Math.round(resp['current']['temp']);
                var temp3 =  Math.round(resp['hourly'][3]['temp']);
                var temp6 =  Math.round(resp['hourly'][6]['temp']);
                var temp9 =  Math.round(resp['hourly'][9]['temp']);
                var tempColor =  getColorByWeather(resp['hourly'][0]['weather'][0]['main'], resp['hourly'][0]['weather'][0]['main'], resp['hourly'][0]['weather'][0]['main']);
                var temp3Color =  getColorByWeather(resp['hourly'][1]['weather'][0]['main'], resp['hourly'][2]['weather'][0]['main'], resp['hourly'][3]['weather'][0]['main']);
                var temp6Color =  getColorByWeather(resp['hourly'][4]['weather'][0]['main'], resp['hourly'][5]['weather'][0]['main'], resp['hourly'][6]['weather'][0]['main']);
                var temp9Color =  getColorByWeather(resp['hourly'][7]['weather'][0]['main'], resp['hourly'][8]['weather'][0]['main'], resp['hourly'][9]['weather'][0]['main']);
                weatherSpan.innerHTML = temp;
                weatherSpan3.innerHTML = temp3;
                weatherSpan6.innerHTML = temp6;
                weatherSpan9.innerHTML = temp9;
                weatherSpan.style.color = tempColor;
                weatherSpan3.style.color = temp3Color;
                weatherSpan6.style.color = temp6Color;
                weatherSpan9.style.color = temp9Color;
                
                weatherUpdateTimeDiv.innerHTML = getHourStr() + ':' + getMinuteStr();
            } 
        }
        xhr.send();
    } 
    
    function timePartAddZero(timePart) {
    	return timePart < 10 ? "0" + timePart : timePart;
    }
    function getMinuteStr() {
        var minute = datetime.getMinutes(),
            strMinutes = timePartAddZero(minute);
        return strMinutes;
    }
    function getHourStr() {
        var hour = datetime.getHours(),
            strHours = timePartAddZero(hour);
        return strHours;
    }
    
    function getLocation() {
    	console.log("Location Permission: " + tizen.ppm.checkPermission("http://tizen.org/privilege/location"));
    	var options = {enableHighAccuracy: false, maximumAge: Infinity, timeout: 3600000};
        var locationDiv = document.getElementById('location');

    	function successCallback(position)
    	{
    		console.log(position.coords);
    		latitude = position.coords.latitude;
    		longitude = position.coords.longitude;
    		latRounded = Math.round( latitude * 100 + Number.EPSILON ) / 100;
    		lonRounded = Math.round( longitude * 100 + Number.EPSILON ) / 100;
    		locationDiv.innerHTML = "lat:&nbsp"+latRounded + " " +"lon:&nbsp" + lonRounded;
    	}

    	function errorCallback(error)
    	{
    		console.log(error);
    	}
    	navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    	getLocationName();
    }
    
    function getLocationName() {
        var xhr = new XMLHttpRequest();
        REV_GEOLOCATION_URL = REV_GEOLOCATION_URL.replace('<LAT>', latitude);
        REV_GEOLOCATION_URL = REV_GEOLOCATION_URL.replace('<LON>', longitude);
        xhr.open('GET', REV_GEOLOCATION_URL, true);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200) {
                    console.log('Geolocation server did not respond...');
                    return;
                }
                //console.log('Geolocation connection ok');
                var resp = JSON.parse(this.responseText);
                var locationNameSpan = document.getElementById('locationName-val');
                var locationName = resp[0]['name'];
                locationNameSpan.innerHTML = locationName;
            } 
        }
        xhr.send();
    }
    

    
    function getSuntime() {
		var times = SunCalc.getTimes(new Date(), latitude, longitude),
			sunriseMinutes = timePartAddZero(times.sunrise.getMinutes()),
			sunriseHours = timePartAddZero(times.sunrise.getHours()),
			sunsetMinutes = timePartAddZero(times.sunset.getMinutes()),
			sunsetHours = timePartAddZero(times.sunset.getHours()),
			sunriseStr = sunriseHours + ':' + sunriseMinutes,
			sunsetStr = sunsetHours + ':' + sunsetMinutes;

		document.getElementsByClassName('circleTextBottomLeft char1')[0].innerHTML = '&#8593;';
		document.getElementsByClassName('circleTextBottomLeft char2')[0].innerHTML = sunriseStr[0];
		document.getElementsByClassName('circleTextBottomLeft char3')[0].innerHTML = sunriseStr[1];
		document.getElementsByClassName('circleTextBottomLeft char4')[0].innerHTML = ':';
		document.getElementsByClassName('circleTextBottomLeft char5')[0].innerHTML = sunriseStr[3];
		document.getElementsByClassName('circleTextBottomLeft char6')[0].innerHTML = sunriseStr[4];
		document.getElementsByClassName('circleTextBottomLeft char7')[0].innerHTML = ' ';
		document.getElementsByClassName('circleTextBottomLeft char8')[0].innerHTML = '&#8595;';
		document.getElementsByClassName('circleTextBottomLeft char9')[0].innerHTML = sunsetStr[0];
		document.getElementsByClassName('circleTextBottomLeft char10')[0].innerHTML = sunsetStr[1];
		document.getElementsByClassName('circleTextBottomLeft char11')[0].innerHTML = ':';
		document.getElementsByClassName('circleTextBottomLeft char12')[0].innerHTML = sunsetStr[3];
		document.getElementsByClassName('circleTextBottomLeft char13')[0].innerHTML = sunsetStr[4];
    }
    
    function openWeather() { 	
    	tizen.application.launch("com.samsung.weather");
    }
    
    function drawStepsChart() {
    	var hourMinus12 = datetime.getHours() - 12;
    	if (hourMinus12 < 0) {
    		hourMinus12 = hourMinus12 + 24;
    	}
    	var stepsChartDiv = document.getElementById('stepsChartBars');
    	var stepsChartDivContent = '<div class="stepsChartElement" style="background-color: black; width:30px;">'+ hourMinus12 +'h</div>'+
		        				   '<div class="stepsChartFake" style="height: 200px;"></div> <!-- To force div to max height of 200px -->';
    	for (var i = 0; i < arrStepsHourly.length; i++) {
    		stepsChartDivContent += '<div class="stepsChartElement" style="height: '+ arrStepsHourly[i]/10 +'px;"></div>';
    	}
    	stepsChartDivContent += '<div class="stepsChartElement" style="background-color: black; width:30px;">'+datetime.getHours()+'h</div>';
    	stepsChartDiv.innerHTML = stepsChartDivContent;
    }
    
    function changeTimeColor() {
    	var root = document.querySelector(':root');
    	if (timeColor == "#FFFFFF") {
    		timeColor = "#cc0000";
    		root.style.setProperty('--circle-full-color', '#cc0000');
    	}
    	else {
    		timeColor = "#FFFFFF";
    		root.style.setProperty('--circle-full-color', '#aaaaaa');
    	}
    	document.getElementById('str-hours').style.color = timeColor;
    	document.getElementById('str-minutes').style.color = timeColor;
    }
    
    /**
     * Binds events.
     * @private
     */
    function bindEvents() {
        // add eventListener for battery state
        battery.addEventListener("chargingchange", getBatteryState);
        battery.addEventListener("chargingtimechange", getBatteryState);
        battery.addEventListener("dischargingtimechange", getBatteryState);
        battery.addEventListener("levelchange", getBatteryState);
        document.querySelector("#weatherAll").addEventListener("click", openWeather);
        document.querySelector("#location").addEventListener("click", getLocation);
        document.querySelector("#time").addEventListener("click", changeTimeColor);

        // add eventListener for timetick
        window.addEventListener("timetick", function() {
            ambientDigitalWatch();
        });

        // add eventListener for ambientmodechanged
        window.addEventListener("ambientmodechanged", function(e) {
            if (e.detail.ambientMode === true) {
                // rendering ambient mode case
                ambientDigitalWatch();

            } else {
                // rendering normal digital mode case
                initDigitalWatch();
            }
        });

        // add eventListener to update the screen immediately when the device wakes up.
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                updateWatch();
            }
        });

        // add event listeners to update watch screen when the time zone is changed.
        tizen.time.setTimezoneChangeListener(function() {
            updateWatch();
        });
    }

    /**
     * Initializes date and time.
     * Sets to digital mode.
     * @private
     */
    function init() {
        initDigitalWatch();
        updateDate(0);
        bindEvents();
        startPedometer();
        getLocation();
    	getSuntime();
        updateHourly();
    }

    window.onload = init();
}());
