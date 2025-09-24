const loginBtn = document.getElementById('login-btn');

loginBtn.addEventListener('click', () => {
  const emailInput = document.getElementById('email');
  const passInput  = document.getElementById('password');
  const msg        = document.getElementById('login-msg');

  const email    = emailInput.value.trim();
  const password = passInput.value;

  // Email regex (basic RFC-compliant pattern)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // LUDS password: lower, upper, digit, special, min 8
  const ludsRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  let valid = true;

  // Check email
  if (!emailRegex.test(email)) {
    emailInput.classList.add('invalid');
    valid = false;
  } else {
    emailInput.classList.remove('invalid');
  }

  // Check password
  if (!ludsRegex.test(password)) {
    passInput.classList.add('invalid');
    valid = false;
  } else {
    passInput.classList.remove('invalid');
  }

  if (!valid) {
    msg.textContent = 'Fix highlighted fields to continue.';
    return;
  }

  // Success: show calculator
  msg.textContent = '';
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('calc-screen').classList.remove('hidden');
});

document.getElementById('toggle-pass').addEventListener('click', () => {
  const passInput = document.getElementById('password');
  passInput.type = passInput.type === 'password' ? 'text' : 'password';
});

const passInput = document.getElementById('password');

// helper to toggle classes
function toggleReq(id, condition) {
  const el = document.getElementById(id);
  el.classList.toggle('met', condition);
  el.classList.toggle('unmet', !condition);
}

passInput.addEventListener('input', () => {
  const val = passInput.value;
  toggleReq('req-lower', /[a-z]/.test(val));
  toggleReq('req-upper', /[A-Z]/.test(val));
  toggleReq('req-digit', /\d/.test(val));
  toggleReq('req-special', /[^A-Za-z0-9]/.test(val));
  toggleReq('req-length', val.length >= 8);
});

function resetRequirements() {
  document.querySelectorAll('.req').forEach(r => {
    r.classList.remove('met');
    r.classList.add('unmet');
  });
}

document.querySelectorAll('.req').forEach(r => r.classList.add('unmet'));


// Calculator logic
let justCalculated = false;
const display = document.getElementById('display');
const errorMsg = document.getElementById('error-msg');
const historyEl = document.getElementById('history');
const currentEl = document.getElementById('current');

function showError(msg) {
  errorMsg.textContent = msg;
}

function adjustFont() {
  const len = currentEl.textContent.length;

  // Start large, shrink rapidly
  if (len <= 1)   currentEl.style.fontSize = "40px";
  if (len > 10)      currentEl.style.fontSize = "36px";
  if (len > 15)      currentEl.style.fontSize = "30px";
  if (len > 20)      currentEl.style.fontSize = "26px";
  if (len > 25)      currentEl.style.fontSize = "22px";
  if (len > 30)      currentEl.style.fontSize = "18px";
  if (len > 40)      currentEl.style.fontSize = "16px";
  if (len > 50)      currentEl.style.fontSize = "14px";
}

function appendValue(val) {
  if (errorMsg.textContent) showError('');

  if (justCalculated && /[\d.]/.test(val)) {
    // start a new calculation after result if digit/decimal
    historyEl.textContent = '';
    currentEl.textContent = '';
    justCalculated = false;
  } else if (justCalculated && /[+\-×÷%]/.test(val)) {
    // continue from result
    historyEl.textContent = currentEl.textContent;
    justCalculated = false;
  }

  currentEl.textContent += val;
  adjustFont();
}

document.querySelectorAll('.calc-btn[data-val]').forEach(btn => {
  btn.addEventListener('click', () => appendValue(btn.dataset.val));
});

