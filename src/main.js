import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="layout">
    <aside class="sidebar">
      <div class="brand"><span class="logo">R</span><div><b>REXO AI</b><small>YOUR AI ASSISTANT</small></div></div>
      <button class="new-chat" id="newChat">＋ محادثة جديدة</button>
      <div class="side-label">مساحة العمل</div>
      <div class="side-item active">✦ <span>المساعد الذكي</span></div>
      <div class="side-item">⌘ <span>البرمجة والتطوير</span></div>
      <div class="side-item">✎ <span>الكتابة والإبداع</span></div>
      <div class="side-item">◷ <span>سجل المحادثة</span></div>
      <div class="side-bottom"><div class="avatar">R</div><div><b>REXO</b><small>النسخة المحلية</small></div><span class="online"></span></div>
    </aside>

    <main class="main">
      <header class="topbar">
        <button class="menu" id="menu">☰</button>
        <div><b>المساعد الذكي</b><small><span class="dot"></span> جاهز للمحادثة</small></div>
        <button class="clear" id="clear">مسح المحادثة</button>
      </header>

      <section class="conversation" id="conversation">
        <div class="welcome" id="welcome">
          <div class="hero-logo">R</div>
          <div class="eyebrow">MEET YOUR AI ASSISTANT</div>
          <h1>أهلاً بيك في <span>REXO AI</span></h1>
          <p>مساعدك الذكي، جاهز يساعدك تتعلم وتبرمج وتبتكر.</p>
          <div class="suggestions">
            <button data-prompt="ساعدني أتعلم البرمجة من الصفر">⌘ <b>تعلم البرمجة</b><small>ابدأ رحلتك في عالم الكود</small></button>
            <button data-prompt="اقترح لي أفكار لتطوير مشروع REXO">✦ <b>تطوير REXO</b><small>حوّل أفكارك لمشروع حقيقي</small></button>
            <button data-prompt="اكتب لي خطة لتعلم الذكاء الاصطناعي">◈ <b>الذكاء الاصطناعي</b><small>اكتشف المجال خطوة بخطوة</small></button>
            <button data-prompt="اشرح لي كيف تعمل مواقع الإنترنت">◎ <b>تعلم الويب</b><small>افهم المواقع من الداخل</small></button>
          </div>
        </div>
      </section>

      <div class="composer-wrap">
        <form id="chatForm" class="composer">
          <textarea id="message" rows="1" placeholder="اكتب رسالتك إلى REXO..." required></textarea>
          <button id="send" type="submit" aria-label="إرسال">➤</button>
        </form>
        <div class="disclaimer">REXO AI · نسخة تجريبية محلية · لا تشارك كلمات المرور أو المفاتيح السرية</div>
      </div>
    </main>
  </div>
`

const conversation = document.querySelector('#conversation')
const form = document.querySelector('#chatForm')
const input = document.querySelector('#message')
const send = document.querySelector('#send')

function addMessage(text, role) {
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
  conversation.scrollTop = conversation.scrollHeight
}

async function sendMessage(text) {
  text = text.trim()
  if (!text) return
  document.querySelector('#welcome')?.remove()
  addMessage(text, 'user')
  input.value = ''
  send.disabled = true

  const row = document.createElement('div')
  row.className = 'message-row bot'
  const avatar = document.createElement('div')
  avatar.className = 'message-avatar'
  avatar.textContent = 'R'
  const bubble = document.createElement('div')
  bubble.className = 'bubble'
  bubble.textContent = 'جاري الاتصال بالخادم...'
  row.append(avatar, bubble)
  conversation.append(row)
  conversation.scrollTop = conversation.scrollHeight

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'حدث خطأ في الخادم')
    bubble.textContent = data.reply || 'وصل رد فارغ من الخادم.'
  } catch (error) {
    bubble.textContent = 'تعذر الاتصال بخادم REXO. تأكد أن السيرفر الخلفي شغال، ثم جرّب مرة أخرى.'
  } finally {
    send.disabled = false
    input.focus()
    conversation.scrollTop = conversation.scrollHeight
  }
}

form.addEventListener('submit', event => {
  event.preventDefault()
  sendMessage(input.value)
})

document.querySelectorAll('[data-prompt]').forEach(button => {
  button.addEventListener('click', () => sendMessage(button.dataset.prompt))
})

document.querySelector('#newChat').addEventListener('click', () => {
  conversation.innerHTML = `
    <div class="welcome" id="welcome">
      <div class="hero-logo">R</div>
      <div class="eyebrow">MEET YOUR AI ASSISTANT</div>
      <h1>أهلاً بيك في <span>REXO AI</span></h1>
      <p>مساعدك الذكي، جاهز يساعدك تتعلم وتبرمج وتبتكر.</p>
      <div class="suggestions">
        <button data-prompt="ساعدني أتعلم البرمجة من الصفر">⌘ <b>تعلم البرمجة</b><small>ابدأ رحلتك في عالم الكود</small></button>
        <button data-prompt="اقترح لي أفكار لتطوير مشروع REXO">✦ <b>تطوير REXO</b><small>حوّل أفكارك لمشروع حقيقي</small></button>
        <button data-prompt="اكتب لي خطة لتعلم الذكاء الاصطناعي">◈ <b>الذكاء الاصطناعي</b><small>اكتشف المجال خطوة بخطوة</small></button>
        <button data-prompt="اشرح لي كيف تعمل مواقع الإنترنت">◎ <b>تعلم الويب</b><small>افهم المواقع من الداخل</small></button>
      </div>
    </div>`
  bindSuggestions()
})

function bindSuggestions() {
  document.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', () => sendMessage(button.dataset.prompt))
  })
}

document.querySelector('#clear').addEventListener('click', () => {
  conversation.querySelectorAll('.message-row').forEach(row => row.remove())
  if (!document.querySelector('#welcome')) {
    conversation.insertAdjacentHTML('afterbegin', `
      <div class="welcome" id="welcome">
        <div class="hero-logo">R</div>
        <div class="eyebrow">MEET YOUR AI ASSISTANT</div>
        <h1>أهلاً بيك في <span>REXO AI</span></h1>
        <p>مساعدك الذكي، جاهز يساعدك تتعلم وتبرمج وتبتكر.</p>
      </div>`)
  }
})

document.querySelector('#menu').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open')
})
