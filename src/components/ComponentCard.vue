<template>
  <div 
    class="card" 
    :class="{ selected: isSelected }"
    @click="toggleSelection"
  >
    <div class="dealerdraft-cp-card">
      <h5 class="card-title">{{ component.name }}</h5>
      <div class="card-preview dealerdraft-cp-card__container sokal-mx-auto sokal-w-full">
        <PreviewIframe :component="component" sequential />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBuilderStore } from '../stores/builderStore'
import PreviewIframe from './PreviewIframe.vue'

const props = defineProps({
  component: Object
})

const store = useBuilderStore()

const isSelected = computed(() => store.isSelected(props.component))

const toggleSelection = () => {
  store.toggleComponent(props.component)
}

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

/* New Stuff */

.dealerdraft-cp-card .dealerdraft-cp-card__container {
  pointer-events: none !important;
}

</style>