function processPercent(expr) {
  // make a working copy and normalize ×/÷ to * and /
  let e = expr.replace(/×/g, '*').replace(/÷/g, '/');

  // Regexes for common patterns (numbers with optional decimals)
  const num = '([0-9]+(?:\\.[0-9]+)?)';
  const addSubRegex = new RegExp(num + '\\s*([+\\-])\\s*' + num + '%');
  const mulRegex = new RegExp(num + '\\s*[\\*x×]\\s*' + num + '%', 'i');
  const divRegex = new RegExp(num + '\\s*\\/\\s*' + num + '%');

  // Loop until no % left or no further replacements possible
  let prev;
  do {
    prev = e;

    // a + b%  OR  a - b%  => a +/- (a * b / 100)
    e = e.replace(addSubRegex, (m, a, op, b) => {
      return `${a}${op}(${a}*${b}/100)`;
    });

    // a * b%  (or a × b%) => a * (b / 100)
    e = e.replace(mulRegex, (m, a, b) => {
      return `${a}*(${b}/100)`;
    });

    // a / b%  (or a ÷ b%) => a / (b / 100)
    e = e.replace(divRegex, (m, a, b) => {
      return `${a}/(${b}/100)`;
    });

    // any remaining standalone "50%" -> (50/100)
    e = e.replace(/([0-9]+(?:\.[0-9]+)?)%/g, (m, n) => `(${n}/100)`);

  } while (e !== prev);

  return e;
}

document.getElementById('equals').addEventListener('click', () => {
  try {
    // use textContent of the current line instead of display.value
    if (!currentEl.textContent.trim()) {
      showError('Enter a calculation first.');
      return;
    }

    // 1) Get the visible expression
    let expression = currentEl.textContent;

    // 2) Process percentages with operator-aware logic
    expression = processPercent(expression);

    // 3) Convert visible symbols to JS operators
    expression = expression.replace(/÷/g, '/').replace(/×/g, '*');

    // 4) Evaluate safely
    const result = Function('"use strict";return (' + expression + ')')();
    if (!isFinite(result)) {
      showError('Math error (e.g. divide by 0).');
      return;
    }

    // update the history line and current result
    historyEl.textContent = currentEl.textContent + ' =';
    currentEl.textContent = result;

    adjustFont();          // keep the auto-zoom feature
    justCalculated = true;
    if (errorMsg.textContent) showError('');
  } catch {
    showError('Invalid expression.');
  }
});


// C – full clear
document.getElementById('clear-all').addEventListener('click', () => {
  historyEl.textContent = '';
  currentEl.textContent = '';
  showError('');
  justCalculated = false;
  adjustFont();
});

function clearEntry() {
  // When a result is currently shown, behave like full clear
  if (justCalculated) {
    currentEl.textContent = '';
    if (historyEl) historyEl.textContent = '';
    showError('');
    justCalculated = false;
    adjustFont();
    return;
  }

  // Normal CE: remove the last number/decimal group from the *current* line
  let expr = currentEl.textContent.trim();
  if (!expr) return;

  expr = expr.replace(/(\d+(\.\d+)?)\s*$/, ''); // strip last number
  expr = expr.replace(/\s*$/, '');              // clean trailing spaces

  currentEl.textContent = expr;
  if (errorMsg.textContent) showError('');
  justCalculated = false;
  adjustFont();
}

// Clear Entry /
document.getElementById('clear-entry')
        .addEventListener('click', clearEntry);

// Backspace – delete last character of HISTORY (keep result)
document.getElementById('backspace').addEventListener('click', () => {
  // Case 1: User has just seen a result
  if (justCalculated && historyEl.textContent) {
    // Move the history (remove trailing "=" if you added it)
    const expr = historyEl.textContent.replace(/\s*=\s*$/, '');
    historyEl.textContent = '';
    currentEl.textContent = expr.slice(0, -1); // remove last char immediately
    justCalculated = false;
    adjustFont();
    return;
  }

  // Case 2: Normal backspace while editing
  if (currentEl.textContent) {
    currentEl.textContent = currentEl.textContent.slice(0, -1);
    adjustFont();
  } else if (historyEl.textContent) {
    // optional: if current is empty, backspace history instead
    historyEl.textContent = historyEl.textContent.slice(0, -1);
  }
});

// Logout
document.getElementById('logout').addEventListener('click', (e) => {
  e.preventDefault();

  // Hide calculator / show login
  document.getElementById('calc-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');

  // Clear fields
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';

  // Clear displays if needed
  if (historyEl) historyEl.textContent = '';
  if (currentEl) currentEl.textContent = '';

  // ✅ Force all password requirement boxes to red/unmet
  resetRequirements();
});
