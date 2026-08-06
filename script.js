const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 },
);

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const STORY_CHART_SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const STORY_CHART_BOUNDS = { left: 28, right: 432, top: 24, bottom: 168 };

function parseStorySeries(values) {
  return values
    .split(';')
    .map((pair) => pair.split(':').map(Number))
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
}

function renderStoryCharts() {
  document.querySelectorAll('[data-story-chart]').forEach((chart) => {
    if (chart.dataset.storyChartRendered === 'true') return;

    const xMin = Number(chart.dataset.xMin);
    const xMax = Number(chart.dataset.xMax);
    const yMin = Number(chart.dataset.yMin);
    const yMax = Number(chart.dataset.yMax);

    if (![xMin, xMax, yMin, yMax].every(Number.isFinite) || xMax === xMin || yMax === yMin) {
      return;
    }

    const projectPoint = ([x, y]) => ({
      x:
        STORY_CHART_BOUNDS.left +
        ((x - xMin) / (xMax - xMin)) *
          (STORY_CHART_BOUNDS.right - STORY_CHART_BOUNDS.left),
      y:
        STORY_CHART_BOUNDS.bottom -
        ((y - yMin) / (yMax - yMin)) *
          (STORY_CHART_BOUNDS.bottom - STORY_CHART_BOUNDS.top),
    });

    chart.querySelectorAll('[data-story-series]').forEach((series) => {
      const dataPoints = parseStorySeries(series.dataset.values || '');
      if (!dataPoints.length) return;

      const points = dataPoints.map(projectPoint);
      series.setAttribute(
        'points',
        points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' '),
      );

      [
        { key: 'labelStart', point: points[0], isEnd: false },
        { key: 'labelEnd', point: points.at(-1), isEnd: true },
      ].forEach(({ key, point, isEnd }) => {
        const label = series.dataset[key];
        if (!label || !point) return;

        const marker = document.createElementNS(STORY_CHART_SVG_NAMESPACE, 'circle');
        marker.setAttribute('class', 'story-point');
        marker.setAttribute('cx', point.x.toFixed(2));
        marker.setAttribute('cy', point.y.toFixed(2));
        marker.setAttribute('r', '6');
        marker.setAttribute('aria-hidden', 'true');
        chart.append(marker);

        const valueLabel = document.createElementNS(STORY_CHART_SVG_NAMESPACE, 'text');
        valueLabel.setAttribute('class', 'story-value-label');
        const customDx = Number(series.dataset[`${key}Dx`]);
        const customDy = Number(series.dataset[`${key}Dy`]);
        const dx = Number.isFinite(customDx) ? customDx : isEnd ? -9 : 9;
        const dy = Number.isFinite(customDy) ? customDy : -13;
        valueLabel.setAttribute('x', (point.x + dx).toFixed(2));
        valueLabel.setAttribute('y', Math.max(18, point.y + dy).toFixed(2));
        valueLabel.setAttribute('text-anchor', isEnd ? 'end' : 'start');
        valueLabel.setAttribute('aria-hidden', 'true');
        valueLabel.textContent = label;
        chart.append(valueLabel);
      });
    });

    chart.dataset.storyChartRendered = 'true';
  });
}

function initializeStoryCarousels() {
  document.querySelectorAll('[data-chart-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
    const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
    const previousButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    const status = carousel.querySelector('[data-carousel-status]');
    const announcement = carousel.querySelector('[data-carousel-announcement]');
    const viewport = carousel.querySelector('.story-carousel-viewport');

    if (!track || !slides.length || !previousButton || !nextButton || !viewport) return;

    let currentIndex = 0;
    let pointerStart = null;

    const showSlide = (requestedIndex) => {
      currentIndex = (requestedIndex + slides.length) % slides.length;
      track.style.setProperty('--carousel-index', currentIndex);

      slides.forEach((slide, index) => {
        const isActive = index === currentIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
        slide.toggleAttribute('inert', !isActive);
      });

      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });

      if (status) status.textContent = `${currentIndex + 1} of ${slides.length}`;
      if (announcement) {
        const title = slides[currentIndex].querySelector('h2')?.textContent?.trim();
        announcement.textContent = `Chart ${currentIndex + 1} of ${slides.length}${
          title ? `: ${title}` : ''
        }`;
      }
    };

    previousButton.addEventListener('click', () => showSlide(currentIndex - 1));
    nextButton.addEventListener('click', () => showSlide(currentIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));

    carousel.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target.closest('a')) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showSlide(currentIndex - 1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(currentIndex + 1);
      }
    });

    viewport.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    });

    viewport.addEventListener('pointerup', (event) => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;

      const deltaX = event.clientX - pointerStart.x;
      const deltaY = event.clientY - pointerStart.y;
      pointerStart = null;

      if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.1) return;
      showSlide(currentIndex + (deltaX < 0 ? 1 : -1));
    });

    viewport.addEventListener('pointercancel', () => {
      pointerStart = null;
    });

    showSlide(0);
  });
}

renderStoryCharts();
initializeStoryCarousels();

const webMcpTools = [
  {
    name: 'get_site_summary',
    title: 'Get Hey Sammy summary',
    description:
      'Returns a concise description of Hey Sammy and links to its main public resources.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            name: 'Hey Sammy',
            summary:
              'Hey Sammy helps people find recurring local activities, become regulars, and build real-world friendships.',
            links: {
              about: new URL('/about/', window.location.origin).href,
              blog: new URL('/blog/', window.location.origin).href,
              appStore:
                'https://apps.apple.com/us/app/hey-sammy-try-things-irl/id6766004631',
            },
          }),
        },
      ],
    }),
  },
  {
    name: 'get_agent_resources',
    title: 'Get agent discovery resources',
    description:
      'Returns Hey Sammy machine-readable discovery, API, and Markdown resource URLs.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            apiCatalog: new URL('/.well-known/api-catalog', window.location.origin).href,
            openapi: new URL('/openapi.json', window.location.origin).href,
            agentSkills: new URL(
              '/.well-known/agent-skills/index.json',
              window.location.origin,
            ).href,
            mcpServerCard: new URL(
              '/.well-known/mcp/server-card.json',
              window.location.origin,
            ).href,
            markdown: new URL('/index.html.md', window.location.origin).href,
            llms: new URL('/llms.txt', window.location.origin).href,
          }),
        },
      ],
    }),
  },
];

async function registerWebMcpTools() {
  // The current draft exposes ModelContext on Document. The navigator fallback
  // keeps compatibility with early Chrome preview builds.
  const modelContext = document.modelContext || navigator.modelContext;
  if (!modelContext) return;

  if (typeof modelContext.registerTool === 'function') {
    const controller = new AbortController();
    window.addEventListener('pagehide', () => controller.abort(), { once: true });

    await Promise.all(
      webMcpTools.map((tool) => modelContext.registerTool(tool, { signal: controller.signal })),
    );
    return;
  }

  // Compatibility with the earliest WebMCP proposal.
  if (typeof modelContext.provideContext === 'function') {
    await modelContext.provideContext({ tools: webMcpTools });
  }
}

registerWebMcpTools().catch((error) => {
  console.warn('WebMCP tool registration failed', error);
});
