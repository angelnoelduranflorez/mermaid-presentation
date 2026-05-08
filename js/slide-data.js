/**
 * slide-data.js — Datos de contenido de las 19 diapositivas
 *
 * Cada objeto sigue la estructura SlideData definida en el diseño:
 * @typedef {'title'|'index'|'content'|'diagram'|'interactive'|'closing'} SlideType
 * @typedef {Object} SlideData
 * @property {string}   id
 * @property {SlideType} type
 * @property {string}   title
 * @property {string}   [subtitle]
 * @property {string}   [content]
 * @property {string}   [mermaidCode]
 * @property {string}   [mermaidAltText]
 * @property {boolean}  [isInteractive]
 * @property {string}   [section]
 * @property {string[]} [bulletPoints]
 * @property {Object[]} [indexItems]
 * @property {string[]} [resources]
 */

/** @type {SlideData[]} */
export const slides = [
  // ──────────────────────────────────────────────
  // 1. Diapositiva de título (Req 1.2)
  // ──────────────────────────────────────────────
  {
    id: 'intro',
    type: 'title',
    title: 'Mermaid: Diagramación Inteligente',
    subtitle: 'Presentado por un Experto en Inteligencia Artificial',
    content: '<p>Descubre cómo transformar texto plano en diagramas profesionales con Mermaid, la herramienta que está revolucionando la documentación técnica y la colaboración en equipos de desarrollo.</p>',
  },

  // ──────────────────────────────────────────────
  // 2. Diapositiva de índice (Req 1.3)
  // ──────────────────────────────────────────────
  {
    id: 'table-of-contents',
    type: 'index',
    title: 'Índice de la Presentación',
    indexItems: [
      { label: 'Fundamentos de Mermaid', targetId: 'what-is-mermaid' },
      { label: 'Tipos de Diagramas', targetId: 'flowchart' },
      { label: 'Editor Interactivo', targetId: 'editor-playground' },
      { label: 'Casos de Uso', targetId: 'use-case-docs' },
      { label: 'Cierre y Recursos', targetId: 'closing' },
    ],
  },

  // ──────────────────────────────────────────────
  // 3-6. Sección: Fundamentos (Req 3.1–3.4)
  // ──────────────────────────────────────────────
  {
    id: 'what-is-mermaid',
    type: 'content',
    section: 'Fundamentos',
    title: '¿Qué es Mermaid?',
    content: '<p>Mermaid es una herramienta de código abierto basada en JavaScript que permite generar diagramas y gráficos a partir de definiciones en texto plano, con una sintaxis inspirada en Markdown.</p>',
    bulletPoints: [
      'Creado por Knut Sveidqvist en 2014',
      'Renderiza diagramas directamente en el navegador',
      'Adoptado por GitHub, GitLab, Notion y muchas más plataformas',
      'Más de 70 000 estrellas en GitHub',
    ],
  },
  {
    id: 'basic-syntax',
    type: 'content',
    section: 'Fundamentos',
    title: 'Sintaxis Básica de Mermaid',
    content: '<p>Un diagrama Mermaid se define con una palabra clave de tipo seguida de la descripción de nodos y conexiones en texto plano.</p>',
    bulletPoints: [
      'Comienza con el tipo de diagrama: graph, sequenceDiagram, classDiagram…',
      'Los nodos se definen con identificadores y etiquetas entre corchetes',
      'Las conexiones usan flechas: -->, ---,  -.->',
      'Soporta subgrafos, estilos y directivas de configuración',
    ],
    mermaidCode: `graph LR
    A[Texto Plano] --> B[Parser Mermaid]
    B --> C[Diagrama SVG]`,
    mermaidAltText: 'Diagrama de flujo que muestra cómo el texto plano pasa por el parser de Mermaid para producir un diagrama SVG.',
  },
  {
    id: 'advantages',
    type: 'content',
    section: 'Fundamentos',
    title: 'Ventajas de Mermaid',
    content: '<p>Mermaid ofrece beneficios significativos frente a herramientas de diagramación visual tradicionales como Visio, Lucidchart o Draw.io.</p>',
    bulletPoints: [
      'Versionable en Git: los diagramas son texto, no binarios',
      'Integración nativa en documentación Markdown',
      'Generación automatizada con IA (ChatGPT, Copilot)',
      'Sin dependencia de herramientas propietarias',
      'Renderizado consistente en cualquier plataforma',
    ],
  },
  {
    id: 'rendering-architecture',
    type: 'content',
    section: 'Fundamentos',
    title: 'Arquitectura de Renderizado',
    content: '<p>Mermaid transforma definiciones de texto en gráficos SVG mediante un pipeline de parsing, análisis semántico y renderizado.</p>',
    mermaidCode: `graph TD
    A["Código Mermaid (texto)"] --> B[Lexer / Tokenizer]
    B --> C[Parser JISON]
    C --> D[Árbol Semántico]
    D --> E[Motor de Layout dagre-d3]
    E --> F["Salida SVG (gráfico)"]`,
    mermaidAltText: 'Diagrama que muestra el pipeline de renderizado de Mermaid: desde el código texto, pasando por lexer, parser, árbol semántico y motor de layout, hasta la salida SVG.',
    bulletPoints: [
      'Lexer tokeniza la entrada de texto',
      'Parser JISON genera un árbol de sintaxis',
      'dagre-d3 calcula el layout de nodos y aristas',
      'El resultado es SVG estándar insertado en el DOM',
    ],
  },

  // ──────────────────────────────────────────────
  // 7-13. Sección: Tipos de Diagramas (Req 4.1–4.7)
  // ──────────────────────────────────────────────
  {
    id: 'flowchart',
    type: 'diagram',
    section: 'Tipos de Diagramas',
    title: 'Diagramas de Flujo (Flowchart)',
    content: '<p>Los diagramas de flujo son el tipo más utilizado en Mermaid. Permiten representar procesos, decisiones y flujos de trabajo con nodos y conexiones dirigidas.</p>',
    mermaidCode: `graph TD
    A[Inicio] --> B{¿Usuario autenticado?}
    B -->|Sí| C[Mostrar Dashboard]
    B -->|No| D[Mostrar Login]
    D --> E[Ingresar credenciales]
    E --> F{¿Credenciales válidas?}
    F -->|Sí| C
    F -->|No| G[Mostrar error]
    G --> D`,
    mermaidAltText: 'Diagrama de flujo de autenticación de usuario con decisiones de credenciales válidas e inválidas.',
  },
  {
    id: 'sequence-diagram',
    type: 'diagram',
    section: 'Tipos de Diagramas',
    title: 'Diagramas de Secuencia',
    content: '<p>Los diagramas de secuencia modelan la interacción entre actores y sistemas a lo largo del tiempo, ideales para documentar APIs y protocolos.</p>',
    mermaidCode: `sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant A as API
    participant DB as Base de Datos

    U->>F: Clic en "Guardar"
    F->>A: POST /api/datos
    A->>DB: INSERT registro
    DB-->>A: OK
    A-->>F: 201 Created
    F-->>U: Notificación de éxito`,
    mermaidAltText: 'Diagrama de secuencia que muestra la interacción entre usuario, frontend, API y base de datos al guardar un registro.',
  },
  {
    id: 'class-diagram',
    type: 'diagram',
    section: 'Tipos de Diagramas',
    title: 'Diagramas de Clases',
    content: '<p>Los diagramas de clases representan la estructura estática de un sistema orientado a objetos, mostrando clases, atributos, métodos y relaciones.</p>',
    mermaidCode: `classDiagram
    class Animal {
        +String nombre
        +int edad
        +hacerSonido() void
    }
    class Perro {
        +String raza
        +buscar() void
    }
    class Gato {
        +boolean esInterior
        +ronronear() void
    }
    Animal <|-- Perro
    Animal <|-- Gato`,
    mermaidAltText: 'Diagrama de clases con una clase base Animal y dos subclases Perro y Gato que heredan de ella.',
  },
  {
    id: 'state-diagram',
    type: 'diagram',
    section: 'Tipos de Diagramas',
    title: 'Diagramas de Estado',
    content: '<p>Los diagramas de estado modelan los diferentes estados de un objeto y las transiciones entre ellos, útiles para máquinas de estado y flujos de negocio.</p>',
    mermaidCode: `stateDiagram-v2
    [*] --> Borrador
    Borrador --> EnRevision : Enviar
    EnRevision --> Aprobado : Aprobar
    EnRevision --> Rechazado : Rechazar
    Rechazado --> Borrador : Corregir
    Aprobado --> Publicado : Publicar
    Publicado --> [*]`,
    mermaidAltText: 'Diagrama de estado de un documento que pasa por borrador, revisión, aprobado/rechazado y publicado.',
  },
  {
    id: 'gantt-diagram',
    type: 'diagram',
    section: 'Tipos de Diagramas',
    title: 'Diagramas de Gantt',
    content: '<p>Los diagramas de Gantt visualizan la planificación temporal de un proyecto, mostrando tareas, duraciones y dependencias.</p>',
    mermaidCode: `gantt
    title Plan de Proyecto
    dateFormat  YYYY-MM-DD
    section Diseño
    Investigación       :a1, 2024-01-01, 10d
    Prototipo           :a2, after a1, 15d
    section Desarrollo
    Backend             :b1, after a2, 20d
    Frontend            :b2, after a2, 25d
    section Pruebas
    Testing             :c1, after b1, 10d
    Despliegue          :c2, after c1, 5d`,
    mermaidAltText: 'Diagrama de Gantt que muestra un plan de proyecto con fases de diseño, desarrollo y pruebas distribuidas en el tiempo.',
  },
  {
    id: 'er-diagram',
    type: 'diagram',
    section: 'Tipos de Diagramas',
    title: 'Diagramas Entidad-Relación',
    content: '<p>Los diagramas ER modelan la estructura de una base de datos, mostrando entidades, atributos y las relaciones entre ellas.</p>',
    mermaidCode: `erDiagram
    USUARIO ||--o{ PEDIDO : realiza
    PEDIDO ||--|{ LINEA_PEDIDO : contiene
    PRODUCTO ||--o{ LINEA_PEDIDO : incluido_en
    USUARIO {
        int id PK
        string nombre
        string email
    }
    PEDIDO {
        int id PK
        date fecha
        float total
    }
    PRODUCTO {
        int id PK
        string nombre
        float precio
    }`,
    mermaidAltText: 'Diagrama entidad-relación con entidades Usuario, Pedido y Producto conectadas por relaciones de pedidos y líneas de pedido.',
  },
  {
    id: 'pie-chart',
    type: 'diagram',
    section: 'Tipos de Diagramas',
    title: 'Diagramas de Pastel (Pie Chart)',
    content: '<p>Los diagramas de pastel permiten visualizar distribuciones porcentuales de forma sencilla, ideales para presentar métricas y estadísticas.</p>',
    mermaidCode: `pie title Lenguajes más usados en 2024
    "JavaScript" : 30
    "Python" : 25
    "TypeScript" : 18
    "Java" : 12
    "C#" : 8
    "Otros" : 7`,
    mermaidAltText: 'Diagrama de pastel que muestra la distribución de lenguajes de programación más usados en 2024, liderado por JavaScript y Python.',
  },

  // ──────────────────────────────────────────────
  // 14. Editor Interactivo (Req 6.1)
  // ──────────────────────────────────────────────
  {
    id: 'editor-playground',
    type: 'interactive',
    section: 'Editor Interactivo',
    title: 'Experimenta con Mermaid',
    content: '<p>Modifica el código en el editor y observa cómo el diagrama se actualiza en tiempo real. ¡Prueba a cambiar nodos, conexiones y estilos!</p>',
    mermaidCode: `graph LR
    A[Tu Idea] --> B[Código Mermaid]
    B --> C[Diagrama Visual]
    C --> D{¿Te gusta?}
    D -->|Sí| E[Comparte]
    D -->|No| A`,
    mermaidAltText: 'Diagrama editable que muestra el flujo iterativo de idea a código Mermaid a diagrama visual.',
    isInteractive: true,
  },

  // ──────────────────────────────────────────────
  // 15-18. Sección: Casos de Uso (Req 7.1–7.4)
  // ──────────────────────────────────────────────
  {
    id: 'use-case-docs',
    type: 'content',
    section: 'Casos de Uso',
    title: 'Documentación Técnica y README',
    content: '<p>Mermaid se ha convertido en el estándar de facto para incluir diagramas en documentación técnica y archivos README de repositorios.</p>',
    bulletPoints: [
      'GitHub renderiza bloques Mermaid nativamente en Markdown',
      'Los diagramas se actualizan con cada commit, sin archivos de imagen',
      'Facilita la revisión de código: los cambios en diagramas son diffs de texto',
      'Ideal para documentar arquitecturas, flujos de datos y APIs',
    ],
  },
  {
    id: 'use-case-ai',
    type: 'content',
    section: 'Casos de Uso',
    title: 'Generación con Inteligencia Artificial',
    content: '<p>Los modelos de lenguaje como ChatGPT, Claude y GitHub Copilot pueden generar diagramas Mermaid a partir de descripciones en lenguaje natural.</p>',
    bulletPoints: [
      'Describe tu arquitectura en texto y obtén un diagrama Mermaid al instante',
      'Los LLMs entienden la sintaxis de Mermaid por su presencia en datos de entrenamiento',
      'Automatiza la documentación de sistemas existentes con IA',
      'Integración en flujos de trabajo de desarrollo asistido por IA',
    ],
  },
  {
    id: 'use-case-platforms',
    type: 'content',
    section: 'Casos de Uso',
    title: 'Plataformas Colaborativas',
    content: '<p>Múltiples plataformas de colaboración y gestión de proyectos soportan Mermaid de forma nativa, permitiendo crear diagramas sin salir del flujo de trabajo.</p>',
    bulletPoints: [
      'GitHub: renderizado nativo en issues, PRs y wikis',
      'GitLab: soporte integrado en Markdown',
      'Notion: bloques de código Mermaid con vista previa',
      'Confluence, Docusaurus, MkDocs y más vía plugins',
    ],
  },
  {
    id: 'use-case-cicd',
    type: 'content',
    section: 'Casos de Uso',
    title: 'CI/CD y Arquitectura de Despliegue',
    content: '<p>Mermaid es ideal para documentar pipelines de CI/CD y arquitecturas de despliegue, manteniendo la documentación sincronizada con el código.</p>',
    mermaidCode: `graph LR
    A[Commit] --> B[Build]
    B --> C[Test]
    C --> D{¿Tests OK?}
    D -->|Sí| E[Deploy Staging]
    E --> F[Tests E2E]
    F --> G{¿E2E OK?}
    G -->|Sí| H[Deploy Producción]
    G -->|No| I[Rollback]
    D -->|No| J[Notificar equipo]`,
    mermaidAltText: 'Diagrama de flujo de un pipeline CI/CD que muestra las etapas de build, test, deploy a staging, tests E2E y deploy a producción con manejo de fallos.',
  },

  // ──────────────────────────────────────────────
  // 19. Diapositiva de cierre (Req 1.4)
  // ──────────────────────────────────────────────
  {
    id: 'closing',
    type: 'closing',
    title: 'Resumen y Recursos',
    content: '<p>Mermaid transforma la forma en que documentamos y comunicamos arquitecturas de software. Su sintaxis basada en texto, integración con plataformas modernas y compatibilidad con IA lo convierten en una herramienta esencial para todo desarrollador.</p>',
    bulletPoints: [
      'Mermaid convierte texto plano en diagramas profesionales',
      'Soporta más de 13 tipos de diagramas',
      'Se integra nativamente en GitHub, GitLab y Notion',
      'Los modelos de IA pueden generar diagramas Mermaid automáticamente',
      'Es versionable, colaborativo y de código abierto',
    ],
    resources: [
      'https://mermaid.js.org — Documentación oficial',
      'https://mermaid.live — Editor en línea',
      'https://github.com/mermaid-js/mermaid — Repositorio en GitHub',
    ],
  },
];
