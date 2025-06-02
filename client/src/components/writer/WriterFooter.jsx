import React from 'react'

const WriterFooter = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2025 Inkly Writer Panel. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>For Writers Only</span>
            <span className="text-blue-600 font-medium">✍️ Keep Writing!</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default WriterFooter
