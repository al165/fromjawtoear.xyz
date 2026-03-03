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

