// Solis · menu do celular e formulário que abre a conversa no WhatsApp.
// O número do WhatsApp fica no atributo data-whatsapp do <body> (só dígitos, com 55 e DDD).
(function () {
  const body = document.body;
  const phone = (body.dataset.whatsapp || '').replace(/\D/g, '');
  const waUrl = text => `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

  // Links "falar no WhatsApp" usam a mensagem do atributo data-wa-text.
  document.querySelectorAll('[data-wa]').forEach(a => {
    a.href = waUrl(a.dataset.waText || body.dataset.waDefault || '');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Menu do celular.
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Fechar' : 'Menu';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Menu';
    }));
  }

  // Ano do rodapé.
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Formulário → mensagem no WhatsApp. Nada é gravado pelo site.
  const form = document.getElementById('lead-form');
  if (!form) return;

  function setError(field, msg) {
    const wrap = field.closest('.field') || field.closest('.consent');
    const err = wrap && wrap.querySelector('.err');
    if (err) err.textContent = msg || '';
    if (field.matches('input, select, textarea')) field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validate() {
    let first = null;
    form.querySelectorAll('[required]').forEach(el => {
      let msg = '';
      if (el.type === 'checkbox') msg = el.checked ? '' : 'Marque para continuar.';
      else if (el.type === 'radio') {
        const group = form.querySelectorAll(`[name="${el.name}"]`);
        if (![...group].some(r => r.checked)) msg = 'Escolha uma opção.';
      } else if (!el.value.trim()) msg = 'Preencha este campo.';
      else if (el.type === 'tel' && el.value.replace(/\D/g, '').length < 10) msg = 'Informe o número com DDD.';
      else if (el.type === 'date' && el.min && el.value < el.min) msg = 'Escolha uma data a partir de hoje.';
      setError(el, msg);
      if (msg && !first) first = el;
    });
    // Data de volta não pode ser antes da ida.
    const ida = form.querySelector('[name="ida"]'), volta = form.querySelector('[name="volta"]');
    if (ida && volta && ida.value && volta.value && volta.value < ida.value) {
      setError(volta, 'A volta precisa ser depois da ida.');
      if (!first) first = volta;
    }
    if (first) first.focus();
    return !first;
  }

  form.querySelectorAll('input, select, textarea').forEach(el =>
    el.addEventListener('input', () => setError(el, '')));

  const fmtDate = v => v ? v.split('-').reverse().join('/') : '';

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;
    const lines = [form.dataset.intro || 'Olá! Vim pelo site.'];
    form.querySelectorAll('[data-label]').forEach(el => {
      let v = '';
      if (el.type === 'radio') { if (!el.checked) return; v = el.value; }
      else if (el.type === 'date') v = fmtDate(el.value);
      else v = el.value.trim();
      if (v) lines.push(`${el.dataset.label}: ${v}`);
    });
    if (form.dataset.outro) lines.push('', form.dataset.outro);
    window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
    const note = form.querySelector('.form-note');
    if (note) note.textContent = 'Abrimos o WhatsApp com a sua mensagem. É só tocar em enviar.';
  });

  // Datas mínimas = hoje.
  const today = new Date().toISOString().slice(0, 10);
  form.querySelectorAll('input[type="date"]').forEach(d => { d.min = today; });
})();
