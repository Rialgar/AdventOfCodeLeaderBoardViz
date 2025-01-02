function formatNum(num, len=2, pad='0'){
    let out = num.toString()
    while(out.length < len){
        out = pad + out;
    }
    return out;
}

function formatTime(totalseconds){
    const hours = Math.floor(totalseconds/60/60)
    const minutes = Math.floor((totalseconds - hours*60*60) / 60)
    const seconds = totalseconds - hours*60*60 - minutes*60
    return `${formatNum(hours, 3, ' ')}:${formatNum(minutes)}:${formatNum(seconds)}`
}

function formatDate(date){
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

let maxNameLen = 0

function formatName(name){
    let out = name
    while(out.length < maxNameLen-1){
        out = ' ' + out + ' '
    }
    if(out.length < maxNameLen){
        out = ' ' + out
    }
    return out
}

const form = document.getElementById('form');

if(localStorage.json){
    form.json.value = localStorage.json
}

const analyzeDiv = document.getElementById('AnalyzeDiv');
const timelineDiv = document.getElementById('TimelineDiv');
const timeToSecondDiv = document.getElementById('TimeToSecondDiv');

document.getElementById('Analyze').addEventListener('click', function (event) {
    event.preventDefault();

    analyzeDiv.style.display = 'block';
    analyzeDiv.innerHTML = '';
    timelineDiv.style.display = 'none';
    timeToSecondDiv.style.display = 'none';

    const json = form.json.value
    localStorage.json = json
    const data = JSON.parse(json)
    for(playerId in data.members){
        if(!data.members[playerId].name){
            data.members[playerId].name = `anon${playerId}`;
        }
    }
    const days = [];
    for( let i=0; i < 25; i++){
        const day = {
            label: (i+1).toString(),
            first: [],
            second: []
        }
        for(playerId in data.members){
            maxNameLen = Math.max(maxNameLen, data.members[playerId].name.length);
            if(data.members[playerId].completion_day_level[day.label]){
                const playerDay = data.members[playerId].completion_day_level[day.label];
                if(playerDay && playerDay[1]){
                    day.first.push({
                        playerId: playerId,
                        name: data.members[playerId].name,
                        time: playerDay[1].get_star_ts
                    })
                }
                if(playerDay && playerDay[2]){
                    day.second.push({
                        playerId: playerId,
                        name: data.members[playerId].name,
                        time: playerDay[2].get_star_ts
                    })
                }
            }
        }
        days.push(day)
    }
    days.forEach(day => {
        day.first.sort((a, b) => a.time - b.time)
        day.second.sort((a, b) => a.time - b.time)

        const p1 = document.createElement('p');
        p1.className = 'privboard-row';
        p1.textContent = `${formatNum(day.label)}-1: `
        for(let i = 0; i < day.first.length; i++){
            if(i>0){
                delta = day.first[i].time - day.first[i-1].time
                p1.textContent += ` > ${formatTime(delta)} > `
            } else {
                const date = new Date(day.first[i].time * 1000)
                p1.textContent += `${formatDate(date)} > `
            }
            p1.textContent += formatName(day.first[i].name)
        }
        analyzeDiv.appendChild(p1)

        const p2 = document.createElement('p');
        p2.className = 'privboard-row';
        p2.textContent = `${formatNum(day.label)}-2: `
        for(let i = 0; i < day.second.length; i++){
            if(i>0){
                delta = day.second[i].time - day.second[i-1].time
                p2.textContent += ` > ${formatTime(delta)} > `
            } else {
                const date = new Date(day.second[i].time * 1000)
                p2.textContent += `${formatDate(date)} > `
            }
            p2.textContent += formatName(day.second[i].name)
        }
        analyzeDiv.appendChild(p2)
    });
});

document.getElementById('Timeline').addEventListener('click', function (event) {
    event.preventDefault();

    analyzeDiv.style.display = 'none';
    timelineDiv.style.display = 'block';
    timelineDiv.innerHTML = '';
    timeToSecondDiv.style.display = 'none';

    const json = form.json.value
    localStorage.json = json
    const data = JSON.parse(json)
    for(playerId in data.members){
        if(!data.members[playerId].name){
            data.members[playerId].name = `anon${playerId}`;
        }
    }

    const container = document.createElement('div');
    timelineDiv.appendChild(container);

    container.className = 'timeline';

    let offset = 0;
    let zoom = 1;
    container.style.setProperty('--offset', offset);
    container.style.setProperty('--zoom', zoom);

    let earliest = Number.MAX_SAFE_INTEGER;
    let latest = 0;

    const members = Object.values(data.members);
    members.sort((a, b) => b.local_score - a.local_score);
    for(member of members){
        const rowContainer = document.createElement('div');
        container.appendChild(rowContainer);

        const nameDiv = document.createElement('div');
        nameDiv.textContent = `${member.name} (${member.local_score})`;
        rowContainer.appendChild(nameDiv);

        const row = document.createElement('div');
        rowContainer.appendChild(row);

        row.className = 'row';

        for(let [index, day] of Object.entries(member.completion_day_level)){
            if(day[1]){
                earliest = Math.min(earliest, day[1].get_star_ts);
                latest = Math.max(latest, day[1].get_star_ts);
                const star = document.createElement('a');
                row.appendChild(star);

                star.className = "privboard-star-firstonly timeline-item timeline-star";
                star.style.setProperty('--time', day[1].get_star_ts);
                star.textContent = "*";

                const date = new Date(day[1].get_star_ts * 1000);
                star.title = 'Day ' + index + ', Part 1, ' + formatDate(date);

                star.href = `https://adventofcode.com/${data.event}/day/${index}`;
            }
            if(day[2]){
                latest = Math.max(latest, day[2].get_star_ts);
                const star = document.createElement('a');
                row.appendChild(star);

                star.className = "privboard-star-both timeline-item timeline-star";
                star.style.setProperty('--time', day[2].get_star_ts);
                star.textContent = "*";

                const date = new Date(day[2].get_star_ts * 1000);
                star.title = 'Day ' + index + ', Part 2, ' + formatDate(date);

                star.href = `https://adventofcode.com/${data.event}/day/${index}`;
            }
        }

        row.addEventListener('wheel', (event) => {
            if(event.ctrlKey || event.metaKey){
                event.preventDefault();
                const mouseInRow = (event.clientX - row.clientLeft) / row.clientWidth;
                const mouseOffset = mouseInRow / zoom * (latest-earliest) - offset + earliest;
                if(event.deltaY < 0){
                    zoom *= 1.05;
                } else {
                    zoom /= 1.05;
                }
                const changedMouseOffset = mouseInRow / zoom * (latest-earliest) - offset + earliest;
                offset += changedMouseOffset - mouseOffset;
                container.style.setProperty('--offset', offset);
                container.style.setProperty('--zoom', zoom);
            }
        });
        row.addEventListener('click', (event) => {
            event.preventDefault();
            offset = 0;
            zoom = 1;
            container.style.setProperty('--offset', offset);
            container.style.setProperty('--zoom', zoom);
        })
    }

    const earliestStart = new Date(earliest*1000);
    if(earliestStart.getUTCHours() < 5){
        earliestStart.setUTCDate(earliestStart.getUTCDate()-1);
    }
    earliestStart.setUTCHours(5);

    const earliestLine = earliestStart.valueOf()/1000;
    let lastLine = earliestLine;

    for(let time = earliestLine; time < latest + 24*60*60; time += 24*60*60){
        const rows = Array.prototype.slice.apply(container.querySelectorAll('.row'));
        for(let row of rows){
            const line = document.createElement('div');
            line.className = 'timeline-item timeline-dateline';
            line.style.setProperty('--time', time);
            row.prepend(line);
        }
        lastLine = time;
    }

    earliest = earliestLine;
    latest = lastLine;

    container.style.setProperty('--earliest', earliest);
    container.style.setProperty('--latest', latest);
})

document.getElementById('TimeToSecond').addEventListener('click', function (event) {
    event.preventDefault();

    analyzeDiv.style.display = 'none';
    timelineDiv.style.display = 'none';
    timeToSecondDiv.style.display = 'block';
    timeToSecondDiv.innerHTML = '';

    const json = form.json.value;
    localStorage.json = json;
    const data = JSON.parse(json);
    for(playerId in data.members){
        if(!data.members[playerId].name){
            data.members[playerId].name = `anon${playerId}`;
        }
    }

    for(let member of Object.values(data.members)){
        member.time_to_second_score = 0;
        member.time_to_second = {};
    }

    for(let day = 1; day <= 25; day++){
        const daysList = [];
        for(let member of Object.values(data.members)){
            if(member.completion_day_level[day] && member.completion_day_level[day][2]){
                member.time_to_second[day] = member.completion_day_level[day][2].get_star_ts - member.completion_day_level[day][1].get_star_ts;
                daysList.push(member);
            }
        }
        daysList.sort((a, b) => a.time_to_second[day] - b.time_to_second[day]);
        daysList.forEach((member, index) => {
            member.time_to_second_score += daysList.length - index;
        });
    };

    const members = Object.values(data.members);
    members.sort((a, b) => b.time_to_second_score - a.time_to_second_score);

    for(let member of members){
        const p = document.createElement('p');
        p.className = 'privboard-row';
        p.textContent = `${member.name}: ${member.time_to_second_score}`;
        timeToSecondDiv.appendChild(p);
    }
})