const socket = io();
// join the room with slug
socket.on("connect", () => {
  socket.emit("join-room", slug);
});

let isRemoteUpdate = false;
let editor;
let pendingContent = null;

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
  editor = monaco.editor.create(document.getElementById('container'), {
    value: "function hello() {\n\tconsole.log('Hello world!');\n}",
    language: '',
    theme: 'vs-dark',

    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    wordBasedSuggestions: false,
    parameterHints: { enabled: false }
  });

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