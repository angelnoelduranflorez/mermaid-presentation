/**
 * draw-canvas.js — Funcionalidad de dibujo libre sobre las diapositivas
 *
 * Permite al usuario dibujar con un lápiz sobre la diapositiva actual.
 * Los trazos se borran automáticamente al cambiar de diapositiva.
 */

export class DrawCanvas {
  constructor() {
    /** @type {HTMLCanvasElement | null} */
    this._canvas = null;
    /** @type {CanvasRenderingContext2D | null} */
    this._ctx = null;
    /** @type {HTMLButtonElement | null} */
    this._btnDraw = null;
    /** @type {HTMLButtonElement | null} */
    this._btnClear = null;
    /** @type {boolean} */
    this._active = false;
    /** @type {boolean} */
    this._drawing = false;
    /** @type {ImageData[]} Historial de estados del canvas para deshacer */
    this._history = [];

    // Bindear handlers
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._handleTouchStart = this._handleTouchStart.bind(this);
    this._handleTouchMove = this._handleTouchMove.bind(this);
    this._handleTouchEnd = this._handleTouchEnd.bind(this);
    this._handleResize = this._handleResize.bind(this);
  }

  /**
   * Inicializa el canvas y bindea eventos.
   */
  init() {
    this._canvas = document.getElementById('draw-canvas');
    this._btnDraw = document.getElementById('btn-draw');
    this._btnClear = document.getElementById('btn-clear-draw');
    if (!this._canvas || !this._btnDraw) return;

    this._ctx = this._canvas.getContext('2d');
    this._resizeCanvas();

    // Toggle del modo dibujo
    this._btnDraw.addEventListener('click', () => this.toggle());

    // Botón de deshacer último trazo
    if (this._btnClear) {
      this._btnClear.addEventListener('click', () => this.undo());
    }

    // Eventos de dibujo (mouse)
    this._canvas.addEventListener('mousedown', this._handleMouseDown);
    this._canvas.addEventListener('mousemove', this._handleMouseMove);
    this._canvas.addEventListener('mouseup', this._handleMouseUp);
    this._canvas.addEventListener('mouseleave', this._handleMouseUp);

    // Eventos de dibujo (touch)
    this._canvas.addEventListener('touchstart', this._handleTouchStart, { passive: false });
    this._canvas.addEventListener('touchmove', this._handleTouchMove, { passive: false });
    this._canvas.addEventListener('touchend', this._handleTouchEnd);
    this._canvas.addEventListener('touchcancel', this._handleTouchEnd);

    // Resize
    window.addEventListener('resize', this._handleResize);
  }

  /**
   * Activa o desactiva el modo dibujo.
   */
  toggle() {
    this._active = !this._active;
    this._canvas.classList.toggle('active', this._active);
    this._btnDraw.classList.toggle('active', this._active);
  }

  /**
   * Desactiva el modo dibujo si está activo.
   */
  deactivate() {
    if (this._active) {
      this._active = false;
      this._canvas.classList.remove('active');
      this._btnDraw.classList.remove('active');
    }
  }

  /**
   * Limpia todos los trazos del canvas y el historial.
   */
  clear() {
    if (this._ctx && this._canvas) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    this._history = [];
  }

  /**
   * Deshace el último trazo dibujado.
   */
  undo() {
    if (!this._ctx || !this._canvas) return;
    if (this._history.length === 0) return;

    this._history.pop();

    // Limpiar canvas y redibujar el último estado guardado
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    if (this._history.length > 0) {
      this._ctx.putImageData(this._history[this._history.length - 1], 0, 0);
    }
  }

  /**
   * Llamar al cambiar de diapositiva para borrar los trazos.
   */
  onSlideChange() {
    this.clear();
  }

  // ── Métodos privados ──────────────────────────

  _resizeCanvas() {
    if (!this._canvas) return;
    this._canvas.width = this._canvas.offsetWidth;
    this._canvas.height = this._canvas.offsetHeight;
  }

  _handleResize() {
    this._resizeCanvas();
  }

  _getPosition(event) {
    const rect = this._canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  _getTouchPosition(event) {
    const rect = this._canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  /**
   * Guarda el estado actual del canvas antes de empezar un nuevo trazo.
   */
  _saveState() {
    const imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    this._history.push(imageData);
  }

  _startStroke(pos) {
    this._saveState();
    this._drawing = true;
    this._ctx.beginPath();
    this._ctx.moveTo(pos.x, pos.y);
    this._ctx.strokeStyle = '#ff4444';
    this._ctx.lineWidth = 3;
    this._ctx.lineCap = 'round';
    this._ctx.lineJoin = 'round';
  }

  _continueStroke(pos) {
    if (!this._drawing) return;
    this._ctx.lineTo(pos.x, pos.y);
    this._ctx.stroke();
  }

  _endStroke() {
    this._drawing = false;
  }

  _handleMouseDown(event) {
    if (!this._active) return;
    const pos = this._getPosition(event);
    this._startStroke(pos);
  }

  _handleMouseMove(event) {
    if (!this._active) return;
    const pos = this._getPosition(event);
    this._continueStroke(pos);
  }

  _handleMouseUp() {
    this._endStroke();
  }

  _handleTouchStart(event) {
    if (!this._active) return;
    event.preventDefault();
    const pos = this._getTouchPosition(event);
    this._startStroke(pos);
  }

  _handleTouchMove(event) {
    if (!this._active) return;
    event.preventDefault();
    const pos = this._getTouchPosition(event);
    this._continueStroke(pos);
  }

  _handleTouchEnd() {
    this._endStroke();
  }
}
