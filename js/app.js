/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
    var timerUpdateDate = 0,
        hourWeatherUpdated = 0,
        steps = 0,
        flagConsole = false,
        flagDigital = false,
        battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery,
        interval,
        BACKGROUND_URL = "url('./images/bg.jpg')",
        arrDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        arrMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // file read
    var res,file,text,jsonInit,obj,jsonString;

    /**
     * Updates the date and sets refresh callback on the next day.
     * @private
     * @param {number} prevDay - date of the previous day
     */
    function updateDate(prevDay) {
        var nextInterval,
            datetime = tizen.time.getCurrentDateTime(),
            strDay = document.getElementById("str-day"),
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
        strDay.innerHTML = strFullDate;

        
     
        // If an updateDate timer already exists, clear the previous timer.
        if (timerUpdateDate) {
            clearTimeout(timerUpdateDate);
        }

        // Set next timeout for date update.
        timerUpdateDate = setTimeout(function() {
            updateDate(getDay);
        }, nextInterval);
    }
    
    function updateWeather() {
        var timeout = 1800000;
        var datetime = tizen.time.getCurrentDateTime();
        var hour = datetime.getHours();
        if (hour != hourWeatherUpdated) {
        	console.log("Hours different, update weather!");
            stopPedometer();    // FOR TEST RESET PEDO EVERY HOUR
            startPedometer();
            getWeather();
            hourWeatherUpdated = hour;
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
            strAmpm = document.getElementById("str-ampm"),
            datetime = tizen.time.getCurrentDateTime(),
            hour = datetime.getHours(),
            minute = datetime.getMinutes();

        strHours.innerHTML = hour;
        strMinutes.innerHTML = minute;

        if (hour < 12) {
            strAmpm.innerHTML = "AM";
            if (hour < 10) {
                strHours.innerHTML = "0" + hour;
            }
        } else {
            strAmpm.innerHTML = "PM";
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
        var batteryDiv = document.getElementById("battery");
        batteryDiv.textContent = Math.round(battery.level * 100) + "%";
    }

    /**
     * @private
     */
    function updateWatch() {
        updateTime();
        updateDate(0);
        updateWeather();
    }
    
    
    
    /**
     * Steps
     */
    function onsuccessCB(pedometerInfo) {
      console.log("Step status: " + pedometerInfo.stepStatus);
      console.log("Cumulative total step count: " + pedometerInfo.cumulativeTotalStepCount);
      
       var steps = document.getElementById('steps');
       steps.innerHTML = pedometerInfo.cumulativeTotalStepCount;
    }
    function onerrorCB(error) {
      console.log("Error occurs, name: " + error.name + ", message: " + error.message);
    }
    function onchangedCB(pedometerdata) {
      console.log("From now on, you will be notified when the pedometer data changes");
      /* To get the current data information. */
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
        var xhr = new XMLHttpRequest();
        var datetime = tizen.time.getCurrentDateTime();
        xhr.open('GET', WEATHER_URL, true);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200) {
                    console.log('Weather server did not respond...');
                    return;
                }
                console.log('Weather connection ok');
                var resp = JSON.parse(this.responseText);
                var weatherSpan = document.getElementById('weather-val');
                var debugDiv = document.getElementById('debug');   //DEBUG
                temp =  Math.round(resp['current']['temp']);
                weatherSpan.innerHTML = temp;
                debugDiv.innerHTML = datetime.getHours() + ':' + datetime.getMinutes();    //DEBUG
            } 
        }
        xhr.send();
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
        updateWeather();
    }

    window.onload = init();
}());
