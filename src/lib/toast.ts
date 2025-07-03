// Simple toast utility for development
export const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message)
    if (typeof window !== 'undefined') {
      alert(`Success: ${message}`)
    }
  },
  error: (message: string) => {
    console.log('❌ Error:', message)
    if (typeof window !== 'undefined') {
      alert(`Error: ${message}`)
    }
  },
  info: (message: string) => {
    console.log('ℹ️ Info:', message)
    if (typeof window !== 'undefined') {
      alert(`Info: ${message}`)
    }
  }
} 