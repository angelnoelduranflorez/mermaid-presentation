/**
 * navigator.js — Navegación y gestión de estado de la presentación
 *
 * Gestiona el índice de diapositiva actual, escucha eventos de teclado
 * y clics en botones, y actualiza el indicador de progreso.
 */

export class Navigator {
  /**
   * @param {number}   totalSlides   - Número total de diapositivas
   * @param {function} onSlideChange - Callback (index, direction) invocado al cambiar de diapositiva
   */
  constructor(totalSlides, onSlideChange) {
    /** @type {number} */
    this.totalSlides = totalSlides;
    /** @type {number} */
    this.currentIndex = 0;
    /** @type {function} */
    this.onSlideChange = onSlideChange;

    // Referencias al DOM (se resuelven en bindEvents)
    /** @type {HTMLButtonElement | null} */
    this._btnPrevious = null;
    /** @type {HTMLButtonElement | null} */
    this._btnNext = null;
    /** @type {HTMLInputElement | null} */
    this._progressInput = null;
    /** @type {HTMLElement | null} */
    this._progressTotal = null;
    /** @type {HTMLProgressElement | null} */
    this._progressBar = null;

    // Bound handlers para poder removerlos si es necesario
    this._handleKeydown = this._handleKeydown.bind(this);
    this._handlePrevClick = () => this.previous();
    this._handleNextClick = () => this.next();
    this._handleProgressInput = this._handleProgressInput.bind(this);
    this._handleProgressKeydown = this._handleProgressKeydown.bind(this);
    this._handleProgressBlur = this._handleProgressBlur.bind(this);
  }

  /**
   * Avanza a la siguiente diapositiva.
   * No-op si ya está en la última.
   */
  next() {
    if (!this.canGoNext()) return;
    this.currentIndex += 1;
    this._emitChange('forward');
  }

  /**
   * Retrocede a la diapositiva anterior.
   * No-op si ya está en la primera.
   */
  previous() {
    if (!this.canGoPrevious()) return;
    this.currentIndex -= 1;
    this._emitChange('backward');
  }

  /**
   * Navega directamente a una diapositiva por índice.
   * @param {number} index - Índice de la diapositiva destino (0-based)
   */
  goTo(index) {
    if (index < 0 || index >= this.totalSlides || index === this.currentIndex) return;
    const direction = index > this.currentIndex ? 'forward' : 'backward';
    this.currentIndex = index;
    this._emitChange(direction);
  }

  /**
   * Retorna el índice de la diapositiva actual.
   * @returns {number}
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * Retorna true si se puede avanzar a la siguiente diapositiva.
   * @returns {boolean}
   */
  canGoNext() {
    return this.currentIndex < this.totalSlides - 1;
  }

  /**
   * Retorna true si se puede retroceder a la diapositiva anterior.
   * @returns {boolean}
   */
  canGoPrevious() {
    return this.currentIndex > 0;
  }

  /**
   * Registra listeners de teclado (ArrowRight/ArrowLeft) y
   * eventos de clic en los botones anterior/siguiente.
   */
  bindEvents() {
    this._btnPrevious = document.getElementById('btn-previous');
    this._btnNext = document.getElementById('btn-next');
    this._progressInput = document.getElementById('progress-input');
    this._progressTotal = document.querySelector('.progress-total');
    this._progressBar = document.getElementById('progress-bar-fill');

    // Eventos de teclado
    document.addEventListener('keydown', this._handleKeydown);

    // Eventos de clic en botones
    if (this._btnPrevious) {
      this._btnPrevious.addEventListener('click', this._handlePrevClick);
    }
    if (this._btnNext) {
      this._btnNext.addEventListener('click', this._handleNextClick);
    }

    // Eventos del input de progreso
    if (this._progressInput) {
      this._progressInput.addEventListener('keydown', this._handleProgressKeydown);
      this._progressInput.addEventListener('blur', this._handleProgressBlur);
    }

    // Estado inicial de botones y progreso
    this._updateButtonStates();
    this.updateProgressIndicator();
  }

  /**
   * Actualiza el indicador de progreso (texto y barra) en el DOM.
   */
  updateProgressIndicator() {
    if (this._progressInput) {
      this._progressInput.value = this.currentIndex + 1;
    }
    if (this._progressTotal) {
      this._progressTotal.textContent = ` / ${this.totalSlides}`;
    }
    if (this._progressBar) {
      this._progressBar.value = this.currentIndex + 1;
      this._progressBar.max = this.totalSlides;
      this._progressBar.textContent = `${this.currentIndex + 1} de ${this.totalSlides}`;
    }
  }

  // ── Métodos privados ──────────────────────────

  /**
   * Emite el cambio de diapositiva: actualiza botones, progreso y llama al callback.
   * @param {'forward'|'backward'} direction
   */
  _emitChange(direction) {
    this._updateButtonStates();
    this.updateProgressIndicator();
    if (typeof this.onSlideChange === 'function') {
      this.onSlideChange(this.currentIndex, direction);
    }
  }

  /**
   * Habilita/deshabilita los botones anterior y siguiente según el índice actual.
   */
  _updateButtonStates() {
    if (this._btnPrevious) {
      this._btnPrevious.disabled = !this.canGoPrevious();
    }
    if (this._btnNext) {
      this._btnNext.disabled = !this.canGoNext();
    }
  }

  /**
   * Navega a la página escrita en el input de progreso.
   */
  _handleProgressInput() {
    const value = parseInt(this._progressInput.value, 10);
    if (!isNaN(value) && value >= 1 && value <= this.totalSlides) {
      this.goTo(value - 1);
    } else {
      // Restaurar el valor actual si es inválido
      this._progressInput.value = this.currentIndex + 1;
    }
  }

  /**
   * Handler de keydown en el input de progreso.
   * Navega al presionar Enter, cancela con Escape.
   * @param {KeyboardEvent} event
   */
  _handleProgressKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this._handleProgressInput();
      this._progressInput.blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this._progressInput.value = this.currentIndex + 1;
      this._progressInput.blur();
    }
    // Evitar que las flechas naveguen diapositivas mientras se edita
    event.stopPropagation();
  }

  /**
   * Handler de blur en el input de progreso.
   * Navega a la página escrita al perder el foco.
   */
  _handleProgressBlur() {
    this._handleProgressInput();
  }

  /**
   * Handler de eventos de teclado para navegación.
   * @param {KeyboardEvent} event
   */
  _handleKeydown(event) {
    // No interceptar si el foco está en un textarea o input editable
    const tag = event.target?.tagName?.toLowerCase();
    if (tag === 'textarea' || tag === 'input' || event.target?.isContentEditable) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previous();
        break;
    }
  }
}
