import Select from './select.js'

const selectElements = document.querySelectorAll('[data-custom]');

selectElements.forEach(selectElements => {
    new Select(selectElements);
})