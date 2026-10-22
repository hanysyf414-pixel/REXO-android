
import './style.css'

const API_BASE_URL = 'https://lucid-kestrel-0616.de.deplexo.com'
const STORAGE_KEY = 'rexo_conversations_v1'
const MAX_HISTORY_MESSAGES = 12
const MAX_SAVED_CHATS = 50

const app = document.querySelector('#app')
let language = localStorage.getItem('rexo_language') || 'ar'

const translations = {
  ar: {
    workspace: 'مساحة العمل',
    assistant: 'المساعد الذكي',
    coding: 'البرمجة والتطوير',
    writing: 'الكتابة والإبداع',
    previous: 'المحادثات السابقة',
    newChat: '＋ محادثة جديدة',
    deleteChat: 'حذف المحادثة',
    ready: 'جاهز للمحادثة',
    welcome: 'أهلاً بيك في',
    description: 'مساعدك الذكي من تطوير سيف هاني، جاهز يساعدك تتعلم وتبرمج وتبتكر.',
    learnCoding: 'تعلم البرمجة',
    codingDesc: 'ابدأ رحلتك في عالم الكود',
    develop: 'تطوير REXO',
    developDesc: 'حوّل أفكارك لمشروع حقيقي',
    ai: 'الذكاء الاصطناعي',
    aiDesc: 'اكتشف المجال خطوة بخطوة',
    web: 'تعلم الويب',
    webDesc: 'افهم المواقع من الداخل',
    empty: 'لسه مفيش محادثات محفوظة',
    placeholder: 'اكتب رسالتك إلى REXO...',
    thinking: 'جاري التفكير والاتصال بخادم REXO...',
    error: 'حصلت مشكلة:',
    unknownError: 'تعذر الاتصال بالخادم.',
    invalidResponse: 'الخادم رجّع استجابة غير مفهومة.',
    emptyReply: 'وصل رد فارغ من الذكاء الاصطناعي.',
    deleteConfirm: 'هل تريد حذف رسائل المحادثة الحالية؟',
    developer: 'من تطوير سيف هاني',
    warning: 'لا تشارك كلمات المرور أو المفاتيح السرية',
    newTitle: 'محادثة جديدة',
    connectionError: 'حدث خطأ في الاتصال',
    deleteOne: 'حذف هذه المحادثة',
    confirmDeleteOne: 'هل تريد حذف هذه المحادثة؟',
    serverError: 'حدث خطأ في الخادم.',
    langButton: 'EN'
  },
  en: {
    workspace: 'Workspace',
    assistant: 'AI Assistant',
    coding: 'Coding & Development',
    writing: 'Writing & Creativity',
    previous: 'Recent Chats',
    newChat: '＋ New Chat',
    deleteChat: 'Clear Chat',
    ready: 'Ready to chat',
    welcome: 'Welcome to',
    description: 'Your AI assistant, developed by Saif Hany. Ready to help you learn, code, and create.',
    learnCoding: 'Learn Coding',
    codingDesc: 'Start your coding journey',
    develop: 'Build REXO',
    developDesc: 'Turn ideas into real projects',
    ai: 'Artificial Intelligence',
    aiDesc: 'Explore AI step by step',
    web: 'Learn Web Development',
    webDesc: 'Understand how websites work',
    empty: 'No saved conversations yet',
    placeholder: 'Send a message to REXO...',
    thinking: 'Thinking and connecting to REXO...',
    error: 'Something went wrong:',
    unknownError: 'Could not connect to the server.',
    invalidResponse: 'The server returned an invalid response.',
    emptyReply: 'The AI returned an empty reply.',
    deleteConfirm: 'Do you want to clear this conversation?',
    developer: 'Developed by Saif Hany',
    warning: 'Never share passwords or secret keys',
    newTitle: 'New Chat',
    connectionError: 'Connection error',
    deleteOne: 'Delete this conversation',
    confirmDeleteOne: 'Do you want to delete this conversation?',
    serverError: 'A server error occurred.',
    langButton: 'عربي'
  }
}

function t(key) {
  return translations[language]?.[key] || translations.ar[key] || key
}

function applyLanguage() {
  document.documentElement.lang = language
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
}

app.innerHTML = `
  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <div class="brand">
        <div class="logo">R</div>
        <div class="brand-text">
          <b>REXO<span> AI</span></b>
          <small>BEYOND INTELLIGENCE</small>
        </div>
      </div>

      <button class="new-chat" id="newChat"></button>

      <div class="side-label" data-t="workspace"></div>
      <div class="side-item active">✦ <span data-t="assistant"></span></div>
      <div class="side-item">⌘ <span data-t="coding"></span></div>
      <div class="side-item">✎ <span data-t="writing"></span></div>

      <div class="side-label" data-t="previous"></div>
      <div id="chatHistory" class="chat-history"></div>

      <div class="side-bottom">
        <div class="avatar">R</div>
        <div class="profile-text">
          <b>REXO AI</b>
          <small data-t="developer"></small>
        </div>
        <span class="online"></span>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <button class="menu" id="menu" aria-label="Menu">☰</button>

        <div class="top-title">
          <b data-t="assistant"></b>
          <small><span class="dot"></span><span data-t="ready"></span></small>
        </div>

        <div class="top-actions">
          <button class="language-button" id="languageButton">EN</button>
          <button class="clear" id="clear"></button>
        </div>
      </header>

      <section class="conversation" id="conversation"></section>

      <div class="composer-wrap">
        <form id="chatForm" class="composer">
          <textarea id="message" rows="1" required></textarea>
          <button id="send" type="submit" aria-label="Send">➤</button>
        </form>

        <div class="disclaimer">
          REXO AI <span class="footer-separator">◆</span>
          <span data-t="developer"></span>
          <span class="footer-separator">◆</span>
          <span data-t="warning"></span>
        </div>
      </div>
    </main>
  </div>
`

