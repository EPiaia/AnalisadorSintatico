const parsingMap = new Map();
const alphabet = ['a', 'b', 'c', '$'];
const rules = ['S', 'A', 'B', 'C'];
const stackes = [];
const entries = [];
const actions = [];
const parsingTableBodyId = 'parsing-table-body'

window.addEventListener('load', (event) => {
    initializeMaps();
    document.getElementById('execute-btn').addEventListener('click', () => {
        execute();
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
    var input = document.getElementById('word-input');
    var word = input.value + '$';
    stackes.push('$S');
    entries.push(word);

    let count = 0;
    while (true) {
        var stack = stackes[count];
        var entry = entries[count];

        if (stack === '$' && entry === '$') {
            actions.push('OK em ' + stackes.length + ' iterações');
            break;
        }

        count++;

        var stackRule = stack.split('').pop();
        var entryChar = Array.from(entry)[0];
        if (stackRule === entryChar) {
            actions.push('Ler ' + entryChar);
            stackes.push(stack.substring(0, stack.length - 1));
            entries.push(entry.substring(1));
            continue;
        }

        var sentenceRule = rule(stackRule, entryChar);
        if (sentenceRule === null) {
            actions.push('Erro em ' + stackes.length + ' iterações');
            break;
        }

        // epsilon
        if (sentenceRule === '-') {
            actions.push(entryChar + ' -> ε');
            stackes.push(stack.substring(0, stack.length - 1));
            entries.push(entry);
            continue;
        }

        actions.push(entryChar + ' -> ' + sentenceRule);
        sentenceRule = sentenceRule.split('').reverse().join('');
        stackes.push(stack.substring(0, stack.length - 1) + sentenceRule);
        entries.push(entry);
    }

    writeParsingTable();
}

function restart() {
    stackes.splice(0, stackes.length);
    entries.splice(0, entries.length);
    actions.splice(0, actions.length);
    var input = document.getElementById('word-input');
    input.value = '';

    document.getElementById('restart-btn').remove();
    writeParsingTable();
}

function createRestart() {
    var div = document.getElementById('restart-div');
    var btn = document.createElement('button');
    btn.id = 'restart-btn';
    btn.addEventListener('click', () => {
        restart();
    });

    var text = document.createTextNode("Reiniciar");
    btn.appendChild(text);
    div.appendChild(btn);
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

function writeParsingTable() {
    var parsingTable = document.getElementById('parsing-table');

    var existingBody = document.getElementById(parsingTableBodyId);
    if (typeof (existingBody) != 'undefined' && existingBody != null) {
        existingBody.remove();
    }

    var tableBody = document.createElement('tbody');
    tableBody.id = parsingTableBodyId;

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
    var text = document.createTextNode(value);
    td.appendChild(text);
    return td;
}