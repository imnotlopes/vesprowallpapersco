/* Proteção leve contra cópia das artes (pedido do dono): sem menu do botão direito e sem arrastar imagens.
 * Campos de texto continuam com o menu normal (colar e-mail, corretor). O toque longo no iPhone é bloqueado no CSS
 * (img { -webkit-touch-callout: none } em global.css). Não impede print nem as ferramentas do navegador: só desencoraja. */
(function () {
  var editable = function (el) { return el && el.closest && el.closest('input, textarea, select, [contenteditable="true"]'); };
  document.addEventListener('contextmenu', function (e) { if (!editable(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
})();
