const trace = document.getElementById("trace");

function createSocket() {
    const { origin, pathname } = window.location;

    // Split and filter empty segments (handles trailing slashes etc.)
    const segments = pathname.split("/").filter(Boolean);

    // Use first path segment as base, or empty string if at root
    const basePath = segments.length > 0 ? `/${segments[0]}` : "";

    return io(origin, {
        path: `${basePath}/socket.io`
    });
}

const socket = createSocket();

socket.on('connect', () => {
    console.log("socket connected");
});

socket.on('connect_error', (error) => {
    if (socket.active) {
        console.log("socket connecting...");
    } else {
        console.error(error);
    }
});

let line_no = 0;
let max_lines = 1000;

socket.on('sensor', (msg) => {
    let timestamp;
    if (msg.timestamp)
        timestamp = `[${msg.timestamp}]`;
    else
        timestamp = new Date().toUTCString();
    let text = '';


    if (msg.temp)
        text = `temp: ${msg.temp.toFixed(2)} humidity: ${msg.humidity.toFixed(2)} meanDb: ${msg.mean_db.toFixed(2)} maxDb: ${msg.max_db.toFixed(2)}`;
    else if (msg.state)
        text = `state: ${msg.state} movement: ${msg.movement.toFixed(2)} threshold: ${msg.threshold.toFixed(2)} confidence: ${msg.confidence.toFixed(2)} packets_processed: ${msg.packets_processed} packets_dropped: ${msg.packets_dropped}`;
    else
        text = `${JSON.stringify(msg)}`;

    text = `${timestamp} ${text}`;

    const words = text.split(' ');

    function selectLineEl() {
        const lines = trace.childNodes;
        if (line_no < lines.length && lines[line_no]) {
            const el = lines[line_no];
            el.innerText = '';
            return el;
        } else {
            const pre = document.createElement("p");
            pre.classList.add('line');

            trace.appendChild(pre);
            const rect = pre.getBoundingClientRect();

            if (rect.bottom >= window.innerHeight) {
                max_lines = line_no
            }

            const t = rect.top / window.innerHeight;
            pre.style.color = `hsl(0, 0%, ${t * 100}%)`;

            return pre;
        }
    }

    let currentLineEl = selectLineEl();
    let lineHeight;

    currentLineEl.innerText = words[0];
    lineHeight = currentLineEl.getBoundingClientRect().height;
    last_break_idx = 0

    for (let i = 1; i < words.length; i++) {
        currentLineEl.innerText = currentLineEl.innerText + " " + words[i];

        if (currentLineEl.getBoundingClientRect().height > 12) {
            // Remove last word
            currentLineEl.innerText = words.slice(last_break_idx, i).join(' ');
            last_break_idx = i;

            // Select next line
            line_no = (line_no + 1) % max_lines;
            currentLineEl = selectLineEl();
            currentLineEl.innerText = words[i];
        }
    }

    line_no = (line_no + 1) % max_lines;
});

const STREAM_URL = 'https://radio.arranlyon.com/live';

let isPlaying = false;
const audio = document.getElementById("audio");
const startPlayBtn = document.getElementById("start-play");
const playBtn = document.getElementById("play");

function play() {
    isPlaying = true;
    audio.src = STREAM_URL;
    audio.load();

    playBtn.src = 'icons/pause.svg';

    const promise = audio.play();
    if (promise !== undefined) {
        promise.catch(err => {
            console.error("Playback error: ", err);
            isPlaying = false;
            playBtn.src = 'icons/play.svg';
        })
    }
}

function pause() {
    audio.pause();
    audio.src = '';
    isPlaying = false;
    playBtn.src = 'icons/play.svg';
}

startPlayBtn.addEventListener('click', () => {
    document.getElementById("overlay").style.display = 'none';
    play();
});

playBtn.addEventListener('click', () => {
    if (isPlaying)
        pause();
    else
        play();
});

audio.addEventListener('playing', () => {
    console.log("Playing");
});

audio.addEventListener('waiting', () => {
    console.log("Buffering");
});

audio.addEventListener('stalled', () => {
    console.log("radio stalled...");
});

audio.addEventListener('error', (err) => {
    console.error("Stream error");
    console.error(err);
});

function moveDraggable(el, ev) {
    ev.preventDefault();
    window.lastPos = {
        x: ev.clientX,
        y: ev.clientY
    };

    document.onmouseup = () => {
        document.onmouseup = null;
        document.onmousemove = null;
        window.lastPos = null;
    };

    document.onmousemove = (ev) => {
        ev.preventDefault();

        if (!window.lastPos)
            return;

        let dX = window.lastPos.x - ev.clientX;
        let dY = window.lastPos.y - ev.clientY;

        window.lastPos = {
            x: ev.clientX,
            y: ev.clientY
        };

        const yMax = window.innerHeight - 200;
        const xMax = window.innerWidth - 100;

        el.style.top = Math.min(yMax, Math.max(20, el.offsetTop - dY)) + "px";
        el.style.left = Math.min(xMax, Math.max(20, el.offsetLeft - dX)) + "px";
    };

}

let zIndex = 0;

