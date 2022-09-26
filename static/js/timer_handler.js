var timerId = null;

$(document).ready(function () {
    var timerDisplay = document.querySelector('div.timer span.timer-span');
    timerDisplay.addEventListener('click', () => {
        clearInterval(timerId);
        timerDisplay.classList.add('hidden');
    });

    let setTimerDialog = document.getElementById('modal-set-timer');
    let addTimerBtn = document.querySelector('div.add-timer-group > ul > li');
    addTimerBtn.addEventListener('click', () => {
        setTimerDialog.showModal();
    });

    let timerDialogCancelBtn = document.querySelector('#modal-set-timer button.timer-cancel');
    timerDialogCancelBtn.addEventListener('click', () => {
        setTimerDialog.close();
    });

    let timerDialogSetBtn = document.querySelector('#modal-set-timer button.timer-set');
    timerDialogSetBtn.addEventListener('click', () => {
        if (timerId !== null) {
            clearInterval(timerId);
        }
        let timerValue = document.querySelector('input#timer-input').value;
        timerDisplay.innerHTML = (timerValue < 10 ? "0" + timerValue : timerValue) + ":00";
        timerDisplay.classList.remove('hidden');
        let duration = timerValue * 60;
        startTimer(duration);
        setTimerDialog.close();
    });

    function startTimer(duration) {
        var timer = duration - 1;
        timerId = setInterval(function () {
            let mins = parseInt(timer / 60, 10);
            let secs = parseInt(timer % 60, 10);

            mins = mins < 10 ? "0" + mins : mins;
            secs = secs < 10 ? "0" + secs : secs;
            timerDisplay.innerHTML = mins + ":" + secs;

            if (--timer < 0) {
                clearInterval(timerId);
                timerDisplay.classList.add('hidden');
            }
        }, 1000);
    }
});