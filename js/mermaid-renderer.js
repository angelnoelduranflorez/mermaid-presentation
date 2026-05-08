/**
 * mermaid-renderer.js — Wrapper de integración con Mermaid.js
 *
 * Encapsula la API de Mermaid.js para renderizar diagramas de forma segura,
 * gestionando IDs únicos y capturando errores de sintaxis.
 *
 * @typedef {Object} RenderResult
 * @property {boolean} success - Si el renderizado fue exitoso
 * @property {string}  [svg]   - SVG generado (si success === true)
 * @property {string}  [error] - Mensaje de error (si success === false)
 */

export class MermaidRenderer {
  /** @type {import('mermaid').default | null} */
  _mermaid = null;
  /** Contador incremental para generar IDs únicos */
  _idCounter = 0;
  /** Indica si ya se inicializó */
  _initialized = false;

  /**
   * Inicializa Mermaid.js importando el módulo ESM dinámicamente
   * y aplicando la configuración de tema oscuro.
   * @param {Object} [config] - Configuración adicional para mermaid.initialize()
   */
  async initialize(config = {}) {
    if (this._initialized) return;

    try {
      const mermaidModule = await import('mermaid');
      this._mermaid = mermaidModule.default;

      this._mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
        ...config,
      });

      this._initialized = true;
    } catch (err) {
      console.error('Error al inicializar Mermaid.js:', err);
      throw err;
    }
  }

  /**
   * Genera un ID único para cada llamada de renderizado,
   * evitando colisiones de IDs internos de Mermaid.
   * @returns {string}
   */
  _generateUniqueId() {
    this._idCounter += 1;
    return `mermaid-diagram-${this._idCounter}-${Date.now()}`;
  }

  /**
   * Renderiza código Mermaid y retorna el SVG resultante o un error.
   * @param {string} id   - ID base para el diagrama (se hace único internamente)
   * @param {string} code - Código Mermaid a renderizar
   * @returns {Promise<RenderResult>}
   */
  async render(id, code) {
    if (!this._initialized || !this._mermaid) {
      return { success: false, error: 'MermaidRenderer no ha sido inicializado. Llama a initialize() primero.' };
    }

    const uniqueId = id || this._generateUniqueId();

    try {
      const { svg } = await this._mermaid.render(uniqueId, code.trim());
      return { success: true, svg };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Error de sintaxis Mermaid: ${errorMessage}`,
      };
    }
  }

  /**
   * Renderiza todos los elementos con atributo [data-mermaid] dentro de un contenedor.
   * Cada elemento debe tener el código Mermaid en data-mermaid y opcionalmente
   * un data-mermaid-alt para texto alternativo.
   * @param {HTMLElement} container
   */
  async renderAllInContainer(container) {
    if (!container) return;

    const elements = container.querySelectorAll('[data-mermaid]');

    for (const el of elements) {
      const code = el.dataset.mermaid;
      if (!code) continue;

      const diagramId = this._generateUniqueId();
      const result = await this.render(diagramId, code);

      if (result.success) {
        el.innerHTML = result.svg;
        // Aplicar texto alternativo de accesibilidad si existe
        const altText = el.dataset.mermaidAlt;
        const svgEl = el.querySelector('svg');
        if (svgEl && altText) {
          svgEl.setAttribute('role', 'img');
          svgEl.setAttribute('aria-label', altText);
        }
      } else {
        el.innerHTML = `<div class="mermaid-error" role="alert">${result.error}</div>`;
      }
    }
  }
}
