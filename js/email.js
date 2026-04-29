
(function () {

  // ── CONFIG — Replace these with your EmailJS credentials ──
  const EMAILJS_PUBLIC_KEY = 'grB2fo-zU6NAyiS0l';   // from EmailJS → Account → API Keys
  const EMAILJS_SERVICE_ID = 'service_x3u6oqa';   // from EmailJS → Email Services
  const EMAILJS_TEMPLATE_ID = 'template_hlmvcuj';  // from EmailJS → Email Templates

  // ── Init EmailJS ──────────────────────────────
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  // ── Form handler ──────────────────────────────
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('cf-btn');
  const btnText = document.getElementById('cf-btn-text');
  const status = document.getElementById('cf-status');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Basic validation
    const name = form.from_name.value.trim();
    const email = form.reply_to.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !subject || !message) {
      showStatus('error', '⚠ Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('error', '⚠ Please enter a valid email address.');
      return;
    }
    if (message.length < 10) {
      showStatus('error', '⚠ Message is too short.');
      return;
    }

    // Loading state
    btn.disabled = true;
    btnText.textContent = '⟳ Transmitting...';
    showStatus('', '');

    try {
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS not loaded. Check your internet connection.');
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          reply_to: email,
          subject: subject,
          message: message
        }
      );

      // Success
      btnText.textContent = '✓ Message Sent!';
      showStatus('success', '✅ Transmission successful! I\'ll get back to you within 24 hours.');
      form.reset();
      setTimeout(() => {
        btn.disabled = false;
        btnText.textContent = 'Send Transmission ⟶';
      }, 4000);

    } catch (err) {
      console.error('EmailJS error:', err);
      btn.disabled = false;
      btnText.textContent = 'Send Transmission ⟶';

      // Graceful fallback: open mailto
      const mailtoLink = `mailto:sivagovind005@gmail.com`
        + `?subject=${encodeURIComponent(subject)}`
        + `&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;

      showStatus('error',
        '⚠ Direct send failed. '
        + `<a href="${mailtoLink}" style="color:var(--neon-cyan);text-decoration:underline">Click here to send via email client</a>`
      );
    }
  });

  function showStatus(type, msg) {
    status.innerHTML = msg;
    status.className = 'cf-status ' + type;
  }

})();