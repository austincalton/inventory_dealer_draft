<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <img class="dealerdraft-logo" :src="imagePath('Dealer-Draft_logo.png')" alt="Component Builder" />
      </div>
      <div class="header-center">
        <div class="section-tabs">
          <button 
            v-for="section in store.sections" 
            :key="section"
            class="tab-btn"
            :class="{ active: store.currentSection === section }"
            @click="store.switchSection(section)"
          >
            {{ getSectionLabel(section) }}
          </button>
        </div>
      </div>
      <div class="header-right">
        <button 
          class="nav-btn prev-btn"
          :disabled="!store.canGoPrevious"
          @click="store.previousSection()"
        >
          Previous
        </button>
        <button 
          class="nav-btn next-btn"
          :disabled="!store.canGoNext"
          @click="store.nextSection()"
        >
          Next
        </button>
      </div>
    </header>

    <main class="main-content">
      <div class="components-panel" ref="componentsPanel">
        <div
          v-for="section in store.sections"
          :key="section"
          class="section-content"
          :class="[`section-content--${section}`, { active: store.currentSection === section }]"
        >
          <h2 class="section-title">{{ getSectionLabel(section) }}</h2>
          <div v-if="store.components[section].length" class="dealerdraft-component-previews" style="--dealerdraft-container-width: 500;">
            <ComponentCard
              v-for="comp in store.components[section]"
              :key="comp.id"
              :component="comp"
            />
          </div>
          <div v-else class="no-components">
            No components available for this section
          </div>
        </div>
      </div>

      <aside class="preview-panel">
        <PreviewPanel />
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { useBuilderStore } from './stores/builderStore'
import { allowedComponents } from './config/allowedComponents'
import ComponentCard from './components/ComponentCard.vue'
import PreviewPanel from './components/PreviewPanel.vue'

const store = useBuilderStore()

const imagePath = (suffix) => `${new URL(import.meta.url).origin}${import.meta.env.BASE_URL}${suffix}`

const getSectionLabel = (section) => {
  const labels = {
    navigation: 'Navigation',
    home_page: 'Home Page',
    footer: 'Footer'
  }
  return labels[section] || section
}

const componentsPanel = ref(null)
let observer

function getActiveGrid() {
  if (!componentsPanel.value) return null
  return componentsPanel.value.querySelector('.section-content.active .dealerdraft-component-previews')
}

function updateWidth() {
  const grid = getActiveGrid()
  if (!grid) return
  const firstCard = grid.querySelector('.dealerdraft-cp-card')
  if (!firstCard) return
  const width = firstCard.getBoundingClientRect().width
  grid.style.setProperty('--dealerdraft-container-width', width)
}

function setupResizeTracking() {
  if (observer) observer.disconnect()
  const grid = getActiveGrid()
  if (!grid) return
  const firstCard = grid.querySelector('.dealerdraft-cp-card')
  if (!firstCard) return
  observer = new ResizeObserver(() => { updateWidth() })
  observer.observe(firstCard)
}

watch(() => store.currentSection, async () => {
  await nextTick()
  updateWidth()
  setupResizeTracking()
})

onMounted(async () => {
  try {
    const response = await fetch('/ajax/available_website_components', {
      credentials: 'same-origin' // important for Rails cookies/auth
    })
    const data = await response.json()

    const componentTypes = ['navigation', 'home_page', 'footer']
    
    for (const type of componentTypes) {
      store.setComponents(type, 
        data[type].filter(c => allowedComponents[type].includes(c.name))
      )
    }
    console.log('Components loaded:', data);

    await nextTick(); // ensures DOM is painted
    updateWidth();
    setupResizeTracking();
    window.dispatchEvent(new Event('dealerdraft-previews-available'));
  } catch (error) {
    console.error('Error fetching components:', error)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<style>
* {
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  font-family: Arial, sans-serif;
  background: #f5f7fa;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  flex: 1;
}

.dealerdraft-logo {
  width: 100%;
  max-width: 200px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.section-tabs {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #111827;
}

.tab-btn.active {
  background: white;
  color: #006AFF;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.nav-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #f9fafb;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-btn {
  background: #006AFF;
  border-color: #006AFF;
  color: white;
}

.next-btn:hover:not(:disabled) {
  background: #0056cc;
}

.main-content {
  display: flex;
  padding: 24px;
  gap: 24px;
}

.components-panel {
  flex: 1;
  min-width: 0;
}

.section-content {
  display: none;
}

.section-content.active {
  display: block;
}

.section-title {
  font-size: 22px;
  margin: 0 0 20px;
  color: #111827;
}

.preview-panel {
  width: 300px;
  flex-shrink: 0;
}

.no-components {
  padding: 40px;
  text-align: center;
  color: #6b7280;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* New Stuff */

.dealerdraft-component-previews {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto;
  gap: 1em;
}

.section-content .preview-media-container {
  padding-top: 47%;
}

.section-content--navigation .preview-media-container {
  padding-top: 12%;
}

</style>
