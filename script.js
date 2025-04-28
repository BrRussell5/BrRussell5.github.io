const addFileBtn = document.getElementById("addFile");
const fileSelector = document.getElementById("fileSelector");
const closeModalBtn = document.getElementById("closeModal");
const fileOptions = document.querySelectorAll(".file-option");
const exportBtn = document.getElementById("export");
const exportModal = document.getElementById("exportModal");
const confirmExport = document.getElementById("confirmExport");


let selectedClip = null;

addFileBtn.addEventListener("click", function() {
    fileSelector.style.display = "block";
});

closeModalBtn.addEventListener("click", function() {
    fileSelector.style.display = "none";
});

exportBtn.addEventListener("click", function() {
    exportModal.style.display = "block";
});

confirmExport.addEventListener("click", function() {
    exportModal.style.display = "none";
    document.getElementById("exportMessage").style.display = "block";

    setTimeout(() => {
        document.getElementById("exportMessage").style.display = "none";
    }, 3000);
});

fileOptions.forEach(option => {
    option.addEventListener("click", function() {
        const type = this.getAttribute("data-type");
        const fileName = this.textContent.trim();
        addClip(type, fileName);
        fileSelector.style.display = "none";
    });
});

function addClip(type, fileName) {
    const clip = document.createElement("div");
	clip.dataset.fadeIn = "false";
	clip.dataset.fadeOut = "false";
    clip.classList.add("clip");
    clip.style.width = (fileName.includes("File 1")) ? "200px" : "100px";
    clip.style.height = "30px";
    clip.style.backgroundColor = "gray";
    clip.style.margin = "5px";
    clip.style.display = "inline-block";
    clip.style.cursor = "pointer";

    clip.addEventListener("click", function() {
        selectClip(this);
    });

    if (type === "video") {
        document.querySelector(".video-track .track").appendChild(clip);
    } else if (type === "audio") {
        document.querySelector(".audio-track .track").appendChild(clip);
    }

    selectClip(clip);
}

function selectClip(clip) {
    if (selectedClip) {
        selectedClip.style.backgroundColor = "gray";
    }
    selectedClip = clip;
    selectedClip.style.backgroundColor = "green";

    showClipOptions();
    updateOptionsPanel();
    showPreviewImage();
}

function showClipOptions() {
    const clipActions = document.getElementById("clipActions");
    clipActions.innerHTML = "";

    const actions = ["Fade", "Text", "Trim", "Playback Speed", "Audio", "Delete"];

    actions.forEach(action => {
        const btn = document.createElement("button");
        btn.textContent = action;
        btn.classList.add("action-btn");
        btn.addEventListener("click", () => handleClipAction(action));
        clipActions.appendChild(btn);
    });
}

function handleClipAction(action) {
    if (!selectedClip) return;

    if (action === "Delete") {
        deleteClip(selectedClip);
    } else if (action === "Fade") {
        showFadeOptions();
    } else if (action === "Text") {
        showTextOptions();
    } else if (action === "Trim") {
        showTrimOptions();
    } else if (action === "Playback Speed") {
		showSpeedOptions();
	} else {
        alert(`Action triggered: ${action}`);
    }
	
}

function deleteClip(clip) {
    const track = clip.parentNode;
    const width = clip.offsetWidth;
    track.removeChild(clip);

    let clips = Array.from(track.children);
    clips.forEach(c => {
        if (c.offsetLeft > clip.offsetLeft) {
            c.style.left = (c.offsetLeft - width) + "px";
        }
    });

    selectedClip = null;
    document.getElementById("clipActions").innerHTML = "";
    clearPreviewImage();
    resetEffectOptions();
}


function showPreviewImage() {
    const previewWindow = document.querySelector(".preview-window");
    let img = document.getElementById("placeholderImg");

    if (!img) {
        img = document.createElement("img");
        img.id = "placeholderImg";
        img.className = "preview-img";
        previewWindow.appendChild(img);
    }

    img.src = "assets/exampleVideo.png";
    img.style.display = "block";

    updatePreviewText();
}


function clearPreviewImage() {
    const img = document.getElementById("placeholderImg");
    if (img) {
        img.style.display = "none";
    }
}

function showFadeOptions() {
    const effectBox = document.querySelector(".effect-options");
    effectBox.innerHTML = `
        <h2>Fade Options</h2>
        <div id="fadeControls">
            <label><input type="checkbox" id="fadeIn"> Fade In</label><br>
            <label><input type="checkbox" id="fadeOut"> Fade Out</label>
        </div>
    `;

    const fadeIn = selectedClip.dataset.fadeIn === "true";
    const fadeOut = selectedClip.dataset.fadeOut === "true";

    document.getElementById("fadeIn").checked = fadeIn;
    document.getElementById("fadeOut").checked = fadeOut;
    document.getElementById("fadeIn").addEventListener("change", function() {
        selectedClip.dataset.fadeIn = this.checked;
    });

    document.getElementById("fadeOut").addEventListener("change", function() {
        selectedClip.dataset.fadeOut = this.checked;
    });
}

