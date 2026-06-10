<template>
  <div class="sokal-media-container preview-media-container" :class="`preview-media-container--${sectionKey}`">
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBuilderStore } from '../stores/builderStore'
import { useSequentialLoad } from '../composables/useSequentialLoad'

const props = defineProps({
  component: Object,
  sequential: {
    type: Boolean,
    default: false
  }
})

const store = useBuilderStore()
const mediaFailed = ref(false)
const iframeReady = ref(!props.sequential)

const sectionKey = computed(() => props.component.component_type)

const { register, onIframeLoaded } = useSequentialLoad(sectionKey.value)
let registered = false

if (props.sequential) {
  watch(
    () => store.currentSection,
    (currentSection) => {
      if (currentSection === sectionKey.value && !registered) {
        registered = true
        register(() => { iframeReady.value = true })
      }
    },
    { immediate: true }
  )
}

const handleIframeLoad = () => {
  if (props.sequential) {
    onIframeLoaded()
  }
}

const handleMediaError = (e) => {
  e.target.style.display = 'none'
  mediaFailed.value = true
  if (props.sequential) {
    onIframeLoaded()
  }
}

const componentParamValue = `[[%22id_${props.component.id}%22,1]]`
const componentParams = {
  navigation: `order_nav=${componentParamValue}&order=[]&order_footer=[]`,
  home_page: `order_nav=[]&order=${componentParamValue}&order_footer=[]`,
  footer: `order_nav=[]&order=[]&order_footer=${componentParamValue}`
}
const iframeUrl = `/ajax/dealerdraft_preview?${componentParams[sectionKey.value]}`
</script>

<style scoped>
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

.dealerdraft-cp-card__frame-container {
  overflow: hidden;
  width: 100%;
}

.dealerdraft-cp-card__frame-container iframe.component-image {
  width: 1200px;
  aspect-ratio: 16 / 9;
  border: 0;
  transform: scale(calc(var(--dealerdraft-container-width) / 1200));
  transform-origin: top left;
}

.preview-media-container {
  padding-top: 47%;
}

.preview-media-container--navigation {
  padding-top: 12%;
}
</style>
