export default class Select {
    constructor(element) {
        this.element = element;
        // object of options within element
        this.options = getFormattedOptions(element.querySelectorAll('option'));
        // entire select element
        this.customElement = document.createElement('div');
        // current selected element
        this.labelElement = document.createElement('span');
        // entire list of selectable elements
        this.optionsCustomElement = document.createElement('ul');
        // connect styling
        setupCustomElement(this);
        // replace old select with custom select
        element.style.display = 'none';
        element.after(this.customElement);
    }

    get selectedOption() {
        return this.options.find(option => option.selected)
    }

    get selectedOptionIndex() {
        return this.options.indexOf(this.selectedOption);
    }

    // functionto change selected item
    selectValue(value) {
        const newSelectedOption = this.options.find(option => {
            return option.value === value
        })
        const prevSelectedOption = this.selectedOption;
        prevSelectedOption.selected = false;
        prevSelectedOption.element.selected = false;

        newSelectedOption.selected = true;
        newSelectedOption.element.selected = true;

        // change the text of the label element based on the selected option element
        this.labelElement.innerText = newSelectedOption.label;

        // remove prev selected class from previous option
        this.optionsCustomElement
            .querySelector(`[data-value="${prevSelectedOption.value}"]`)
            .classList.remove('selected');
        // add new selected class from previous option
        // set to variable in order scrollIntoView()
        const newCustomElement = this.optionsCustomElement
            .querySelector(`[data-value="${newSelectedOption.value}"]`);
        newCustomElement.classList.add('selected');
        newCustomElement.scrollIntoView({ block: 'nearest' });
    }
}

function setupCustomElement(select) {
    // entire select element style
    select.customElement.classList.add('custom-select-container');
    // set tabIndex for CSS focus (focus only on tab, not click)
    select.customElement.tabIndex = 0;

    // currently selected element style
    select.labelElement.classList.add('custom-select-value');
    // set tabIndex for CSS focus (focus only on tab, not click)
    select.labelElement.tabIndex = -1;
    // set the text of the label element based on the selected option element
    select.labelElement.innerText = select.selectedOption.label;
    // place inside custom-element-container
    select.customElement.append(select.labelElement);

    // style of list
    select.optionsCustomElement.classList.add('custom-select-options')
    // append all options to element
    select.options.forEach(option => {
        const optionElement = document.createElement('li');
        optionElement.classList.add('custom-select-option');
        // give selected class if option is selected
        optionElement.classList.toggle('selected', option.selected);
        // add text to option element
        optionElement.innerText = option.label;
        // get access to value
        optionElement.dataset.value = option.value;
        // change to selected item
        optionElement.addEventListener('click', () => {
            select.selectValue(option.value);
            select.optionsCustomElement.classList.remove('show');
        })
        // add items to ul
        select.optionsCustomElement.append(optionElement);
    })
    // place inside custom-element-container
    select.customElement.append(select.optionsCustomElement);

    // display dropdown
    select.labelElement.addEventListener('click', () => {
        select.optionsCustomElement.classList.toggle('show');
    })
    // hide list when click off
    select.customElement.addEventListener('blur', () => {
        select.optionsCustomElement.classList.remove('show');
    })

    let debounceTimeout;
    let searchTerm = '';
    // keyboard actions
    select.customElement.addEventListener('keydown', e => {
        switch (e.code) {
            case 'Space':
                select.optionsCustomElement.classList.toggle('show');
                break;
            case 'ArrowUp':
                const prevOption = select.options[select.selectedOptionIndex - 1];
                if (prevOption) {
                    select.selectValue(prevOption.value);
                }
                break;
            case 'ArrowDown':
                const nextOption = select.options[select.selectedOptionIndex + 1];
                if (nextOption) {
                    select.selectValue(nextOption.value);
                }
                break;
            case 'Enter':
            case 'Escape':
                select.optionsCustomElement.classList.remove('show');
                break;
            // search to select
            default: 
                clearTimeout(debounceTimeout)
                searchTerm += e.key;
                debounceTimeout = setTimeout(() => {
                    searchTerm = '';
                }, 500)

                const searchedOption = select.options.find(option => {
                   return option.label.toLowerCase().startsWith(searchTerm);
                })
                if (searchedOption) {
                    select.selectValue(searchedOption.value);
                }
        }
    })
}

// take option(s) and covnert to javascript object
function getFormattedOptions(optionElements) {
    return [...optionElements].map(optionElement => {
        return {
            value: optionElement.value,
            label: optionElement.label,
            selected: optionElement.selected,
            element: optionElement
        }
    })
}