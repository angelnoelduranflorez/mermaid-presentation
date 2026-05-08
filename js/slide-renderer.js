/**
 * slide-renderer.js — Renderizado de diapositivas al DOM
 *
 * Construye el HTML de cada diapositiva según su tipo y lo inserta
 * en el contenedor, aplicando transiciones y animaciones de entrada.
 */

export class SlideRenderer {
  /**
   * @param {HTMLElement}      containerElement  - Elemento #slide-container
   * @param {import('./mermaid-renderer.js').MermaidRenderer} mermaidRenderer
   * @param {import('./interactive-editor.js').InteractiveEditor} interactiveEditor
   */
  constructor(containerElement, mermaidRenderer, interactiveEditor) {
    /** @type {HTMLElement} */
    this.container = containerElement;
    /** @type {import('./mermaid-renderer.js').MermaidRenderer} */
    this.mermaidRenderer = mermaidRenderer;
    /** @type {import('./interactive-editor.js').InteractiveEditor} */
    this.interactiveEditor = interactiveEditor;
    /** Referencia a la función goTo del Navigator (se asigna desde main.js) */
    this.onIndexNavigate = null;
  }

  /**
   * Renderiza una diapositiva en el contenedor.
   * @param {import('./slide-data.js').SlideData} slide
   * @param {'forward'|'backward'} direction
   */
  async render(slide, direction) {
    // Destruir editor interactivo previo si existe
    if (this.interactiveEditor) {
      this.interactiveEditor.destroy();
    }

    // Construir el nuevo contenido
    const wrapper = document.createElement('div');
    wrapper.className = `slide slide--${slide.type}`;
    wrapper.dataset.slideId = slide.id;

    switch (slide.type) {
      case 'title':
        wrapper.innerHTML = this._buildTitle(slide);
        break;
      case 'index':
        wrapper.innerHTML = this._buildIndex(slide);
        break;
      case 'content':
        wrapper.innerHTML = this._buildContent(slide);
        break;
      case 'diagram':
        wrapper.innerHTML = this._buildDiagram(slide);
        break;
      case 'interactive':
        wrapper.innerHTML = this._buildInteractive(slide);
        break;
      case 'closing':
        wrapper.innerHTML = this._buildClosing(slide);
        break;
      default:
        wrapper.innerHTML = this._buildContent(slide);
    }

    // Aplicar clase de transición de entrada
    const enterClass = direction === 'backward' ? 'slide-enter-backward' : 'slide-enter-forward';
    wrapper.classList.add(enterClass);

    // Limpiar contenedor e insertar nueva diapositiva
    this.container.innerHTML = '';
    this.container.appendChild(wrapper);

    // Vincular enlaces del índice si es diapositiva de índice
    if (slide.type === 'index' && this.onIndexNavigate) {
      this._bindIndexLinks(wrapper);
    }

    // Renderizar diagramas Mermaid si hay código
    if (slide.mermaidCode && !slide.isInteractive) {
      await this.mermaidRenderer.renderAllInContainer(wrapper);
    }

    // Montar editor interactivo si corresponde
    if (slide.isInteractive && slide.mermaidCode && this.interactiveEditor) {
      const editorContainer = wrapper.querySelector('.interactive-editor-mount');
      if (editorContainer) {
        await this.interactiveEditor.mount(editorContainer, slide.mermaidCode);
      }
    }

    // Activar animaciones de entrada escalonadas
    // Pequeño delay para que el navegador procese el DOM antes de animar
    requestAnimationFrame(() => {
      wrapper.classList.remove(enterClass);
      wrapper.classList.add('slide-active');
      this.applyEntryAnimations(wrapper);
    });
  }

  /**
   * Aplica animaciones de entrada escalonadas a los elementos hijos.
   * @param {HTMLElement} container
   */
  applyEntryAnimations(container) {
    const animatableElements = container.querySelectorAll('.animate-in');
    animatableElements.forEach((el, index) => {
      el.style.animationDelay = `${index * 80}ms`;
      el.classList.add('animate-in--active');
    });
  }

