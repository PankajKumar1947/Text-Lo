const socket = io();
// join the room with slug
socket.on("connect", () => {
  socket.emit("join-room", slug);
});

let isRemoteUpdate = false;
let editor;
let pendingContent = null;
let currentLanguage = '';

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  }
}

function sendMessage(message) {
  socket.emit("send-message", {
    slug: slug,
    message: message
  });
}

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

socket.on("receive-message", (msg) => {
  applyRemoteContent(msg);
});

// monaco editor
require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
require(['vs/editor/editor.main'], function () {
  // Define custom theme matching the site
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
      'editor.inactiveSelectionBackground': '#1E293B',
      'editorCursor.foreground': '#F97316',
      'editorLineNumber.foreground': '#475569',
      'editorLineNumber.activeForeground': '#94A3B8',
      'editor.selectionHighlightBackground': '#334155',
      'editorIndentGuide.background': '#1E293B',
      'editorIndentGuide.activeBackground': '#334155',
      'editorWidget.background': '#1E293B',
      'editorWidget.border': '#334155',
      'editorSuggestWidget.background': '#1E293B',
      'editorSuggestWidget.border': '#334155',
      'editorSuggestWidget.selectedBackground': '#334155',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#33415580',
      'scrollbarSlider.hoverBackground': '#475569',
      'scrollbarSlider.activeBackground': '#475569',
    }
  });
  
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

  // Hide loader when editor is ready
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
  }

  if (pendingContent) {
    applyRemoteContent(pendingContent);
  }

  const debouncedSendMessage = debounce(sendMessage, 2000);

  // log content on editor change
  editor.onDidChangeModelContent(() => {
    const editorValue = editor.getValue();
    if (isRemoteUpdate) return;
    if (editorValue) {
      debouncedSendMessage(editorValue)
    }
  });
});

// Language selector
const langBtn = document.getElementById('lang-btn');
const langDropdown = document.getElementById('lang-dropdown');
const currentLangSpan = document.getElementById('current-lang');
const langOptions = document.querySelectorAll('.language-option');

if (langBtn && langDropdown) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    langDropdown.classList.remove('show');
  });

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