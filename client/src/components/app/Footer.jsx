import React from 'react'
import { Heart, Github, Twitter, Mail, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="border-t bg-background relative bottom-0 left-0 w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Inkly</h3>
            <p className="text-sm text-muted-foreground">
              Your creative writing companion
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/updates" className="hover:text-foreground transition-colors">Updates</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Connect</h4>
            <div className="flex space-x-4">
              <a href="https://github.com/sajidmehmoodtariq30" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github size={20} />
              </a>
              <a href="https://x.com/SajidMTariq" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter size={20} />
              </a>
              <a href="mailto:sajidmehmoodtariq5@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail size={20} />
              </a>
              <a href="https://www.linkedin.com/in/sajid-mehmood-tariq/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Developed By <a href="https://sajidmehmoodtariq.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">Sajid Mehmood</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer