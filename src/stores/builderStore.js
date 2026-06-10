import { defineStore } from 'pinia'

export const useBuilderStore = defineStore('builder', {
  state: () => ({
    brand: null,
    currentSection: 'navigation',
    sections: ['navigation', 'home_page', 'footer'],
    components: {
      navigation: [],
      home_page: [],
      footer: []
    },
    selectedComponents: [],
    componentScreenshots: {}
  }),
  getters: {
    currentComponents: (state) => state.components[state.currentSection] || [],
    currentSelected: (state) => state.selectedComponents || [],
    canGoNext: (state) => {
      const idx = state.sections.indexOf(state.currentSection)
      return idx < state.sections.length - 1
    },
    canGoPrevious: (state) => {
      const idx = state.sections.indexOf(state.currentSection)
      return idx > 0
    },
    sectionTitle: (state) => {
      const titles = {
        navigation: 'Navigation',
        home_page: 'Home Page',
        footer: 'Footer'
      }
      return titles[state.currentSection] || state.currentSection
    }
  },
  actions: {
    setComponents(section, list) {
      this.components[section] = list
    },
    toggleComponent(component) {
      const index = this.selectedComponents.findIndex(c => c.id === component.id)

      if (index > -1) {
        this.selectedComponents.splice(index, 1)
      } else {
        this.selectedComponents.push(component)
      }
    },
    isSelected(component) {
      return this.selectedComponents.some(c => c.id === component.id)
    },
    switchSection(newSection) {
      this.currentSection = newSection
    },
    nextSection() {
      const idx = this.sections.indexOf(this.currentSection)
      if (idx < this.sections.length - 1) {
        this.switchSection(this.sections[idx + 1])
      }
    },
    previousSection() {
      const idx = this.sections.indexOf(this.currentSection)
      if (idx > 0) {
        this.switchSection(this.sections[idx - 1])
      }
    },
    clearSection() {
      const sectionKey = this.currentSection
      this.selectedComponents = this.selectedComponents.filter(
        c => c.component_type !== sectionKey
      )
    },
    reorderSelected(newOrder) {
      this.selectedComponents = newOrder
    },
    clearAllSections() {
      this.selectedComponents = []
    }
  }
})