  /** Limpia el contenido actual del contenedor. */
  clear() {
    if (this.interactiveEditor) {
      this.interactiveEditor.destroy();
    }
    this.container.innerHTML = '';
  }

  // ── Builders privados por tipo de diapositiva ──────────────

  /**
   * Diapositiva de título: nombre, rol, descripción.
   * @param {import('./slide-data.js').SlideData} slide
   * @returns {string}
   */
  _buildTitle(slide) {
    return `
      <div class="slide__inner slide__inner--title">
        <h1 class="slide__title slide__title--hero animate-in">${this._escapeHtml(slide.title)}</h1>
        ${slide.subtitle ? `<p class="slide__subtitle animate-in">${this._escapeHtml(slide.subtitle)}</p>` : ''}
        ${slide.content ? `<div class="slide__body animate-in">${slide.content}</div>` : ''}
      </div>
    `;
  }

  /**
   * Diapositiva de índice: lista de secciones clicables.
   * @param {import('./slide-data.js').SlideData} slide
   * @returns {string}
   */
  _buildIndex(slide) {
    const items = (slide.indexItems || [])
      .map((item, i) => `
        <li class="index-item animate-in">
          <a href="#" class="index-link" data-target-id="${this._escapeAttr(item.targetId)}" role="link" tabindex="0">
            <span class="index-number">${i + 1}</span>
            <span class="index-label">${this._escapeHtml(item.label)}</span>
          </a>
        </li>
      `)
      .join('');

    return `
      <div class="slide__inner slide__inner--index">
        <h2 class="slide__title animate-in">${this._escapeHtml(slide.title)}</h2>
        <ol class="index-list">${items}</ol>
      </div>
    `;
  }

  /**
   * Diapositiva de contenido: texto, viñetas y opcionalmente diagrama.
   * @param {import('./slide-data.js').SlideData} slide
   * @returns {string}
   */
  _buildContent(slide) {
    const hasDiagram = !!slide.mermaidCode;
    const layoutClass = hasDiagram ? 'slide__inner--split' : '';

    let leftPanel = `
      <div class="slide__text-panel">
        ${slide.section ? `<span class="slide__section-badge animate-in">${this._escapeHtml(slide.section)}</span>` : ''}
        <h2 class="slide__title animate-in">${this._escapeHtml(slide.title)}</h2>
        ${slide.content ? `<div class="slide__body animate-in">${slide.content}</div>` : ''}
        ${this._buildBulletPoints(slide.bulletPoints)}
      </div>
    `;

    let rightPanel = '';
    if (hasDiagram) {
      rightPanel = `
        <div class="slide__diagram-panel animate-in">
          <div class="code-panel">
            <pre class="code-block"><code>${this._highlightMermaidSyntax(slide.mermaidCode)}</code></pre>
          </div>
          <div class="diagram-preview" data-mermaid="${this._escapeAttr(slide.mermaidCode)}" data-mermaid-alt="${this._escapeAttr(slide.mermaidAltText || '')}">
          </div>
        </div>
      `;
    }

    return `
      <div class="slide__inner ${layoutClass}">
        ${leftPanel}
        ${rightPanel}
      </div>
    `;
  }

