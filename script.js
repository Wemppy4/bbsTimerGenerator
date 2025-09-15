const checkboxes = document.querySelectorAll('.time_checkbox');
const generateBtn = document.getElementById('generateTimerBtn');

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const input = event.target.previousElementSibling;
        if (input && input.classList.contains('time_input')) {
            input.classList.toggle('off', event.target.checked);
        }
    });
});

generateBtn.addEventListener('click', () => {
    const getValue = (blockSelector, unit) => {
        const timeBlock = document.querySelector(`${blockSelector} .${unit.toLowerCase()}`);
        if (!timeBlock) return '00'; // Failsafe

        const input = timeBlock.querySelector('.time_input');
        const checkbox = timeBlock.querySelector('.time_checkbox');
        
        if (checkbox && checkbox.checked) {
            return '-';
        }
        return input ? input.value.padStart(2, '0') : '00';
    };

    const startTime = new Map([
        ['hours', getValue('.start_time_block', 'Hours')],
        ['minutes', getValue('.start_time_block', 'Minutes')],
        ['seconds', getValue('.start_time_block', 'Seconds')]
    ]);

    const endTime = new Map([
        ['hours', getValue('.end_time_block', 'Hours')],
        ['minutes', getValue('.end_time_block', 'Minutes')],
        ['seconds', getValue('.end_time_block', 'Seconds')]
    ]);

    if (!checkTimeValidity(startTime) || !checkTimeValidity(endTime)) {
        alert('Invalid time input. Please check your values.');
        return;
    } else if (startTime.get('hours') === '-' && startTime.get('minutes') === '-' && startTime.get('seconds') === '-') {
        alert('Start time cannot be completely disabled.');
        return;
    } else if (endTime.get('hours') === '-' && endTime.get('minutes') === '-' && endTime.get('seconds') === '-') {
        alert('End time cannot be completely disabled.');
        return;
    } else if (startTime.get('hours') === '-' && startTime.get('minutes') === '-' && endTime.get('hours') === '-' && endTime.get('minutes') === '-') {
        alert('Both start and end times cannot have hours and minutes disabled simultaneously.');
        return;
    }
    const timerJson = generateTimer(startTime, endTime);
    console.log(JSON.stringify(timerJson, null, 2)); // For debugging: log the result
    downloadJson(timerJson, `bbs_timer_${getValue('.start_time_block', 'Hours')}${getValue('.start_time_block', 'Minutes')}${getValue('.start_time_block', 'Seconds')}_to_${getValue('.end_time_block', 'Hours')}${getValue('.end_time_block', 'Minutes')}${getValue('.end_time_block', 'Seconds')}.json`);
});

function checkTimeValidity(timeMap) {
    const h = parseInt(timeMap.get('hours'), 10);
    const m = parseInt(timeMap.get('minutes'), 10);
    const s = parseInt(timeMap.get('seconds'), 10);
    if (h < 0 || h > 99) return false;
    if (m < 0 || m > 59) return false;
    if (s < 0 || s > 59) return false;
    return true;
}

function generateTimer(startTime, endTime) {
    const timeToSeconds = (timeMap) => {
        const h = parseInt(timeMap.get('hours'), 10) || 0;
        const m = parseInt(timeMap.get('minutes'), 10) || 0;
        const s = parseInt(timeMap.get('seconds'), 10) || 0;
        return h * 3600 + m * 60 + s;
    };

    let startTotalSeconds = timeToSeconds(startTime);
    const endTotalSeconds = timeToSeconds(endTime);

    const timer = {
        text: {
            keyframes: [],
            type: "string"
        }
    };

    let tick = 0;
    const duration = Math.abs(startTotalSeconds - endTotalSeconds);
    const step = startTotalSeconds > endTotalSeconds ? -1 : 1;

    for (let i = 0; i <= duration; i++) {
        const currentTotalSeconds = startTotalSeconds + (i * step);

        const h = Math.floor(currentTotalSeconds / 3600);
        const m = Math.floor((currentTotalSeconds % 3600) / 60);
        const s = currentTotalSeconds % 60;

        const parts = [];
        if (startTime.get('hours') !== '-') {
            parts.push(String(h).padStart(2, '0'));
        }
        if (startTime.get('minutes') !== '-') {
            parts.push(String(m).padStart(2, '0'));
        }
        if (startTime.get('seconds') !== '-') {
            parts.push(String(s).padStart(2, '0'));
        }
        
        const timeString = parts.join(':');

        timer.text.keyframes.push({
            duration: 0.0,
            interp: "linear",
            tick: tick,
            value: timeString
        });

        tick += 20;
    }

    return timer;
}

function downloadJson(jsonData, filename) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}