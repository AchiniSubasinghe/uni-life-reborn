'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { X, Menu } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const navItems = [
  { href: '#hero', label: 'Home', section: 'hero' },
  { href: '#services', label: 'Services', section: 'services' },
  { href: '#about', label: 'About', section: 'about' },
  { href: '#people', label: 'People', section: 'people' },
  { href: '#contact', label: 'Contact', section: 'contact' },
]

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('hero')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      const sectionIds = navItems.map((i) => i.section)
      let current = 'hero'
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= window.innerHeight * 0.45) current = id
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (section: string) => {
    const el = document.getElementById(section)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <>
      {/* Desktop navbar — floating pill */}
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center justify-between gap-1 px-6 py-2 rounded-full w-[900px] transition-all duration-500 ${scrolled
          ? 'glass-strong shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
          : 'glass'
          }`}
      >
        <Link href="/" className="flex items-center gap-2 pr-4 mr-2 border-r border-white/10">
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-white text-xs font-bold leading-none">U</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">UniLife</span>
        </Link>

        {navItems.map((item) => (
          <button
            key={item.section}
            onClick={() => scrollTo(item.section)}
            className={`relative px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${activeSection === item.section
              ? 'text-white bg-white/10'
              : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
              }`}
          >
            {item.label}
          </button>
        ))}

        <div className="flex items-center gap-2 pl-4 ml-2 border-l border-white/10">
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 rounded-full text-sm bg-white text-black font-semibold hover:bg-white/90 transition-all duration-200 hover:scale-105"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Mobile navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 flex md:hidden items-center justify-between px-5 py-3 rounded-2xl glass">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-white text-xs font-bold leading-none">U</span>
          </div>
          <span className="text-white font-semibold text-sm">UniLife</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/60 hover:text-white transition-colors p-1"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] md:hidden"
            style={{ backgroundColor: 'rgba(14,10,4,0.92)', backdropFilter: 'blur(20px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full px-8 pt-20 pb-12"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col gap-2 flex-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.section}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => scrollTo(item.section)}
                    className={`text-left px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${activeSection === item.section
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                      }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3 rounded-2xl glass text-white font-medium text-base"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3 rounded-2xl bg-white text-black font-semibold text-base hover:bg-white/90 transition-colors"
                >
                  Sign up free
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