  /**
   * Diapositiva de diagrama: panel de código + vista previa (layout dividido).
   * @param {import('./slide-data.js').SlideData} slide
   * @returns {string}
   */
  _buildDiagram(slide) {
    return `
      <div class="slide__inner slide__inner--diagram">
        <div class="slide__text-panel">
          ${slide.section ? `<span class="slide__section-badge animate-in">${this._escapeHtml(slide.section)}</span>` : ''}
          <h2 class="slide__title animate-in">${this._escapeHtml(slide.title)}</h2>
          ${slide.content ? `<div class="slide__body animate-in">${slide.content}</div>` : ''}
        </div>
        <div class="slide__diagram-area animate-in">
          <div class="code-panel">
            <div class="code-panel__header">Código Mermaid</div>
            <pre class="code-block"><code>${this._highlightMermaidSyntax(slide.mermaidCode)}</code></pre>
          </div>
          <div class="diagram-preview" data-mermaid="${this._escapeAttr(slide.mermaidCode)}" data-mermaid-alt="${this._escapeAttr(slide.mermaidAltText || '')}">
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Diapositiva interactiva: placeholder para el editor.
   * @param {import('./slide-data.js').SlideData} slide
   * @returns {string}
   */
  _buildInteractive(slide) {
    return `
      <div class="slide__inner slide__inner--interactive">
        <div class="slide__header">
          ${slide.section ? `<span class="slide__section-badge animate-in">${this._escapeHtml(slide.section)}</span>` : ''}
          <h2 class="slide__title animate-in">${this._escapeHtml(slide.title)}</h2>
          ${slide.content ? `<div class="slide__body animate-in">${slide.content}</div>` : ''}
        </div>
        <div class="interactive-editor-mount animate-in">
          <!-- InteractiveEditor se monta aquí -->
        </div>
      </div>
    `;
  }

  /**
   * Diapositiva de cierre: resumen y recursos.
   * @param {import('./slide-data.js').SlideData} slide
   * @returns {string}
   */
  _buildClosing(slide) {
    const resourcesHtml = (slide.resources || [])
      .map(r => {
        const parts = r.split(' — ');
        const url = parts[0].trim();
        const label = parts.length > 1 ? parts[1].trim() : url;
        return `<li class="resource-item animate-in"><a href="${this._escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${this._escapeHtml(url)}</a> — ${this._escapeHtml(label)}</li>`;
      })
      .join('');

    return `
      <div class="slide__inner slide__inner--closing">
        <h2 class="slide__title slide__title--hero animate-in">${this._escapeHtml(slide.title)}</h2>
        ${slide.content ? `<div class="slide__body animate-in">${slide.content}</div>` : ''}
        ${this._buildBulletPoints(slide.bulletPoints)}
        ${resourcesHtml ? `
          <div class="resources-section animate-in">
            <h3 class="resources-title">Recursos</h3>
            <ul class="resources-list">${resourcesHtml}</ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ── Utilidades ──────────────────────────────────

  /**
   * Construye una lista de viñetas con animación.
   * @param {string[]} [points]
   * @returns {string}
   */
  _buildBulletPoints(points) {
    if (!points || points.length === 0) return '';
    const items = points.map(p => `<li class="bullet-item animate-in">${this._escapeHtml(p)}</li>`).join('');
    return `<ul class="bullet-list">${items}</ul>`;
  }

  /**
   * Aplica resaltado de sintaxis básico a código Mermaid.
   * @param {string} code
   * @returns {string}
   */
  _highlightMermaidSyntax(code) {
    if (!code) return '';
    let escaped = this._escapeHtml(code);

    // Palabras clave de tipo de diagrama
    escaped = escaped.replaceAll(
      /\b(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram-v2|stateDiagram|gantt|erDiagram|pie|gitGraph|journey|mindmap|timeline|quadrantChart|sankey-beta|xychart-beta)\b/g,
      '<span class="syntax-keyword">$1</span>'
    );

    // Palabras clave estructurales
    escaped = escaped.replaceAll(
      /\b(subgraph|end|participant|actor|class|section|title|dateFormat|loop|alt|else|opt|par|critical|break|note|over|activate|deactivate)\b/g,
      '<span class="syntax-structure">$1</span>'
    );

    // Flechas y conectores
    escaped = escaped.replaceAll(
      /(--&gt;|---|-\.-&gt;|==&gt;|--&gt;\|[^|]*\||&lt;\|--|--o|--x|\|\|--o\{|\|\|--\|\{|o--o)/g,
      '<span class="syntax-arrow">$1</span>'
    );

    return escaped;
  }

  /**
   * Vincula los enlaces del índice a la navegación.
   * @param {HTMLElement} wrapper
   */
  _bindIndexLinks(wrapper) {
    const links = wrapper.querySelectorAll('.index-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.dataset.targetId;
        if (this.onIndexNavigate && targetId) {
          this.onIndexNavigate(targetId);
        }
      });
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          link.click();
        }
      });
    });
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

  /**
   * Escapa un valor para uso en atributos HTML.
   * @param {string} str
   * @returns {string}
   */
  _escapeAttr(str) {
    if (!str) return '';
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
