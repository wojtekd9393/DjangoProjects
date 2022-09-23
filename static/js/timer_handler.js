var timerId = null;

$(document).ready(function () {
    let startTimerBtn = document.querySelector('div.timer > button#start-timer');
    var timerInitialValue = document.querySelector('div.timer > span');
    let duration = parseTimerInput(timerInitialValue.innerHTML);

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
            timerInitialValue.innerHTML = mins + ":" + secs;

            if (--timer < 0) {
                console.log("Time expired!");
                clearInterval(timerId);
            }
        }, 1000);
    }

    function parseTimerInput(initialTimeValue) {
        let parts = initialTimeValue.split(":");

        let mins = parseInt(parts[0], 10);
        let secs = parseInt(parts[1], 10);

        return mins * 60 + secs;
    }

    let up = document.getElementById('timer-up');
    let down = document.getElementById('timer-down');

    up.addEventListener('click', () => {
        let currTimerValue = document.querySelector('div.timer > span').innerHTML;
        let newMinsValue = parseInt(currTimerValue.split(":")[0], 10) + 1;
        if (newMinsValue > 10) {
            newMinsValue = 10;
        }
        let currSecsValue = parseInt(currTimerValue.split(":")[1], 10);
        document.querySelector('div.timer > span').innerHTML = 
        (newMinsValue < 10 ? "0" + newMinsValue : newMinsValue) + ":" + (currSecsValue < 10 ? "0" + currSecsValue : currSecsValue);
        duration = parseTimerInput(document.querySelector('div.timer > span').innerHTML);
        clearInterval(timerId);
    })

    down.addEventListener('click', () => {
        let currTimerValue = document.querySelector('div.timer > span').innerHTML;
        let newMinsValue = parseInt(currTimerValue.split(":")[0], 10) - 1;
        if (newMinsValue < 1) {
            newMinsValue = 1;
        }
        let currSecsValue = parseInt(currTimerValue.split(":")[1], 10);
        document.querySelector('div.timer > span').innerHTML = 
        (newMinsValue < 10 ? "0" + newMinsValue : newMinsValue) + ":" + (currSecsValue < 10 ? "0" + currSecsValue : currSecsValue);
        duration = parseTimerInput(document.querySelector('div.timer > span').innerHTML);
        clearInterval(timerId);
    })
});