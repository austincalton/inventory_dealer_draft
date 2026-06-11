<template>
  <div class="dealerdraft-cp-card__frame-container sokal-media-cover">
    <iframe
      v-if="component"
      class="preview-panel-frame"
      :src="iframeUrl"
      @error="handlePreviewError"
    ></iframe>
    <div v-if="component && previewFailed" class="fallback">
      {{ component.name }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  component: Object,
  section: {
    type: String,
    required: true
  }
})

const previewFailed = ref(false)

const screenshotUrl = computed(() => `${import.meta.env.BASE_URL}component-previews/${props.component.id}.png`)

const handlePreviewError = (e) => {
  e.target.style.display = 'none'
  previewFailed.value = true
}

// Latest
const componentParamValue = `[[%22id_${props.component.id}%22,1]]`;
const componentParams = { navigation: `order_nav=${componentParamValue}&order=[]&order_footer=[]`, home_page: `order_nav=[]&order=${componentParamValue}&order_footer=[]`, footer: `order_nav=[]&order=[]&order_footer=${componentParamValue}` };
const iframeUrl = `/ajax/dealerdraft_preview?${componentParams[props.component.component_type]}`;

</script>

<style scoped>
.dealerdraft-cp-card__frame-container {
  width: 100%;
}

.component-image {
  width: 100%;
  height: auto;
  display: block;
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

iframe.preview-panel-frame {
  width: 1200px;
  aspect-ratio: 16 / 9;
  border: 0;
  transform: scale(calc(var(--dealerdraft-container-width) / 1200));
  transform-origin: top left;
}

</style>
