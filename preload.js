// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const fs = require('fs');
const path = require('path');
const { dialog } = require('electron').remote;
const html2canvas = require('html2canvas');

window.addEventListener('DOMContentLoaded', () => {
    displayComponent('index', () => {
        const loadFileButton = document.getElementById('open-file-icon');
        const fileInputButton = document.getElementById('file-input');
        const preview = document.querySelector('#editor img');
        const editorPreview = document.getElementById('editor-preview');
        const sizeRangeInput = document.getElementById('dimension-range-input');
        const widthInput = document.getElementById('width-input');
        const heightInput = document.getElementById('height-input');
        const squareButton = document.getElementById('square-button');
        const squarentButton = document.getElementById('squarent-button');
        const roundButton = document.getElementById('round-button');
        const colorPicker = document.getElementById('color-picker');
        const validateButton = document.getElementById('validate-button');
        let angles = 'square';

        loadFileButton.onclick = openFileDialog;
        fileInputButton.onchange = loadImage;
        sizeRangeInput.oninput = resize;
        squareButton.onclick = () => { angles = 'square'; setAngles(); };
        squarentButton.onclick = () => { angles = 'squarent'; setAngles(); };
        roundButton.onclick = () => { angles = 'round'; setAngles(); };
        colorPicker.onchange = changeBackground;
        validateButton.onclick = selectFolder;

        function openFileDialog() {
            fileInputButton.click();
        }

        function loadImage(e) {
            const file = e.target.files[0];
            if (file) {
                preview.onload = (e) => {
                    const img = e.target;
                    const ratio = img.naturalWidth / img.naturalHeight;
                    if (img.naturalWidth > 1024 && ratio > 1) {
                        const scale = img.naturalWidth / 1024;
                        img.style.width = '1024px';
                        img.style.height = (img.naturalHeight / scale) + 'px';
                    } else if (img.naturalHeight > 1024 && ratio < 1) {
                        const scale = img.naturalHeight / 1024;
                        img.style.width = (img.naturalWidth / scale) + 'px';
                        img.style.height = '1024px';
                    } else {
                        img.style.width = img.naturalWidth + 'px';
                        img.style.height = img.naturalHeight + 'px';
                    }

                    img.style.background = '#fff0';
                    widthInput.value = ratio > 1 ? img.height : img.width;
                    heightInput.value = ratio > 1 ? img.height : img.width;
                    sizeRangeInput.value = widthInput.value;
                    editorPreview.style.width = widthInput.value + 'px';
                    editorPreview.style.height = heightInput.value + 'px';
                };
                preview.src = file.path;
                angles = 'square';
                setAngles();
            }
        }

        function resize(e) {
            if (preview.src) {
                const ratio = preview.naturalWidth / preview.naturalHeight;
                const value = e.target.value;
                let width, height,widthAttr, heightAttr;
                if (ratio > 1) {
                    width = value;
                    height = Math.floor(value / ratio);
                } else {
                    width = Math.floor(value * ratio);
                    height = value;
                }

                widthInput.value = ratio > 1 ? height : width;
                heightInput.value = ratio > 1 ? height: width;

                preview.style.width = preview.style.maxWidth = preview.style.minWidth = width + 'px';
                preview.style.height = preview.style.maxHeight = preview.style.minHeight = height + 'px';
                editorPreview.style.width = widthInput.value + 'px';
                editorPreview.style.height = heightInput.value + 'px';

                setAngles();
            }
        }

        function setAngles() {
            if (preview.src) {
                const ratio = preview.naturalWidth / preview.naturalHeight;
                let radius = 0;
                switch (angles) {
                    case 'square':
                    default:
                        editorPreview.style.borderRadius = '';
                        break;
                    case 'squarent':
                        radius = ratio > 1 ? preview.width * 0.10 : preview.height * 0.10;
                        editorPreview.style.borderRadius = radius + 'px';
                        break;
                    case 'round':
                        radius = ratio > 1 ? preview.height : preview.width;
                        editorPreview.style.borderRadius = '50%';
                        break;
                }
            }
        }

        function changeBackground(e) {
            if (preview.src) {
                preview.style.background = e.target.value;
            }
        }

        function selectFolder() {
            if (preview.src) {
                dialog.showSaveDialog().then(save);
            }
        }

        function save(e) {
            if (!e.cancelled) {
                let target = e.filePath;
                if (!path.extname(target).match(/\.png/i)) target += '.png';

                html2canvas(editorPreview).then(canvas => {
                    let imgData = canvas.toDataURL('image/png', 1).replace(/^data:image\/\w+;base64,/, "");
                    const imgBuffer = new Buffer(imgData, 'base64');
                    fs.writeFile(target, imgBuffer, (err) => { if (err) console.error(err); });
                });
            }
        }
    });
});

function displayComponent(componentName, callback) {
    const body = document.getElementById('component');
    fs.readFile(`components/${componentName}.component.html`, 'utf8', (err, file) => {
        if (!err) {
            body.innerHTML = file;
            if (typeof callback === 'function')
                callback();
        }
        else {
            body.innerHTML = err;
        }
    });
}
