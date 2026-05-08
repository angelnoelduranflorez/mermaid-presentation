/**
 * interactive-editor.js — Editor interactivo de Mermaid
 *
 * Permite al usuario modificar código Mermaid y ver el diagrama
 * actualizado en tiempo real con debounce de 300ms.
 */

export class InteractiveEditor {
  /**
   * @param {import('./mermaid-renderer.js').MermaidRenderer} mermaidRenderer
   */
  constructor(mermaidRenderer) {
    /** @type {import('./mermaid-renderer.js').MermaidRenderer} */
    this.mermaidRenderer = mermaidRenderer;

    /** @type {string} Código Mermaid original para restaurar */
    this._initialCode = '';
    /** @type {HTMLTextAreaElement | null} */
    this._textarea = null;
    /** @type {HTMLElement | null} */
    this._previewContainer = null;
    /** @type {HTMLElement | null} */
    this._mountContainer = null;
    /** @type {number | null} Timer del debounce */
    this._debounceTimer = null;
    /** @type {boolean} */
    this._mounted = false;

    // Bound handlers
    this._handleInput = this._handleInput.bind(this);
    this._handleRestore = this._handleRestore.bind(this);
  }

  /**
   * Monta el editor en un contenedor con código inicial.
   * @param {HTMLElement} container
   * @param {string} initialCode - Código Mermaid original
   */
  async mount(container, initialCode) {
    if (this._mounted) {
      this.destroy();
    }

    this._mountContainer = container;
    this._initialCode = initialCode;
    this._mounted = true;

    // Construir estructura del editor
    container.innerHTML = '';
    container.classList.add('interactive-editor');

    // Panel izquierdo: textarea con código
    const editorPanel = document.createElement('div');
    editorPanel.className = 'editor-panel';

    const editorHeader = document.createElement('div');
    editorHeader.className = 'editor-panel__header';
    editorHeader.innerHTML = `
      <span class="editor-panel__title">Editor de Código Mermaid</span>
      <button type="button" class="editor-restore-btn" aria-label="Restaurar código original">
        &#8634; Restaurar
      </button>
    `;

    this._textarea = document.createElement('textarea');
    this._textarea.className = 'editor-textarea';
    this._textarea.value = initialCode;
    this._textarea.setAttribute('spellcheck', 'false');
    this._textarea.setAttribute('autocomplete', 'off');
    this._textarea.setAttribute('autocorrect', 'off');
    this._textarea.setAttribute('autocapitalize', 'off');
    this._textarea.setAttribute('aria-label', 'Editor de código Mermaid');
    this._textarea.setAttribute('rows', '12');

    editorPanel.appendChild(editorHeader);
    editorPanel.appendChild(this._textarea);

    // Panel derecho: vista previa del diagrama
    const previewPanel = document.createElement('div');
    previewPanel.className = 'preview-panel';

    const previewHeader = document.createElement('div');
    previewHeader.className = 'preview-panel__header';
    previewHeader.textContent = 'Vista Previa';

    this._previewContainer = document.createElement('div');
    this._previewContainer.className = 'preview-panel__content';
    this._previewContainer.setAttribute('role', 'img');
    this._previewContainer.setAttribute('aria-label', 'Vista previa del diagrama Mermaid');

    previewPanel.appendChild(previewHeader);
    previewPanel.appendChild(this._previewContainer);

    // Ensamblar
    container.appendChild(editorPanel);
    container.appendChild(previewPanel);

    // Vincular eventos
    this._textarea.addEventListener('input', this._handleInput);

    const restoreBtn = editorHeader.querySelector('.editor-restore-btn');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', this._handleRestore);
    }

    // Renderizar diagrama inicial
    await this._renderPreview(initialCode);
  }

  /**
   * Restaura el código al valor original.
   */
  async restore() {
    if (!this._textarea || !this._mounted) return;
    this._textarea.value = this._initialCode;
    await this._renderPreview(this._initialCode);
  }

  /**
   * Retorna el código actual del editor.
   * @returns {string}
   */
  getCode() {
    return this._textarea ? this._textarea.value : this._initialCode;
  }

  /**
   * Desmonta el editor y limpia listeners.
   */
  destroy() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }

    if (this._textarea) {
      this._textarea.removeEventListener('input', this._handleInput);
      this._textarea = null;
    }

    this._previewContainer = null;

    if (this._mountContainer) {
      this._mountContainer.innerHTML = '';
      this._mountContainer.classList.remove('interactive-editor');
      this._mountContainer = null;
    }

    this._mounted = false;
  }

  // ── Métodos privados ──────────────────────────

  /**
   * Handler de input con debounce de 300ms.
   */
  _handleInput() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(async () => {
      const code = this._textarea?.value || '';
      await this._renderPreview(code);
    }, 300);
  }

  /**
   * Handler del botón restaurar.
   */
  async _handleRestore() {
    await this.restore();
  }

  /**
   * Renderiza el código Mermaid en el panel de vista previa.
   * @param {string} code
   */
  async _renderPreview(code) {
    if (!this._previewContainer || !this.mermaidRenderer) return;

    if (!code.trim()) {
      this._previewContainer.innerHTML = '<div class="editor-placeholder">Escribe código Mermaid para ver el diagrama</div>';
      return;
    }

    const result = await this.mermaidRenderer.render(null, code);

    if (result.success) {
      this._previewContainer.innerHTML = result.svg;
      this._previewContainer.classList.remove('preview-panel__content--error');
    } else {
      this._previewContainer.innerHTML = `<div class="mermaid-error" role="alert">${this._escapeHtml(result.error)}</div>`;
      this._previewContainer.classList.add('preview-panel__content--error');
    }
  }

  /**
   * Escapa HTML para prevenir XSS.
   * @param {string} str
   * @returns {string}
   */
  _escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
