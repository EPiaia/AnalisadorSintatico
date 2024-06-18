const parsingMap = new Map();
const alphabet = ['a', 'b', 'c', '$'];
const rules = ['S', 'A', 'B', 'C'];
const stackes = [];
const entries = [];
const actions = [];
var actualIteration = 0;
const PARSING_TABLE_BODY_ID = 'parsing-table-body';
const TOKEN_LENGTH_RATE = 0.75;

window.addEventListener('load', (event) => {
    initializeMaps();
    document.getElementById('execute-btn').addEventListener('click', () => {
        var input = document.getElementById('word-input');
        if (input.value === '') {
            return;
        }
        restart(false);
        execute();
        createRestart();
    });

    document.getElementById('generate-btn').addEventListener('click', () => {
        generateToken();
    });

    document.getElementById('more-info-btn').addEventListener('click', () => {
        document.getElementById('more-information').showModal();
    });

    document.getElementById('step-by-step-btn').addEventListener('click', () => {
        restart(false);
        turnStepByStepMode();
    });
   
    document.getElementById('next-step-btn').addEventListener('click', () => {
        nextStep();
    });
    
    document.getElementById('end-step-btn').addEventListener('click', () => {
        endStepByStep();
        leaveStepByStepMode();
        createRestart();
    });
});

function initializeMaps() {
    parsingMap.set('S', ['abC', 'bCa', 'cBb', '']);
    parsingMap.set('A', ['aCb', 'bB', 'cBC', '']);
    parsingMap.set('B', ['acA', '-', '-', '']);
    parsingMap.set('C', ['', 'bcS', 'cb', '']);
}

function execute() {
    initializeExecution();

    var continueParsing = true;
    while (continueParsing) {
        continueParsing = executeStep();
        if (!continueParsing) {
            break;
        }
    }

    writeParsingTable();
}

function initializeExecution() {
    var input = document.getElementById('word-input');
    var word = input.value + '$';
    stackes.push('$S');
    entries.push(word);
}

function nextStep() {
    if (actualIteration === 0) {
        initializeExecution();
    }

    var continueParsing = executeStep();
    writeParsingTable();

    if (!continueParsing) {
        leaveStepByStepMode();
        createRestart();
    }
}

function endStepByStep() {
    if (actualIteration === 0) {
        initializeExecution();
    }

    var continueParsing = true;
    while (continueParsing) {
        continueParsing = executeStep();
        if (!continueParsing) {
            break;
        }
    }

    writeParsingTable();
}

function executeStep() {
    var stack = stackes[actualIteration];
    var entry = entries[actualIteration];

    if (stack === '$' && entry === '$') {
        actions.push('OK em ' + stackes.length + ' iterações');
        return false;
    }

    actualIteration++;

    var stackRule = stack.split('').pop();
    var entryChar = Array.from(entry)[0];
    if (stackRule === entryChar) {
        actions.push('Ler ' + entryChar);
        stackes.push(stack.substring(0, stack.length - 1));
        entries.push(entry.substring(1));
        return true;
    }

    var sentenceRule = rule(stackRule, entryChar);
    if (sentenceRule === null) {
        actions.push('Erro em ' + stackes.length + ' iterações');
        return false;
    }

    // Epsilon
    if (sentenceRule === '-') {
        actions.push(entryChar + ' -> ε');
        stackes.push(stack.substring(0, stack.length - 1));
        entries.push(entry);
        return true;
    }

    actions.push(entryChar + ' -> ' + sentenceRule);
    sentenceRule = sentenceRule.split('').reverse().join('');
    stackes.push(stack.substring(0, stack.length - 1) + sentenceRule);
    entries.push(entry);

    return true;
}

function restart(clearInput) {
    stackes.splice(0, stackes.length);
    entries.splice(0, entries.length);
    actions.splice(0, actions.length);
    actualIteration = 0;

    if (clearInput) {
        var input = document.getElementById('word-input');
        input.value = '';
    }

    var btn = document.getElementById('restart-btn');
    if (typeof (btn) != 'undefined' && btn != null) {
        document.getElementById('restart-btn').remove();
    }
    writeParsingTable();
}

function createRestart() {
    var div = document.getElementById('restart-div');
    var btn = document.createElement('button');
    btn.id = 'restart-btn';
    btn.addEventListener('click', () => {
        restart(true);
    });

    var text = document.createTextNode('Reiniciar');
    btn.appendChild(text);
    div.appendChild(btn);
}

function generateToken() {
    var tokenInput = document.getElementById('word-input');
    tokenInput.value = generateTokenFromRule('S');
}

function generateTokenFromRule(rule) {
    var ruleValue = selectRuleValue(rule);
    // Epsilon
    if (ruleValue === '-') {
        return '';
    }

    var currentToken = '';
    for (let i = 0; i < ruleValue.length; i++) {
        var character = ruleValue[i];
        if (character === character.toLowerCase()) {
            currentToken = currentToken + character;
        } else {
            currentToken = currentToken + generateTokenFromRule(character);
        }
    }

    return currentToken;
}

function selectRuleValue(rule) {
    var possibleValues = [];
    var mapValues = parsingMap.get(rule);

    if (mapValues.some(e => e === '-')) {
        var epsilonChance = Math.random();
        if (epsilonChance > TOKEN_LENGTH_RATE) {
            return '-';
        }
    }

    for (let i = 0; i < mapValues.length; i++) {
        var value = mapValues[i];
        if (value === '' || value === '-') {
            continue;
        }

        possibleValues.push(value);
    }

    var chosenIndex = randomIntFromInterval(0, possibleValues.length - 1);
    return possibleValues[chosenIndex];
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function rule(key, char) {
    var keyRules = parsingMap.get(key);
    if (typeof (keyRules) === 'undefined' || keyRules == null) {
        return null;
    }

    var index = char === 'a' ? 0 : (char === 'b' ? 1 : (char === 'c' ? 2 : (char === '$' ? 3 : -1)));
    if (index < 0) {
        return null;
    }

    var sentenceRule = keyRules[index];
    if (sentenceRule === '') {
        return null;
    }

    return sentenceRule;
}

function turnStepByStepMode() {
    document.getElementById('execute-btn').className = 'header-btn display-none';
    document.getElementById('step-by-step-btn').className = 'header-btn display-none';
    document.getElementById('next-step-btn').className = 'header-btn';
    document.getElementById('end-step-btn').className = 'header-btn';
}

function leaveStepByStepMode() {
    document.getElementById('execute-btn').className = 'header-btn';
    document.getElementById('step-by-step-btn').className = 'header-btn';
    document.getElementById('next-step-btn').className = 'header-btn display-none';
    document.getElementById('end-step-btn').className = 'header-btn display-none';
}

function writeParsingTable() {
    var parsingTable = document.getElementById('parsing-table');

    var existingBody = document.getElementById(PARSING_TABLE_BODY_ID);
    if (typeof (existingBody) != 'undefined' && existingBody != null) {
        existingBody.remove();
    }

    var tableBody = document.createElement('tbody');
    tableBody.id = PARSING_TABLE_BODY_ID;

    for (let i = 0; i < stackes.length; i++) {
        var row = document.createElement('tr');

        var stackCell = createCell(stackes[i]);
        row.appendChild(stackCell);

        var entryCell = createCell(entries[i]);
        row.appendChild(entryCell);

        var actionCell = createCell(actions[i]);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    }

    parsingTable.appendChild(tableBody);
}

function createCell(value) {
    var td = document.createElement('td');
    if (typeof (value) === 'undefined' || value === null) {
        value = '';
    }
    var text = document.createTextNode(value);
    td.appendChild(text);
    return td;
}