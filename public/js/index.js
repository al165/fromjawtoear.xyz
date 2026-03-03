const statusSpan = document.getElementById("status");
const trace = document.getElementById("trace");

function createSocket() {
    const { origin, pathname } = window.location;

    // Split and filter empty segments (handles trailing slashes etc.)
    const segments = pathname.split("/").filter(Boolean);

    // Use first path segment as base, or empty string if at root
    const basePath = segments.length > 0 ? `/${segments[0]}` : "";

    console.log(origin);
    console.log(basePath);

    return io(origin, {
        path: `${basePath}/socket.io`
    });
}

const socket = createSocket();

socket.on('connect', () => {
    statusSpan.innerText = "Connected";
});

socket.on('connect_error', (error) => {
    if (socket.active) {
        statusSpan.innerText = "Connecting...";
    } else {
        statusSpan.innerText = "Error";
        console.log(error);
    }
});

socket.on('sensor', (msg) => {
    // console.log(msg);
    const pre = document.createElement("pre");
    pre.innerText = JSON.stringify(msg, null, 4);

    trace.prepend(pre);

    let count = 0;
    for (const node of trace.childNodes) {
        if (count >= 10) {
            trace.removeChild(node);
            count++;
            continue;
        }

        node.style.opacity = (10 - count) / 10;
        count++;
    }

});

const STREAM_URL = 'https://radio.arranlyon.com/live';

let isPlaying = false;
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const radioStatus = document.getElementById("radio-status");

function setRadioStatus(text) {
    radioStatus.textContent = text;
}

function play() {
    isPlaying = true;
    audio.src = STREAM_URL;
    audio.load();
    setRadioStatus("Connecting...");

    playBtn.innerText = 'pause';

    const promise = audio.play();
    if (promise !== undefined) {
        promise.catch(err => {
            console.error("Playback error: ", err);
            setRadioStatus("Error");
            isPlaying = false;
            playBtn.innerText = 'play';
        })
    }
}

function pause() {
    audio.pause();
    audio.src = '';
    isPlaying = false;
    playBtn.innerText = 'play';
    setRadioStatus("Paused");
}

playBtn.addEventListener('click', () => {
    if (isPlaying)
        pause();
    else
        play();
})

audio.addEventListener('playing', () => {
    setRadioStatus("Live");
});

audio.addEventListener('waiting', () => {
    if (isPlaying)
        setRadioStatus("Buffering...")
});

audio.addEventListener('stalled', () => {
    if (isPlaying)
        setRadioStatus('Stalled, retrying...');
});

audio.addEventListener('error', () => {
    console.log("Error");
    setRadioStatus("Stream unavailable");
});

