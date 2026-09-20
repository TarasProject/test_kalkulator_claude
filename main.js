let display = document.getElementById('display');
let currentInput = '0';
let previousInput = '';
let operation = null;
let shouldResetDisplay = false;
let base = 10; // поточна система числення: 2, 10 або 16

const DIGITS = '0123456789ABCDEF';

// У недесяткових системах працюємо лише з цілими числами
function parseValue(str) {
    return base === 10 ? parseFloat(str) : parseInt(str, base);
}

function formatValue(value) {
    return base === 10 ? value.toString() : Math.trunc(value).toString(base).toUpperCase();
}

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
    const value = parseValue(currentInput);
    if (isNaN(value)) {
        conversionResult.textContent = '—';
        return;
    }
    const result = value * UNIT_BITS[fromUnit.value] / UNIT_BITS[toUnit.value];
    // Значення показуємо в десятковій системі, щоб воно не плутало з одиницями
    const shown = base === 10 ? currentInput : value;
    // toPrecision прибирає похибку float (напр. 0.30000000000000004)
    conversionResult.textContent =
        `${shown} ${fromUnit.value} = ${Number(result.toPrecision(12))} ${toUnit.value}`;
}

function swapUnits() {
    [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
    updateConversion();
}

function updateDisplay() {
    display.value = currentInput;
    display.classList.toggle('long', currentInput.length > 10);
    updateConversion();
}

// Вмикає лише кнопки, доступні в поточній системі числення
function updateBaseControls() {
    for (const btn of document.querySelectorAll('.base-btn')) {
        btn.classList.toggle('active', Number(btn.dataset.base) === base);
    }
    for (const btn of document.querySelectorAll('.btn.number')) {
        const key = btn.textContent;
        btn.disabled = key === '.' ? base !== 10 : DIGITS.indexOf(key) >= base;
    }
    document.getElementById('hexKeys').hidden = base !== 16;
}

function setBase(newBase) {
    if (newBase === base) {
        return;
    }
    const current = parseValue(currentInput);
    const previous = parseValue(previousInput);
    base = newBase;
    if (isNaN(current)) {
        // Після помилки нічого конвертувати — починаємо з нуля
        clearDisplay();
    } else {
        currentInput = formatValue(current);
        if (!isNaN(previous)) {
            previousInput = formatValue(previous);
        }
        updateDisplay();
    }
    updateBaseControls();
}

function appendNumber(num) {
    if (num === '.' ? base !== 10 : DIGITS.indexOf(num) >= base) {
        return;
    }
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
    const prev = parseValue(previousInput);
    const current = parseValue(currentInput);

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
            // У недесяткових системах ділення цілочисельне
            result = current !== 0 ? (base === 10 ? prev / current : Math.trunc(prev / current)) : 'Помилка';
            break;
        case '%':
            result = prev % current;
            break;
        default:
            return;
    }

    currentInput = typeof result === 'string' ? result : formatValue(result);
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

const THEMES = ['default', 'ocean', 'forest', 'sunset', 'rose'];

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem('theme', theme);
    } catch (e) {
        // localStorage може бути недоступним — тема просто не збережеться
    }
}

function nextTheme() {
    // Якщо тема ще не задана, indexOf дає -1 — рахуємо це як 'default'
    const current = Math.max(0, THEMES.indexOf(document.documentElement.dataset.theme));
    applyTheme(THEMES[(current + 1) % THEMES.length]);
}

try {
    const saved = localStorage.getItem('theme');
    if (THEMES.includes(saved)) {
        applyTheme(saved);
    }
} catch (e) {
    // без збереженої теми лишається стандартна
}

fillUnitSelect(fromUnit, 'B');
fillUnitSelect(toUnit, 'bit');
updateDisplay();
updateBaseControls();
