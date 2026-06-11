<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <h1 class="page-title">Component Builder</h1>
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
      <div class="components-panel">
        <h2 class="section-title">{{ store.sectionTitle }}</h2>
        <div id="dealerdraft-component-previews" class="component-grid-OFF" v-if="store.currentComponents.length" style="--dealerdraft-container-width: 500;" ref="previews">
          <ComponentCard
            v-for="comp in store.currentComponents"
            :key="comp.id"
            :component="comp"
          />
        </div>
        <div v-else class="no-components">
          No components available for this section
        </div>
      </div>

      <aside class="preview-panel">
        <PreviewPanel />
      </aside>
    </main>
  </div>
</template>

<script setup>
// import { onMounted } from 'vue'
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useBuilderStore } from './stores/builderStore'
import { allowedComponents } from './config/allowedComponents'
import ComponentCard from './components/ComponentCard.vue'
import PreviewPanel from './components/PreviewPanel.vue'

const store = useBuilderStore()

const getSectionLabel = (section) => {
  const labels = {
    navigation: 'Navigation',
    home_page: 'Home Page',
    footer: 'Footer'
  }
  return labels[section] || section
}

const previews = ref(null);

function updateWidth() {
  const firstItem = previews.value?.querySelector('.dealerdraft-cp-card');
  if (!firstItem) return;

  const width = firstItem.getBoundingClientRect().width;
  previews.value.style.setProperty('--dealerdraft-container-width', width);
}

let observer;

function setupResizeTracking() {
  const firstItem = previews.value?.querySelector('.item');
  if (!firstItem) return;

  observer = new ResizeObserver(() => {
    updateWidth();
  });

  observer.observe(firstItem);
}

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

.section-title {
  font-size: 22px;
  margin: 0 0 20px;
  color: #111827;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
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

#dealerdraft-component-previews {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto;
  gap: 1em;
}

</style>