function bringToFront(el) {
    el.style.zIndex = zIndex;
    zIndex++;
}

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('.moveable').forEach(el => {
        let offsetX, offsetY, isDragging = false;

        const startDrag = (x, y) => {
            isDragging = true;
            offsetX = x - el.getBoundingClientRect().left;
            offsetY = y - el.getBoundingClientRect().top;
            el.style.cursor = 'grabbing';
            el.style.zIndex = zIndex;
            zIndex++;
        };

        const moveDrag = (x, y) => {
            if (!isDragging) return;
            let newX = x - offsetX;
            let newY = y - offsetY;
            if (newX < -el.clientWidth * 0.75)
                newX = -el.clientWidth * 0.75;
            el.style.position = 'absolute';
            el.style.left = `${newX}px`;
            el.style.top = `${newY}px`;
        };

        const stopDrag = () => {
            isDragging = false;
            el.style.cursor = 'grab';
        };

        // Mouse events
        el.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
        document.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
        document.addEventListener('mouseup', stopDrag);

        // Touch events
        el.addEventListener('touchstart', e => {
            const t = e.touches[0];
            startDrag(t.clientX, t.clientY);
        }, { passive: true });

        document.addEventListener('touchmove', e => {
            const t = e.touches[0];
            moveDrag(t.clientX, t.clientY);
        }, { passive: true });

        document.addEventListener('touchend', stopDrag);
    });

    const width = window.innerWidth;
    const height = window.innerHeight;

    // const titleDraggable = document.getElementById("title");
    // titleDraggable.style.top = "15px";
    // titleDraggable.style.left = "15px";
    //
    // const radioDraggable = document.getElementById("radio");
    // radioDraggable.style.top = `${height - radioDraggable.clientHeight - 15}px`;
    // radioDraggable.style.left = `${width - radioDraggable.clientWidth - 10}px`;
    //
    // const infoDraggable = document.getElementById("info");
    // infoDraggable.style.top = `${height - radioDraggable.clientHeight - 15}px`;
    // infoDraggable.style.left = `10px`;
    // infoDraggable.style.borderRadius = '40px 0';

    // Position sculptures
    const sculptures = Array.from(document.querySelectorAll(".sculpture"));
    await waitForImages(sculptures);
    shuffleArray(sculptures);

    sculptures.forEach((el, row) => {
        const col = row % 2;
        const rect = el.getBoundingClientRect();

        const elWidth = rect.width;
        const elHeight = rect.height;

        let x;
        let y = (row + 1) * height / 7 - elHeight / 2;


        if (row == 2)
            x = width / 5 - elWidth / 2;
        else if (row == 3)
            x = 4 * width / 5 - elWidth / 2;
        else
            x = (col + 1) * width / 3 - elWidth / 2;

        x += (Math.random() - 0.5) * elWidth * 0.2;
        y += (Math.random() - 0.5) * elHeight * 0.2;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
    });
});

const infoBtn = document.getElementById("info-btn");
let infoOpen = false;
infoBtn.addEventListener('click', () => {
    const info = document.getElementById("info");
    const infoText = document.getElementById("info-text");
    if (infoOpen) {
        info.style.left = "10px";
        info.style.bottom = "10px";
        info.style.right = "";
        info.style.top = "";

        infoText.style.display = "none";

        infoOpen = false;
        infoBtn.src = "icons/info.svg";
    } else {
        info.style.top = "10px";
        info.style.left = "10px";
        info.style.right = "10px";
        info.style.bottom = "10px";

        infoText.style.display = "block";

        infoOpen = true;
        infoBtn.src = "icons/close.svg";
    }
});

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function waitForImages(elements) {
    const promises = [...elements].map(el => {
        if (!(el instanceof HTMLImageElement)) return Promise.resolve();
        if (el.complete && el.naturalHeight > 0) return Promise.resolve(); // already loaded
        return new Promise(resolve => {
            el.addEventListener('load', resolve, { once: true });
            el.addEventListener('error', resolve, { once: true }); // don't hang on broken images
        });
    });
    return Promise.all(promises);
}


let num_recognised = 0;
const sculptures = document.getElementsByClassName("sculpture");

function randomElement(arr) {
    if (arr.length)
        return arr[Math.floor(Math.random() * arr.length)];
    else
        return undefined;
}

function recognise() {
    // Select random sculpture

    let find_new;

    num_recognised = document.querySelectorAll('.recognised').length;

    if (num_recognised < 1) {
        find_new = true;
    } else if (num_recognised >= 2) {
        find_new = false;
    } else {
        find_new = Math.random() < 0.5;
    }

    if (find_new) {
        let found = false;
        let unrecognised = document.querySelectorAll('.sculpture');
        let new_sculpture;
        while (!found) {
            new_sculpture = randomElement(unrecognised);
            if (new_sculpture.classList.contains("recognised"))
                continue;

            break;
        }
        new_sculpture.classList.add("recognised");
    } else {
        const recognised = document.querySelectorAll('.recognised');
        randomElement(recognised).classList.remove('recognised');
    }

    setTimeout(recognise, Math.random() * 3000 + 500);
}

setTimeout(recognise, 2000);