function updateOptionsPanel() {
    const effectBox = document.querySelector(".effect-options");

    if (effectBox.querySelector("#fadeControls")) {
        showFadeOptions();
    } else if (effectBox.querySelector("#textControls")) {
        showTextOptions();
    } else if (effectBox.querySelector("#trimControls")) {
        showTrimOptions();
    }
}

function resetEffectOptions() {
    const effectBox = document.querySelector(".effect-options");
    effectBox.innerHTML = `<h2>Effect Options</h2>`;
}

function showTextOptions() {
    const effectBox = document.querySelector(".effect-options");
    effectBox.innerHTML = `
        <h2>Text Options</h2>
        <div id="textControls">
            <label>Text:</label><br>
            <input type="text" id="clipText" placeholder="Enter clip text">
        </div>
    `;

    const textInput = document.getElementById("clipText");

    textInput.value = selectedClip.dataset.clipText || "";

    textInput.addEventListener("input", function() {
        selectedClip.dataset.clipText = this.value;
        updatePreviewText();
    });

    updatePreviewText();
}

function updatePreviewText() {
    const previewWindow = document.querySelector(".preview-window");
    let textOverlay = document.getElementById("clipTextOverlay");

    if (!textOverlay) {
        textOverlay = document.createElement("div");
        textOverlay.id = "clipTextOverlay";
        textOverlay.className = "text-overlay";
        previewWindow.appendChild(textOverlay);
    }

    if (selectedClip && selectedClip.dataset.clipText) {
        textOverlay.textContent = selectedClip.dataset.clipText;
        textOverlay.style.display = "block";
    } else {
        textOverlay.style.display = "none";
    }
}

function showTrimOptions() {
    const effectBox = document.querySelector(".effect-options");
    effectBox.innerHTML = `
        <h2>Trim Options</h2>
        <div id="trimControls">
            <input type="range" id="trimSlider" min="10" max="100" value="100" style="width: 100%;">
            <button id="applyTrim" style="margin-top:10px;">Apply</button>
        </div>
    `;

    document.getElementById("applyTrim").addEventListener("click", applyTrim);
}

function applyTrim() {
    if (!selectedClip) return;

    const sliderValue = document.getElementById("trimSlider").value;
    const originalWidth = selectedClip.offsetWidth;
    const newWidth = Math.max(20, (originalWidth * (sliderValue / 100)));

    const shiftAmount = originalWidth - newWidth;
    selectedClip.style.width = newWidth + "px";

    const track = selectedClip.parentNode;
    let clips = Array.from(track.children);

    clips.forEach(c => {
        if (c !== selectedClip && c.offsetLeft > selectedClip.offsetLeft) {
            c.style.left = (c.offsetLeft - shiftAmount) + "px";
        }
    });

    selectedClip.style.backgroundColor = "gray";
    selectedClip = null;
    document.getElementById("clipActions").innerHTML = "";
    clearPreviewImage();
    resetEffectOptions();
}

function showSpeedOptions() {
    if (!selectedClip) return;

    const effectBox = document.querySelector(".effect-options");
    effectBox.innerHTML = "<h3>Speed Options</h3>";

    const speedSelect = document.createElement("select");
    speedSelect.id = "speedSelect";

    ["x2", "x3", "x0.5", "x0.25"].forEach(speed => {
        const option = document.createElement("option");
        option.value = speed;
        option.textContent = speed;
        speedSelect.appendChild(option);
    });

    const applySpeedBtn = document.createElement("button");
    applySpeedBtn.textContent = "Apply Speed";
    applySpeedBtn.addEventListener("click", function() {
        const speed = speedSelect.value;
        if (!selectedClip) return;

        let scale = 1;
        if (speed === "x2") scale = 0.5;
        else if (speed === "x3") scale = 1 / 3;
        else if (speed === "x0.5") scale = 2;
        else if (speed === "x0.25") scale = 4;

        const currentWidth = selectedClip.offsetWidth;
        const newWidth = currentWidth * scale;
        selectedClip.style.width = newWidth + "px";

        // Optional: deselect after applying speed
        deselectClip();
    });

    effectBox.appendChild(speedSelect);
    effectBox.appendChild(document.createElement("br"));
    effectBox.appendChild(applySpeedBtn);
}