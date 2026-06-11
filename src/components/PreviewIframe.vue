<template>
  <div class="dealerdraft-cp-card__frame-container sokal-media-cover">
    <iframe
      v-if="component"
      :data-src="iframeUrl"
    ></iframe>
    <!-- <img 
      v-if="component"
      :src="screenshotUrl" 
      :alt="component.name"
      class="component-image"
      @error="handleImageError"
    /> -->
    <div v-if="component && imageFailed" class="fallback">
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

const imageFailed = ref(false)

const screenshotUrl = computed(() => `${import.meta.env.BASE_URL}component-previews/${props.component.id}.png`)

const handleImageError = (e) => {
  e.target.style.display = 'none'
  imageFailed.value = true
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
</style>
