let display = document.getElementById('display');
let currentInput = '0';
let previousInput = '';
let operation = null;
let shouldResetDisplay = false;

// Розміри одиниць у бітах
const UNIT_GROUPS = [
    { label: 'Базові', units: { bit: 1, B: 8 } },
    { label: 'Біти (SI, 1000)', units: { kbit: 1e3, Mbit: 1e6, Gbit: 1e9 } },
    { label: 'Байти (SI, 1000)', units: { kB: 8e3, MB: 8e6, GB: 8e9, TB: 8e12 } },
    { label: 'Байти (IEC, 1024)', units: { KiB: 8 * 1024, MiB: 8 * 1024 ** 2, GiB: 8 * 1024 ** 3, TiB: 8 * 1024 ** 4 } }
];

const UNIT_BITS = Object.assign({}, ...UNIT_GROUPS.map(group => group.units));
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const conversionResult = document.getElementById('conversionResult');

function fillUnitSelect(select, selected) {
    for (const group of UNIT_GROUPS) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group.label;
        for (const name of Object.keys(group.units)) {
            optgroup.appendChild(new Option(name, name, false, name === selected));
        }
        select.appendChild(optgroup);
    }
}

function updateConversion() {
    const value = parseFloat(currentInput);
    if (isNaN(value)) {
        conversionResult.textContent = '—';
        return;
    }
    const result = value * UNIT_BITS[fromUnit.value] / UNIT_BITS[toUnit.value];
    // toPrecision прибирає похибку float (напр. 0.30000000000000004)
    conversionResult.textContent =
        `${currentInput} ${fromUnit.value} = ${Number(result.toPrecision(12))} ${toUnit.value}`;
}

function swapUnits() {
    [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
    updateConversion();
}

function updateDisplay() {
    display.value = currentInput;
    updateConversion();
}

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
    } else {
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else if (num === '.' && currentInput.includes('.')) {
            return;
        } else {
            currentInput += num;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    if (operation !== null && !shouldResetDisplay) {
        calculate();
    }
    previousInput = currentInput;
    operation = op;
    shouldResetDisplay = true;
}

function calculate() {
    if (operation === null || shouldResetDisplay) {
        return;
    }

    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    switch (operation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = current !== 0 ? prev / current : 'Помилка';
            break;
        case '%':
            result = prev % current;
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operation = null;
    shouldResetDisplay = true;
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    previousInput = '';
    operation = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

fillUnitSelect(fromUnit, 'B');
fillUnitSelect(toUnit, 'bit');
updateDisplay();
