
import './style.css'

const API_BASE_URL = 'https://lucid-kestrel-0616.de.deplexo.com'
const STORAGE_KEY = 'rexo_conversations_v1'
const MAX_HISTORY_MESSAGES = 12
const MAX_SAVED_CHATS = 50

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <div class="brand">
        <span class="logo">R</span>
        <div><b>REXO AI</b><small>YOUR AI ASSISTANT</small></div>
      </div>
      <button class="new-chat" id="newChat">＋ محادثة جديدة</button>
      <div class="side-label">مساحة العمل</div>
      <div class="side-item active">✦ <span>المساعد الذكي</span></div>
      <div class="side-item">⌘ <span>البرمجة والتطوير</span></div>
      <div class="side-item">✎ <span>الكتابة والإبداع</span></div>
      <div class="side-label">المحادثات السابقة</div>
      <div id="chatHistory" class="chat-history"></div>
      <div class="side-bottom">
        <div class="avatar">R</div>
        <div><b>REXO AI</b><small>من تطوير سيف هاني</small></div>
        <span class="online"></span>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <button class="menu" id="menu" aria-label="القائمة">☰</button>
        <div>
          <b>المساعد الذكي</b>
          <small><span class="dot"></span> جاهز للمحادثة</small>
        </div>
        <button class="clear" id="clear">حذف المحادثة</button>
      </header>

      <section class="conversation" id="conversation"></section>

      <div class="composer-wrap">
        <form id="chatForm" class="composer">
          <textarea id="message" rows="1"
            placeholder="اكتب رسالتك إلى REXO..."
            required></textarea>
          <button id="send" type="submit" aria-label="إرسال">➤</button>
        </form>
        <div class="disclaimer">
          REXO AI · من تطوير سيف هاني · لا تشارك كلمات المرور أو المفاتيح السرية
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
    title: 'محادثة جديدة',
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
    <div class="hero-logo">R</div>
    <div class="eyebrow">YOUR AI ASSISTANT</div>
    <h1>أهلاً بيك في <span>REXO AI</span></h1>
    <p>مساعدك الذكي من تطوير سيف هاني، جاهز يساعدك تتعلم وتبرمج وتبتكر.</p>
    <div class="suggestions">
      <button data-prompt="ساعدني أتعلم البرمجة من الصفر">
        ⌘ <b>تعلم البرمجة</b>
        <small>ابدأ رحلتك في عالم الكود</small>
      </button>
      <button data-prompt="اقترح لي أفكار لتطوير مشروع REXO">
        ✦ <b>تطوير REXO</b>
        <small>حوّل أفكارك لمشروع حقيقي</small>
      </button>
      <button data-prompt="اكتب لي خطة لتعلم الذكاء الاصطناعي">
        ◈ <b>الذكاء الاصطناعي</b>
        <small>اكتشف المجال خطوة بخطوة</small>
      </button>
      <button data-prompt="اشرح لي كيف تعمل مواقع الإنترنت">
        ◎ <b>تعلم الويب</b>
        <small>افهم المواقع من الداخل</small>
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
  avatar.textContent = role === 'user' ? 'أنت' : 'R'

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
    empty.textContent = 'لسه مفيش محادثات محفوظة'
    historyPanel.append(empty)
    return
  }

  chats.forEach(chat => {
    const row = document.createElement('div')
    row.className = 'history-row'

    const openButton = document.createElement('button')
    openButton.className = 'history-open'
    openButton.textContent = chat.title || 'محادثة جديدة'
    openButton.title = chat.title || 'محادثة جديدة'

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
    deleteButton.title = 'حذف هذه المحادثة'

    deleteButton.addEventListener('click', () => {
      if (isSending) return

      chats = chats.filter(item => item.id !== chat.id)

      if (activeChatId === chat.id) {
        activeChatId = null
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
    chat.title = firstMessage.slice(0, 35) || 'محادثة جديدة'
  }
}

async function sendMessage(rawText) {
  const text = rawText.trim()

  if (!text || isSending) return

  if (!getActiveChat()) {
    const chat = {
      id: createId(),
      title: 'محادثة جديدة',
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

  const loadingBubble = addMessageToDOM(
    'جاري التفكير والاتصال بخادم REXO...',
    'bot'
  )

  try {
    // إرسال آخر الرسائل إلى الخادم ليقدر REXO يتابع سياق الحوار.
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
      throw new Error('الخادم رجّع استجابة غير مفهومة.')
    }

    if (!response.ok) {
      throw new Error(data.error || 'حدث خطأ في الخادم.')
    }

    const reply = typeof data.reply === 'string'
      ? data.reply.trim()
      : ''

    if (!reply) {
      throw new Error('وصل رد فارغ من الذكاء الاصطناعي.')
    }

    loadingBubble.textContent = reply
    chat.messages.push({ role: 'bot', text: reply })
    saveChats()
  } catch (error) {
    console.error('REXO connection error:', error)

    loadingBubble.textContent =
      `حصلت مشكلة: ${error.message || 'تعذر الاتصال بالخادم.'}`

    // نحافظ على رسالة المستخدم حتى لا تضيع، لكن لا نحفظ رسالة الخطأ
    // باعتبارها إجابة من الذكاء الاصطناعي.
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

  const confirmed = window.confirm('هل تريد حذف رسائل المحادثة الحالية؟')
  if (!confirmed) return

  chat.messages = []
  chat.title = 'محادثة جديدة'
  saveChats()
  renderConversation()
})

document.querySelector('#menu').addEventListener('click', () => {
  sidebar.classList.toggle('open')
})

input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    form.requestSubmit()
  }
})

// تحميل سجل المحادثات المحفوظ عند فتح التطبيق
if (chats.length > 0) {
  activeChatId = chats[0].id
}

renderHistory()
renderConversation()