const conversation = document.querySelector('#conversation')
const form = document.querySelector('#chatForm')
const input = document.querySelector('#message')
const send = document.querySelector('#send')
const historyPanel = document.querySelector('#chatHistory')
const sidebar = document.querySelector('#sidebar')
const languageButton = document.querySelector('#languageButton')

function loadChats() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []

    if (!Array.isArray(parsed)) return []

    return parsed.filter(chat =>
      chat &&
      typeof chat.id === 'string' &&
      Array.isArray(chat.messages)
    ).slice(0, MAX_SAVED_CHATS)
  } catch (error) {
    console.error('Could not load saved chats:', error)
    return []
  }
}

let chats = loadChats()
let activeChatId = null
let isSending = false

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function saveChats() {
  try {
    chats = chats.slice(0, MAX_SAVED_CHATS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    renderHistory()
    return true
  } catch (error) {
    console.error('Could not save chats:', error)
    return false
  }
}

function getActiveChat() {
  return chats.find(chat => chat.id === activeChatId) || null
}

function createChat() {
  const chat = {
    id: createId(),
    title: t('newTitle'),
    createdAt: new Date().toISOString(),
    messages: []
  }

  chats.unshift(chat)
  activeChatId = chat.id
  saveChats()
  renderConversation()
  input.focus()
}

function makeWelcome() {
  const welcome = document.createElement('div')
  welcome.className = 'welcome'

  welcome.innerHTML = `
    <div class="hero-orbit">
      <div class="hero-logo">R</div>
      <span class="orbit orbit-one"></span>
      <span class="orbit orbit-two"></span>
    </div>

    <div class="eyebrow">THE NEXT GENERATION AI</div>

    <h1>
      ${t('welcome')}
      <span class="gradient-text">REXO AI</span>
    </h1>

    <p>${t('description')}</p>

    <div class="suggestions">
      <button data-prompt="${language === 'ar' ? 'ساعدني أتعلم البرمجة من الصفر' : 'Help me learn programming from scratch'}">
        <span class="suggestion-icon">⌘</span>
        <span class="suggestion-content">
          <b>${t('learnCoding')}</b>
          <small>${t('codingDesc')}</small>
        </span>
        <span class="suggestion-arrow">↗</span>
      </button>

      <button data-prompt="${language === 'ar' ? 'اقترح لي أفكار لتطوير مشروع REXO' : 'Suggest ideas to improve REXO'}">
        <span class="suggestion-icon">✦</span>
        <span class="suggestion-content">
          <b>${t('develop')}</b>
          <small>${t('developDesc')}</small>
        </span>
        <span class="suggestion-arrow">↗</span>
      </button>

      <button data-prompt="${language === 'ar' ? 'اكتب لي خطة لتعلم الذكاء الاصطناعي' : 'Create a plan to learn artificial intelligence'}">
        <span class="suggestion-icon">◈</span>
        <span class="suggestion-content">
          <b>${t('ai')}</b>
          <small>${t('aiDesc')}</small>
        </span>
        <span class="suggestion-arrow">↗</span>
      </button>

      <button data-prompt="${language === 'ar' ? 'اشرح لي كيف تعمل مواقع الإنترنت' : 'Explain how websites work'}">
        <span class="suggestion-icon">◎</span>
        <span class="suggestion-content">
          <b>${t('web')}</b>
          <small>${t('webDesc')}</small>
        </span>
        <span class="suggestion-arrow">↗</span>
      </button>
    </div>
  `

  welcome.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', () => {
      sendMessage(button.dataset.prompt)
    })
  })

  return welcome
}

function addMessageToDOM(text, role) {
  const row = document.createElement('div')
  row.className = `message-row ${role}`

  const avatar = document.createElement('div')
  avatar.className = 'message-avatar'
  avatar.textContent = role === 'user'
    ? (language === 'ar' ? 'أنت' : 'YOU')
    : 'R'

  const bubble = document.createElement('div')
  bubble.className = 'bubble'
  bubble.textContent = text

  row.append(avatar, bubble)
  conversation.append(row)

  return bubble
}

function renderConversation() {
  conversation.innerHTML = ''
  const chat = getActiveChat()

  if (!chat || chat.messages.length === 0) {
    conversation.append(makeWelcome())
    return
  }

  chat.messages.forEach(message => {
    addMessageToDOM(
      message.text,
      message.role === 'user' ? 'user' : 'bot'
    )
  })

  conversation.scrollTop = conversation.scrollHeight
}

