<template>
  <div 
    class="card" 
    :class="{ selected: isSelected }"
    @click="toggleSelection"
  >
    <div class="dealerdraft-cp-card">
      <h5 class="card-title">{{ component.name }}</h5>
      <div class="card-preview dealerdraft-cp-card__container sokal-mx-auto sokal-w-full">
        <div class="sokal-media-container preview-media-container">
          <div class="dealerdraft-cp-card__frame-container sokal-media-cover">
            <iframe
              v-if="iframeReady"
              :src="iframeUrl"
              class="component-image"
              @load="handleIframeLoad"
              @error="handleMediaError"
            ></iframe>
            <div v-else class="component-image iframe-placeholder"></div>
          </div>
        </div>
        <div v-if="mediaFailed" class="fallback">{{ component.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBuilderStore } from '../stores/builderStore'
import { useSequentialLoad } from '../composables/useSequentialLoad'

const props = defineProps({
  component: Object
})

const store = useBuilderStore()
const mediaFailed = ref(false)
const iframeReady = ref(false)

const { register, onIframeLoaded } = useSequentialLoad(props.component.component_type)
let registered = false

watch(
  () => store.currentSection,
  (currentSection) => {
    if (currentSection === props.component.component_type && !registered) {
      registered = true
      register(() => {
        iframeReady.value = true
      })
    }
  },
  { immediate: true }
)

const isSelected = computed(() => store.isSelected(props.component))

const handleIframeLoad = () => {
  onIframeLoaded()
}

const handleMediaError = (e) => {
  e.target.style.display = 'none'
  mediaFailed.value = true
  onIframeLoaded()
}

const toggleSelection = () => {
  store.toggleComponent(props.component)
}

const componentParamValue = `[[%22id_${props.component.id}%22,1]]`;
const componentParams = { navigation: `order_nav=${componentParamValue}&order=[]&order_footer=[]`, home_page: `order_nav=[]&order=${componentParamValue}&order_footer=[]`, footer: `order_nav=[]&order=[]&order_footer=${componentParamValue}` };
const iframeUrl = `/ajax/dealerdraft_preview?${componentParams[props.component.component_type]}`;

</script>

<style scoped>
.card {
  border: 1px solid #e5e7eb;
  padding: 12px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card.selected {
  border-color: #006AFF;
  box-shadow: 0 0 0 2px #006AFF;
}

.card-title {
  padding: 8px 0;
  margin: 0 0 12px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.component-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
}

.iframe-placeholder {
  aspect-ratio: 16/9;
}

.fallback {
  width: 100%;
  aspect-ratio: 16/9;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  padding: 8px;
}

/* New Stuff */

.dealerdraft-cp-card .dealerdraft-cp-card__container {
  pointer-events: none !important;
}

.dealerdraft-cp-card__frame-container {
  overflow: hidden;
}

.dealerdraft-cp-card__frame-container iframe {
  width: 1200px;
  aspect-ratio: 16 / 9;
  border: 0;
  transform: scale(calc(var(--dealerdraft-container-width) / 1200));
  transform-origin: top left;
}

</style>
