<template>
  <div 
    class="card" 
    :class="{ selected: isSelected }"
    @click="toggleSelection"
  >
    <h5 class="card-title">{{ component.name }}</h5>

    <div class="card-preview">
      <img 
        :src="screenshotUrl" 
        :alt="component.name"
        class="component-image"
        @error="handleImageError"
      />
      <div v-if="imageFailed" class="fallback">
        {{ component.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBuilderStore } from '../stores/builderStore'

const props = defineProps({
  component: Object
})

const store = useBuilderStore()
const imageFailed = ref(false)

const isSelected = computed(() => store.isSelected(props.component))

const screenshotUrl = computed(() => `${import.meta.env.BASE_URL}component-previews/${props.component.id}.png`)

const handleImageError = (e) => {
  e.target.style.display = 'none'
  imageFailed.value = true
}

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

.card-preview {
  width: 100%;
}

.component-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
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
