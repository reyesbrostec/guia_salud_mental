// contact.js — Manejo del formulario de contacto (cliente)
(function(){
  // Leer endpoint de Formspree desde meta si está definido
  function getFormspreeEndpoint(){
    const m = document.querySelector('meta[name="contact:formspree"]');
    const v = m && m.getAttribute('content') || '';
    return v && /^https:\/\/formspree\.io\//.test(v) ? v : '';
  }
  const FORMSPREE_ENDPOINT = getFormspreeEndpoint() || 'https://formspree.io/f/REPLACE_FORM_ID';
  function getContactEmail(){
    const m = document.querySelector('meta[name="contact:email"]');
    const v = m && m.getAttribute('content') || '';
    return /@/.test(v) ? v : '';
  }

  function showStatus(el, type, text){
    el.textContent = text;
    el.className = '';
    el.setAttribute('role','status');
    el.classList.add('mt-3','text-sm');
    if (type === 'success') {
      el.classList.add('text-green-600');
    } else if (type === 'error') {
      el.classList.add('text-red-600');
    } else {
      el.classList.add('text-gray-600');
    }
  }

  function validEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function init(){
    const form = document.getElementById('contact-form');
    if (!form) return;

  const deployMeta = document.querySelector('meta[name="deploy:env"]');
  const deployEnv = (deployMeta && deployMeta.getAttribute('content')) || 'development';
  const enableCaptcha = deployEnv === 'production';

    let status = document.getElementById('contact-status');
    if (!status){
      status = document.createElement('p');
      status.id = 'contact-status';
      form.parentNode.insertBefore(status, form.nextSibling);
    }

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = form.querySelector('#nombre');
      const email = form.querySelector('#email');
      const mensaje = form.querySelector('#mensaje');
      if (!nombre || !email || !mensaje){
        showStatus(status, 'error', 'Formulario incompleto.');
        return;
      }
      if (!nombre.value.trim()){
        showStatus(status, 'error', 'Por favor ingresa tu nombre.');
        nombre.focus();
        return;
      }
      if (!validEmail(email.value.trim())){
        showStatus(status, 'error', 'Ingresa un correo válido.');
        email.focus();
        return;
      }
      if (!mensaje.value.trim() || mensaje.value.trim().length < 10){
        showStatus(status, 'error', 'El mensaje debe tener al menos 10 caracteres.');
        mensaje.focus();
        return;
      }

      const payload = {
        nombre: nombre.value.trim(),
        email: email.value.trim(),
        mensaje: mensaje.value.trim(),
        page: location.pathname
      };

      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn){
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';
      }

  const targetEmail = getContactEmail();
  const useFormspree = FORMSPREE_ENDPOINT && !/REPLACE_FORM_ID/.test(FORMSPREE_ENDPOINT);

  try {
        let res;
        if (useFormspree){
          res = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else if (targetEmail) {
          // FormSubmit AJAX endpoint: https://formsubmit.co/ajax/<email>
          const formsubmitUrl = 'https://formsubmit.co/ajax/' + encodeURIComponent(targetEmail);
          const body = {
            name: payload.nombre,
            email: payload.email,
            message: payload.mensaje,
            page: payload.page,
            _subject: 'Nuevo contacto desde Iris Inclusión',
    _template: 'table'
          };
      if (enableCaptcha) body._captcha = 'true'; else body._captcha = 'false';
          res = await fetch(formsubmitUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(body)
          });
        } else {
          showStatus(status, 'error', 'Configura tu Form ID de Formspree o define el email en <meta name="contact:email" ...>.');
          if (submitBtn){
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
          return;
        }
        if (res.ok){
          showStatus(status, 'success', '¡Gracias! Tu mensaje fue enviado.');
          form.reset();
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = data?.error || data?.message || 'No se pudo enviar el mensaje. Intenta más tarde.';
          showStatus(status, 'error', msg);
        }
      } catch (err){
        showStatus(status, 'error', 'Error de red. Revisa tu conexión e intenta nuevamente.');
      } finally {
        if (submitBtn){
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
