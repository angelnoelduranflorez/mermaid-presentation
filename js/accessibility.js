/**
 * accessibility.js — Utilidades ARIA y accesibilidad
 *
 * Métodos estáticos para gestionar regiones live, texto alternativo
 * en diagramas SVG, atributos ARIA en navegación y anuncios de
 * cambios de diapositiva para lectores de pantalla.
 */

export class Accessibility {
  /** @type {HTMLElement | null} Región live para anuncios */
  static _liveRegion = null;

  /**
   * Configura una región aria-live="polite" para anunciar cambios
   * de diapositiva a lectores de pantalla.
   * La región se oculta visualmente pero permanece accesible.
   * @param {HTMLElement} container - Contenedor principal (#presentation)
   */
  static setupLiveRegion(container) {
    if (!container) return;

    // Evitar duplicados
    let region = container.querySelector('#slide-announcer');
    if (!region) {
      region = document.createElement('div');
      region.id = 'slide-announcer';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.setAttribute('role', 'status');
      region.className = 'sr-only';
      container.appendChild(region);
    }

    Accessibility._liveRegion = region;
  }

  /**
   * Establece role="img" y aria-label en un elemento SVG renderizado
   * para que los lectores de pantalla describan el diagrama.
   * @param {SVGElement} svgElement - Elemento SVG del diagrama
   * @param {string} description - Texto alternativo descriptivo
   */
  static setDiagramAltText(svgElement, description) {
    if (!svgElement || !description) return;
    svgElement.setAttribute('role', 'img');
    svgElement.setAttribute('aria-label', description);
  }

  /**
   * Configura atributos ARIA en los botones de navegación.
   * Actualiza aria-label y aria-disabled según el estado actual.
   * @param {HTMLButtonElement} prevBtn - Botón "Anterior"
   * @param {HTMLButtonElement} nextBtn - Botón "Siguiente"
   * @param {boolean} canPrev - Si se puede retroceder
   * @param {boolean} canNext - Si se puede avanzar
   */
  static setupNavigationAria(prevBtn, nextBtn, canPrev, canNext) {
    if (prevBtn) {
      prevBtn.setAttribute('aria-label', 'Ir a la diapositiva anterior');
      prevBtn.setAttribute('aria-disabled', String(!canPrev));
    }
    if (nextBtn) {
      nextBtn.setAttribute('aria-label', 'Ir a la siguiente diapositiva');
      nextBtn.setAttribute('aria-disabled', String(!canNext));
    }
  }

  /**
   * Anuncia un cambio de diapositiva actualizando la región live.
   * Los lectores de pantalla leerán el texto automáticamente.
   * @param {string} slideTitle - Título de la diapositiva actual
   * @param {number} currentIndex - Índice actual (0-based)
   * @param {number} total - Total de diapositivas
   */
  static announceSlideChange(slideTitle, currentIndex, total) {
    if (!Accessibility._liveRegion) return;

    const announcement = `Diapositiva ${currentIndex + 1} de ${total}: ${slideTitle}`;
    // Forzar que el lector de pantalla re-lea el contenido
    // vaciando primero y luego asignando el nuevo texto
    Accessibility._liveRegion.textContent = '';
    requestAnimationFrame(() => {
      if (Accessibility._liveRegion) {
        Accessibility._liveRegion.textContent = announcement;
      }
    });
  }
}
