const socket = io({
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// Handle connection lifecycle and ensure room rejoin
socket.on("connect", () => {
  socket.emit("join-room", slug);
});

socket.on("reconnect", () => {
  socket.emit("join-room", slug);
});

// Fallback reconnect check (useful for unstable free hosting)
setInterval(() => {
  if (!socket.connected) {
    socket.connect();
  }
}, 5000);


// Editor State
let isRemoteUpdate = false;
let editor;
let pendingContent = null;
let currentLanguage = '';

// Debounce to reduce excessive socket traffic
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  }
}

// Send editor content to server
function sendMessage(message) {
  socket.emit("send-message", {
    slug: slug,
    message: message
  });
}

// Apply remote updates safely without triggering loops
function applyRemoteContent(msg) {
  if (!editor) {
    pendingContent = msg;
    return;
  }

  isRemoteUpdate = true;

  const position = editor.getPosition();
  editor.setValue(msg);

  if (position) {
    editor.setPosition(position);
  }

  isRemoteUpdate = false;
}

// Listen for updates from other users
socket.on("receive-message", (msg) => {
  applyRemoteContent(msg);
});


// Monaco editor
require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
require(['vs/editor/editor.main'], function () {
  // Custom theme for editor UI
  monaco.editor.defineTheme('textlo-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'F8FAFC', background: '0F172A' },
      { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'F97316' },
      { token: 'string', foreground: '22C55E' },
      { token: 'number', foreground: 'FDBA74' },
      { token: 'type', foreground: '818CFF' },
      { token: 'function', foreground: '818CFF' },
      { token: 'variable', foreground: 'F8FAFC' },
    ],
    colors: {
      'editor.background': '#0F172A',
      'editor.foreground': '#F8FAFC',
      'editor.lineHighlightBackground': '#1E293B',
      'editor.selectionBackground': '#334155',
      'editorCursor.foreground': '#F97316',
      'editorLineNumber.foreground': '#475569',
      'editorLineNumber.activeForeground': '#94A3B8',
    }
  });

  // Initialize editor instance
  editor = monaco.editor.create(document.getElementById('container'), {
    value: "function hello() {\n\tconsole.log('Hello world!');\n}",
    language: '',
    theme: 'textlo-dark',
    fontSize: 15,
    fontFamily: "'Space Grotesk', monospace",
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    wordBasedSuggestions: false,
    parameterHints: { enabled: false },
    automaticLayout: true
  });

  // Hide loading UI
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');

  // Apply any content received before editor init
  if (pendingContent) {
    applyRemoteContent(pendingContent);
  }

  const debouncedSendMessage = debounce(sendMessage, 2000);

  // Emit updates when user edits content
  editor.onDidChangeModelContent(() => {
    const editorValue = editor.getValue();

    if (isRemoteUpdate) return;

    if (editorValue) {
      debouncedSendMessage(editorValue);
    }
  });
});


// Language selector
const langBtn = document.getElementById('lang-btn');
const langDropdown = document.getElementById('lang-dropdown');
const currentLangSpan = document.getElementById('current-lang');
const langOptions = document.querySelectorAll('.language-option');

if (langBtn && langDropdown) {

  // Toggle dropdown
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('show');
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    langDropdown.classList.remove('show');
  });

  // Handle language selection
  langOptions.forEach(option => {
    option.addEventListener('click', () => {

      const lang = option.dataset.lang;
      currentLanguage = lang;

      currentLangSpan.textContent = option.textContent;
      langDropdown.classList.remove('show');

      if (editor) {
        const model = editor.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, lang || 'plaintext');
        }
      }
    });
  });
}