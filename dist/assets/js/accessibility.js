// accessibility.js: control del panel de accesibilidad (display-only, robusto)
(function(){
  function ensureButton(){
    const accBtnEl = document.getElementById('accessibility-btn');
    if (!accBtnEl) return;
  // Move to end of body to win stacking order within same context
  try { if (accBtnEl.parentNode !== document.body) document.body.appendChild(accBtnEl); else document.body.appendChild(accBtnEl); } catch(_) {}
    accBtnEl.style.position = 'fixed';
  accBtnEl.style.bottom = '1.5rem';
  accBtnEl.style.left = '1.5rem';
  accBtnEl.style.right = 'auto';
  accBtnEl.style.zIndex = '2147483647';
    accBtnEl.style.display = 'inline-flex';
    accBtnEl.style.visibility = 'visible';
    accBtnEl.style.opacity = '1';
    accBtnEl.style.pointerEvents = 'auto';
  accBtnEl.style.transform = 'none';
  accBtnEl.style.filter = 'none';
  accBtnEl.classList.remove('hidden');
  }
  function ensurePanel(){
    // Si no existe el panel en el DOM (caso index), créalo dinámicamente (sin botón)
    let accPanel = document.getElementById('accessibility-panel');
    if (!accPanel){
  const style = document.createElement('style');
  style.textContent = 'html,body{transition:font-size .25s ease,line-height .25s ease,filter .25s ease}html.acc-visual{font-size:1.15rem}html.acc-visual body{filter:contrast(1.05)saturate(1.05)}html.acc-dislexia{font-family:\'OpenDyslexic\',Inter,sans-serif}html.acc-motriz a,html.acc-motriz button{padding:.75rem}html.acc-cognitiva{line-height:1.6}#accessibility-btn{position:fixed;z-index:2147483647!important;pointer-events:auto!important}#accessibility-panel{pointer-events:auto}';
      document.head.appendChild(style);
      accPanel = document.createElement('div');
      accPanel.id = 'accessibility-panel';
      accPanel.className = 'fixed bottom-20 left-6 z-50 w-80 bg-white border border-gray-200 rounded-lg p-4 shadow-lg hidden';
      accPanel.setAttribute('role','dialog');
      accPanel.setAttribute('aria-label','Panel de accesibilidad');
      accPanel.setAttribute('data-init-hidden','true');
    accPanel.innerHTML = '<h3 class="text-lg font-semibold mb-2">Ajustes de accesibilidad</h3>\
      <p class="text-sm text-gray-600 mb-3">Selecciona una preferencia para ajustar la interfaz.</p>\
      <div role="radiogroup" aria-label="Tipo de discapacidad">\
        <label class="flex items-center mb-2 cursor-pointer">\
          <input type="radio" name="disabilityType" value="visual" class="mr-2">\
      <span>Ajustes visuales</span>\
        </label>\
        <label class="flex items-center mb-2 cursor-pointer">\
          <input type="radio" name="disabilityType" value="auditiva" class="mr-2">\
      <span>Ajustes auditivos</span>\
        </label>\
        <label class="flex items-center mb-2 cursor-pointer">\
          <input type="radio" name="disabilityType" value="motriz" class="mr-2">\
          <span>Soporte motriz</span>\
        </label>\
        <label class="flex items-center mb-2 cursor-pointer">\
          <input type="radio" name="disabilityType" value="cognitiva" class="mr-2">\
          <span>Facilidades cognitivas</span>\
        </label>\
        <label class="flex items-center mb-2 cursor-pointer">\
          <input type="radio" name="disabilityType" value="dislexia" class="mr-2">\
          <span>Soporte de lectura</span>\
        </label>\
      </div>\
      <p id="accessibility-note" class="mt-3 text-xs text-gray-500">Los cambios son temporales y locales en tu navegador.</p>';
      document.body.appendChild(accPanel);
    }
  }
  function toggle(){
    try {
      const accBtn = document.getElementById('accessibility-btn');
      const accPanel = document.getElementById('accessibility-panel');
      if (!accPanel) return; // permite alternar sin botón
      // Determinar estado: si tiene clase 'visible', consideramos abierto
      const isOpen = accPanel.classList.contains('visible') && getComputedStyle(accPanel).visibility !== 'hidden';
      if (!isOpen) {
        accPanel.classList.remove('hidden');
        accPanel.style.display = 'block';
        // Compatibilidad con estilos que usan transform/visibility
        accPanel.classList.add('visible');
        accPanel.style.visibility = 'visible';
        accPanel.style.opacity = '1';
        accPanel.style.transform = 'translateX(0)';
        if (accBtn) accBtn.setAttribute('aria-expanded', 'true');
  ensureButton();
        const first = accPanel.querySelector('input, button, [tabindex]');
        if (first) first.focus();
      } else {
        accPanel.classList.add('hidden');
        accPanel.classList.remove('visible');
        accPanel.style.display = 'none';
        accPanel.style.visibility = 'hidden';
        accPanel.style.opacity = '0';
        accPanel.style.transform = 'translateX(-100%)';
        if (accBtn) accBtn.setAttribute('aria-expanded', 'false');
  ensureButton();
      }
    } catch (_) { /* silent */ }
  }
  function applyAccessibility(){
    const val = document.querySelector('input[name="disabilityType"]:checked')?.value || '';
    document.documentElement.setAttribute('data-accessibility', val);
    const accBtnEl = document.getElementById('accessibility-btn');
    if (accBtnEl){
      accBtnEl.style.position = 'fixed';
      accBtnEl.style.zIndex = '99999';
      accBtnEl.style.display = '';
    }
    document.documentElement.classList.remove('acc-visual','acc-auditiva','acc-motriz','acc-cognitiva','acc-dislexia');
  if (val === 'visual') document.documentElement.classList.add('acc-visual');
    if (val === 'auditiva') document.documentElement.classList.add('acc-auditiva');
    if (val === 'motriz') document.documentElement.classList.add('acc-motriz');
    if (val === 'cognitiva') document.documentElement.classList.add('acc-cognitiva');
    if (val === 'dislexia') document.documentElement.classList.add('acc-dislexia');
    const descriptions = {
      visual: 'Aumenta tamaño de fuente y contraste ligero',
      auditiva: 'Activa ayudas auditivas/lectura (no aplica visualmente)',
      motriz: 'Elementos interactivos con mayor área clicable',
      cognitiva: 'Mayor interlineado y ritmo de lectura mejorado',
      dislexia: 'Tipografía y espaciado optimizados para lectura',
    };
    const noteEl = document.getElementById('accessibility-note');
    if (noteEl) noteEl.textContent = 'Modo: ' + (val || 'predeterminado') + (val ? ' — ' + (descriptions[val] || '') : ' — Sin cambios aplicados');
  }
  function init(){
    ensurePanel();
    const accBtn = document.getElementById('accessibility-btn');
    const accPanel = document.getElementById('accessibility-panel');
    if (accPanel){
      const initAttr = accPanel.getAttribute('data-init-hidden');
      const initiallyHidden = initAttr !== null ? (initAttr === 'true') : accPanel.classList.contains('hidden');
      if (initiallyHidden){
        accPanel.classList.add('hidden');
        accPanel.style.display = 'none';
  accPanel.classList.remove('visible');
  accPanel.style.visibility = 'hidden';
  accPanel.style.opacity = '0';
  accPanel.style.transform = 'translateX(-100%)';
  if (accBtn) accBtn.setAttribute('aria-expanded', 'false');
      } else {
        accPanel.classList.remove('hidden');
        accPanel.style.display = 'block';
  accPanel.classList.add('visible');
  accPanel.style.visibility = 'visible';
  accPanel.style.opacity = '1';
  accPanel.style.transform = 'translateX(0)';
  if (accBtn) accBtn.setAttribute('aria-expanded', 'true');
      }
      ensureButton();
      accBtn && accBtn.addEventListener('click', toggle);
      // Atajo opcional: Alt+A para alternar panel
      window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'a' || e.key === 'A')) {
          e.preventDefault();
          toggle();
        }
      });
    }
    document.querySelectorAll('input[name="disabilityType"]').forEach(r => {
      r.addEventListener('change', applyAccessibility);
      r.addEventListener('click', applyAccessibility);
    });
    ensureButton();
    applyAccessibility();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  // expone toggle global para compatibilidad si existiera markup antiguo
  window.toggleAccessibilityPanel = toggle;
})();
