/**
 * main.js — Inicialización y orquestación de la aplicación
 *
 * Importa todos los módulos, inicializa Mermaid.js con tema oscuro,
 * crea las instancias de los componentes y conecta la navegación,
 * el renderizado de diapositivas y la accesibilidad.
 *
 * Requerimientos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.1, 9.1, 9.2
 */

import { slides } from './slide-data.js';
import { Navigator } from './navigator.js';
import { SlideRenderer } from './slide-renderer.js';
import { MermaidRenderer } from './mermaid-renderer.js';
import { InteractiveEditor } from './interactive-editor.js';
import { Accessibility } from './accessibility.js';
import { DrawCanvas } from './draw-canvas.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ── Referencias al DOM ──────────────────────────
  const presentationEl = document.getElementById('presentation');
  const slideContainerEl = document.getElementById('slide-container');
  const btnPrevious = document.getElementById('btn-previous');
  const btnNext = document.getElementById('btn-next');

  if (!presentationEl || !slideContainerEl) {
    console.error('No se encontraron los elementos principales de la presentación.');
    return;
  }

  // ── Inicializar MermaidRenderer con tema oscuro ──
  const mermaidRenderer = new MermaidRenderer();
  try {
    await mermaidRenderer.initialize({
      theme: 'dark',
      securityLevel: 'loose',
    });
  } catch (err) {
    console.error('No se pudo inicializar Mermaid.js:', err);
  }

  // ── Crear instancias de componentes ──────────────
  const interactiveEditor = new InteractiveEditor(mermaidRenderer);
  const slideRenderer = new SlideRenderer(slideContainerEl, mermaidRenderer, interactiveEditor);
  const drawCanvas = new DrawCanvas();
  drawCanvas.init();

  // ── Construir mapa de id → índice para navegación desde el índice ──
  const slideIdToIndex = new Map();
  slides.forEach((slide, index) => {
    slideIdToIndex.set(slide.id, index);
  });

  // Conectar la función de navegación por id del índice al SlideRenderer
  slideRenderer.onIndexNavigate = (targetId) => {
    const targetIndex = slideIdToIndex.get(targetId);
    if (targetIndex !== undefined) {
      slideNavigator.goTo(targetIndex);
    }
  };

  // ── Callback de cambio de diapositiva ────────────
  /**
   * Se invoca cada vez que el Navigator cambia de diapositiva.
   * @param {number} index - Índice de la nueva diapositiva
   * @param {'forward'|'backward'} direction - Dirección de la transición
   */
  async function onSlideChange(index, direction) {
    const slide = slides[index];
    if (!slide) return;

    // Limpiar trazos del canvas de dibujo
    drawCanvas.onSlideChange();

    // Renderizar la diapositiva
    await slideRenderer.render(slide, direction);

    // Anunciar el cambio para lectores de pantalla
    Accessibility.announceSlideChange(slide.title, index, slides.length);

    // Actualizar atributos ARIA en botones de navegación
    Accessibility.setupNavigationAria(
      btnPrevious,
      btnNext,
      slideNavigator.canGoPrevious(),
      slideNavigator.canGoNext()
    );

    // Actualizar indicador de progreso
    slideNavigator.updateProgressIndicator();
  }

  // ── Crear Navigator y vincular eventos ───────────
  // Nota: usamos "slideNavigator" para evitar colisión con window.navigator
  const slideNavigator = new Navigator(slides.length, onSlideChange);
  slideNavigator.bindEvents();

  // ── Configurar accesibilidad ─────────────────────
  Accessibility.setupLiveRegion(presentationEl);

  // ── Renderizar la primera diapositiva al cargar ──
  const firstSlide = slides[0];
  if (firstSlide) {
    await slideRenderer.render(firstSlide, 'forward');

    // Configurar ARIA inicial
    Accessibility.announceSlideChange(firstSlide.title, 0, slides.length);
    Accessibility.setupNavigationAria(
      btnPrevious,
      btnNext,
      slideNavigator.canGoPrevious(),
      slideNavigator.canGoNext()
    );
  }
});
