// Enhanced toast system with proper UI components
export const toast = {
  success: (title: string, description?: string) => {
    console.log('✅ Success:', title, description)
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'success', title, description }
      })
      window.dispatchEvent(event)
    }
  },
  error: (title: string, description?: string) => {
    console.log('❌ Error:', title, description)
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'error', title, description }
      })
      window.dispatchEvent(event)
    }
  },
  warning: (title: string, description?: string) => {
    console.log('⚠️ Warning:', title, description)
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'warning', title, description }
      })
      window.dispatchEvent(event)
    }
  },
  info: (title: string, description?: string) => {
    console.log('ℹ️ Info:', title, description)
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'info', title, description }
      })
      window.dispatchEvent(event)
    }
  }
} 