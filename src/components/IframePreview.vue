<template>
  <div class="dealerdraft-cp-card__frame-container">
    <div v-if="!src" class="loading-placeholder">
      <span class="loading-spinner"></span>
      Loading...
    </div>
    <iframe
      v-else-if="component"
      ref="iframeRef"
      :src="src"
      frameborder="0"
      class="iframe-preview"
      @load="onIframeLoad"
    ></iframe>
    <div v-else class="placeholder">Waiting…</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSequentialLoad } from '../composables/useSequentialLoad'

const props = defineProps({
  component: Object,
  section: {
    type: String,
    required: true
  }
})

const iframeRef = ref(null)
const src = ref('')

const { register, onIframeLoaded } = useSequentialLoad(props.section)

const previewUrl = computed(() => {
  if (!props.component) return ''

  const parentBrand = 'ford'
  const value = encodeURIComponent(
    JSON.stringify([["id_" + props.component.id, 1]])
  )

  let orderNav = '[]'
  let order = '[]'
  let orderFooter = '[]'

  if (props.section === 'navigation') {
    orderNav = value
  } else if (props.section === 'home_page') {
    order = value
  } else if (props.section === 'footer') {
    orderFooter = value
  }

  return `http://cf.local.gosokal.com:3000/ajax/dealerdraft_preview?parent_brand=${parentBrand}&order_nav=${orderNav}&order=${order}&order_footer=${orderFooter}`
})

const onIframeLoad = () => {
  onIframeLoaded()
}

onMounted(() => {
  register(() => {
    src.value = previewUrl.value
  })
})
</script>

<style>
  .dealerdraft-cp-card__frame-container {
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
  }

  .iframe-preview {
    width: 1200px;
    height: fit-content;
    border: 0;
    aspect-ratio: 16/9;
    transform: scale(0.35);
    transform-origin: top left;
  }

  .loading-placeholder {
    width: 100%;
    aspect-ratio: 16/9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #666;
    gap: 8px;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #ddd;
    border-top-color: #666;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
