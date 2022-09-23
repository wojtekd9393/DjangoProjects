var timerId = null;

$(document).ready(function () {
    let startTimerBtn = document.querySelector('div.timer > button#start-timer');
    var timerValue = document.querySelector('div.timer > span');
    var duration = parseTimerInput(timerValue.innerHTML);

    let up = document.getElementById('timer-up');
    let down = document.getElementById('timer-down');

    startTimerBtn.addEventListener('click', () => {
        if (timerId !== null) {
            clearInterval(timerId);
        }
        startTimer(duration);
    });

    function startTimer(duration) {
        var timer = duration;
        timerId = setInterval(function () {
            let mins = parseInt(timer / 60, 10);
            let secs = parseInt(timer % 60, 10);

            mins = mins < 10 ? "0" + mins : mins;
            secs = secs < 10 ? "0" + secs : secs;
            timerValue.innerHTML = mins + ":" + secs;

            if (--timer < 0) {
                clearInterval(timerId);
            }
        }, 1000);
    }

    function parseTimerInput(timerInput) {
        return getMinutes(timerInput) * 60 + getSeconds(timerInput);
    }

    up.addEventListener('click', () => {
        let currTimerValue = timerValue.innerHTML;
        let newMinsValue = getMinutes(currTimerValue) + 1;
        let currSecsValue = getSeconds(currTimerValue);
        if (newMinsValue > 10) {
            newMinsValue = 10;
        }
        updateTimer(newMinsValue, currSecsValue);
    })

    down.addEventListener('click', () => {
        let currTimerValue = timerValue.innerHTML;
        let newMinsValue = getMinutes(currTimerValue) - 1;
        let currSecsValue = getSeconds(currTimerValue);
        if (newMinsValue < 1) {
            newMinsValue = 1;
        }
        updateTimer(newMinsValue, currSecsValue);
    })

    function updateTimer(mins, secs) {
        timerValue.innerHTML = (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
        duration = parseTimerInput(timerValue.innerHTML);
        clearInterval(timerId);
    }

    function getMinutes(timerValue) {
        return parseInt(timerValue.split(":")[0], 10);
    }

    function getSeconds(timerValue) {
        return parseInt(timerValue.split(":")[1], 10);
    }
});