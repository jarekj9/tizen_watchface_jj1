# tizen_watchface_jj1

My first watchface for Galaxy Watch.

It is not present in samsung store.
Installation:

 - Install Tizen Studio
 - In Tizen Studio Package Manager install everything for 4.0 or 5.0 Wearable, Baseline SDK + in Extension SDK tab: Extras -> Samsung Certificate Extension and Wearable Extension
 - Open the project in Tizen Studio
 - Open Device Manager, add Galaxy Watch, connect it, then add certificates:
     https://thecustomizewindows.com/2019/11/connect-galaxy-watch-to-tizen-studio-galaxy-watch-designer/
 - Register on https://api.openweathermap.org for free plan on 'Current weather and forecast', get API key
 - Write API key in js/data.js:
    OPEN_WEATHERMAP_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxx";

If galaxy watch is connected and certificate is added, rightclick on project folder in left bar and chosse : Run As -> Tizen Web Application.
It will install the app on watch and run it. Later it can be chosen from watchfaces list.

Features:
- steps, steps bar-chart in background for last 12 hours; steps start counting from 0 when watchface is started, because it has no access to Samsung Health
- temperature (current - hourly, +3h, +6h, +9h), it also shows time when temperature was updated
- gps coordinates and location name from API (checked at start and once per day)
- sunrise/sunset calculated from gps location


![Screenshot](screenshot.png?raw=true "Screenshot")
