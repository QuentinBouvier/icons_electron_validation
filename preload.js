// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const fs = require('fs');

window.addEventListener('DOMContentLoaded', () => {
    displayComponent('index', () => {

    })
})

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

function loadTemplate(templateName, values) {
    template = fs.readFileSync(`./components/templates/${templateName}.tpl.html`, 'utf8');

    for (let v in values) {
        let replaceTag = new RegExp(`{{${v}}}`, 'g');
        template = template.replace(replaceTag, values[v]);
    }

    return template;
}
