<template>
  <div class="preview-panel">
    <div class="preview-header">
      <h3 class="preview-title">Preview</h3>
      <button 
        class="clear-btn" 
        @click="store.clearAllSections()"
        :disabled="!hasAnySelections"
      >
        Clear All
      </button>
    </div>
    
    <div class="preview-scroll-area">
      <draggable 
        v-model="selectedComponents" 
        item-key="id"
        class="component-list"
        handle=".drag-handle"
        ghost-class="ghost"
      >
        <template #item="{ element: comp }">
          <div class="component-wrapper">
            <div class="drag-handle" title="Drag to reorder">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            <div class="component-frame">
              <PreviewIframe
                :component="comp"
                :section="comp.component_type"
              />
            </div>
          </div>
        </template>
      </draggable>
      
      <div v-if="!hasAnySelections" class="preview-empty">
        Select components to see them here
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBuilderStore } from '../stores/builderStore'
import draggable from 'vuedraggable'
import PreviewIframe from './PreviewIframe.vue'

const store = useBuilderStore()

const selectedComponents = computed({
  get: () => store.selectedComponents,
  set: (val) => store.reorderSelected(val)
})

const hasAnySelections = computed(() => store.selectedComponents.length > 0)
</script>

<style scoped>
.preview-panel {
  position: sticky;
  top: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.clear-btn {
  padding: 4px 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  pointer-events: auto;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preview-scroll-area {
  max-height: 70vh;
  overflow-y: auto;
  padding: 16px;
}

.component-list {
  display: flex;
  flex-direction: column;
}

.component-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 0;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px;
}

.component-wrapper:last-child {
  border-bottom: none;
}

.drag-handle {
  cursor: grab;
  color: #9ca3af;
  padding: 4px;
  flex-shrink: 0;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle:hover {
  color: #6b7280;
}

.component-frame {
  flex: 1;
  min-width: 0;
}

.ghost {
  opacity: 0.5;
  background: #e5e7eb;
}

.preview-empty {
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  padding: 40px 0;
}

</style>
