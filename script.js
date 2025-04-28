const addFileBtn = document.getElementById("addFile");
const fileSelector = document.getElementById("fileSelector");
const closeModalBtn = document.getElementById("closeModal");
const fileOptions = document.querySelectorAll(".file-option");

let selectedClip = null;

addFileBtn.addEventListener("click", function() {
    fileSelector.style.display = "block";
});

closeModalBtn.addEventListener("click", function() {
    fileSelector.style.display = "none";
});

fileOptions.forEach(option => {
    option.addEventListener("click", function() {
        const type = this.getAttribute("data-type");
        const fileName = this.textContent.trim(); // To differentiate "File 1", "File 2", "File 3"
        addClip(type, fileName);
        fileSelector.style.display = "none";
    });
});

function addClip(type, fileName) {
    const clip = document.createElement("div");
	clip.dataset.fadeIn = "false";
	clip.dataset.fadeOut = "false";
    clip.classList.add("clip");
    clip.style.width = (fileName.includes("File 1")) ? "200px" : "100px"; // Double width for File 1
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

    // Automatically highlight the new clip
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
    clipActions.innerHTML = ""; // Clear previous buttons

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
    } else {
        alert(`Action triggered: ${action}`); // Placeholder
    }
}

function deleteClip(clip) {
    const track = clip.parentNode;
    const width = clip.offsetWidth;
    track.removeChild(clip);

    // Shift all clips to the right of the deleted one
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

    img.src = "https://via.placeholder.com/800x400.png?text=Clip+Preview";
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

    // Set current clip's fade state if already applied
    const fadeIn = selectedClip.dataset.fadeIn === "true";
    const fadeOut = selectedClip.dataset.fadeOut === "true";

    document.getElementById("fadeIn").checked = fadeIn;
    document.getElementById("fadeOut").checked = fadeOut;

    // Add event listeners for checkboxes
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

    // Load existing text if the clip has it
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

    // Shift all clips on the right
    const track = selectedClip.parentNode;
    let clips = Array.from(track.children);

    clips.forEach(c => {
        if (c !== selectedClip && c.offsetLeft > selectedClip.offsetLeft) {
            c.style.left = (c.offsetLeft - shiftAmount) + "px";
        }
    });

    // Deselect clip and reset options panel
    selectedClip.style.backgroundColor = "gray";
    selectedClip = null;
    document.getElementById("clipActions").innerHTML = "";
    clearPreviewImage();
    resetEffectOptions();
}