function renderHistory() {
  historyPanel.innerHTML = ''

  if (chats.length === 0) {
    const empty = document.createElement('small')
    empty.className = 'history-empty'
    empty.textContent = t('empty')
    historyPanel.append(empty)
    return
  }

  chats.forEach(chat => {
    const row = document.createElement('div')
    row.className = 'history-row'

    const openButton = document.createElement('button')
    openButton.className = 'history-open'
    openButton.textContent = chat.title || t('newTitle')
    openButton.title = chat.title || t('newTitle')

    if (chat.id === activeChatId) {
      openButton.classList.add('active')
    }

    openButton.addEventListener('click', () => {
      if (isSending) return
      activeChatId = chat.id
      renderConversation()
      renderHistory()
      sidebar.classList.remove('open')
    })

    const deleteButton = document.createElement('button')
    deleteButton.className = 'history-delete'
    deleteButton.textContent = '×'
    deleteButton.title = t('deleteOne')
    deleteButton.setAttribute('aria-label', t('deleteOne'))

    deleteButton.addEventListener('click', () => {
      if (isSending) return

      if (!window.confirm(t('confirmDeleteOne'))) return

      chats = chats.filter(item => item.id !== chat.id)

      if (activeChatId === chat.id) {
        activeChatId = chats[0]?.id || null
      }

      saveChats()
      renderConversation()
    })

    row.append(openButton, deleteButton)
    historyPanel.append(row)
  })
}

function updateChatTitle(chat, firstMessage) {
  if (chat.messages.length === 1) {
    chat.title = firstMessage.slice(0, 35) || t('newTitle')
  }
}

function updateInterfaceText() {
  document.querySelectorAll('[data-t]').forEach(element => {
    const key = element.dataset.t
    element.textContent = t(key)
  })

  document.querySelector('#newChat').textContent = t('newChat')
  document.querySelector('#clear').textContent = t('deleteChat')
  input.placeholder = t('placeholder')
  languageButton.textContent = t('langButton')

  applyLanguage()
  renderHistory()
  renderConversation()
}

async function sendMessage(rawText) {
  const text = rawText.trim()

  if (!text || isSending) return

  if (!getActiveChat()) {
    const chat = {
      id: createId(),
      title: t('newTitle'),
      createdAt: new Date().toISOString(),
      messages: []
    }

    chats.unshift(chat)
    activeChatId = chat.id
  }

  const chat = getActiveChat()
  if (!chat) return

  isSending = true
  send.disabled = true
  input.value = ''

  chat.messages.push({ role: 'user', text })
  updateChatTitle(chat, text)
  saveChats()
  renderConversation()
  renderHistory()

  const loadingBubble = addMessageToDOM(t('thinking'), 'bot')

  try {
    const history = chat.messages
      .slice(0, -1)
      .slice(-MAX_HISTORY_MESSAGES)
      .map(message => ({
        role: message.role === 'bot' ? 'model' : 'user',
        text: message.text
      }))

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history }),
      signal: AbortSignal.timeout(35000)
    })

    let data

    try {
      data = await response.json()
    } catch {
      throw new Error(t('invalidResponse'))
    }

    if (!response.ok) {
      throw new Error(data.error || t('serverError'))
    }

    const reply = typeof data.reply === 'string'
      ? data.reply.trim()
      : ''

    if (!reply) {
      throw new Error(t('emptyReply'))
    }

    loadingBubble.textContent = reply
    chat.messages.push({ role: 'bot', text: reply })
    saveChats()
  } catch (error) {
    console.error('REXO connection error:', error)

    loadingBubble.textContent =
      `${t('error')} ${error.message || t('unknownError')}`

    saveChats()
  } finally {
    isSending = false
    send.disabled = false
    input.focus()
    conversation.scrollTop = conversation.scrollHeight
    renderHistory()
  }
}

form.addEventListener('submit', event => {
  event.preventDefault()
  sendMessage(input.value)
})

document.querySelector('#newChat').addEventListener('click', () => {
  if (isSending) return
  createChat()
  sidebar.classList.remove('open')
})

document.querySelector('#clear').addEventListener('click', () => {
  if (isSending) return

  const chat = getActiveChat()

  if (!chat) {
    renderConversation()
    return
  }

  if (!window.confirm(t('deleteConfirm'))) return

  chat.messages = []
  chat.title = t('newTitle')
  saveChats()
  renderConversation()
})

document.querySelector('#menu').addEventListener('click', () => {
  sidebar.classList.toggle('open')
})

languageButton.addEventListener('click', () => {
  language = language === 'ar' ? 'en' : 'ar'

  try {
    localStorage.setItem('rexo_language', language)
  } catch (error) {
    console.error('Could not save language preference:', error)
  }

  updateInterfaceText()
})

input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    form.requestSubmit()
  }
})

if (chats.length > 0) {
  activeChatId = chats[0].id
}

applyLanguage()
updateInterfaceText()
