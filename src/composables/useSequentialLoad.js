import { reactive } from 'vue'

const sectionState = reactive({
  navigation: { queue: [], currentIndex: 0 },
  home_page: { queue: [], currentIndex: 0 },
  footer: { queue: [], currentIndex: 0 }
})

export function useSequentialLoad(section) {
  const state = sectionState[section]
  
  const register = (onReadyToLoad) => {
    const index = state.queue.length
    state.queue.push({ index, onReadyToLoad })
    
    if (index === 0) {
      onReadyToLoad()
    }
  }
  
  const onIframeLoaded = () => {
    const nextIndex = state.currentIndex + 1
    state.currentIndex = nextIndex
    
    if (nextIndex < state.queue.length) {
      state.queue[nextIndex].onReadyToLoad()
    }
  }
  
  const reset = () => {
    state.queue = []
    state.currentIndex = 0
  }
  
  const isFirst = () => state.currentIndex === 0
  
  return {
    register,
    onIframeLoaded,
    reset,
    isFirst
  }
}

export function resetAllSections() {
  Object.values(sectionState).forEach(state => {
    state.queue = []
    state.currentIndex = 0
  })
}
