'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'sponsor', 'about', 'memories', 'flow', 'people', 'chat', 'register']
      let currentSection = 'home'

      // checks which section is mostly within the viewport
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 2) {
            currentSection = section
          }
        }
      }

      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '#home', label: 'Home', section: 'home' },
    { href: '#about', label: 'About', section: 'about' },
    { href: '#people', label: 'People', section: 'people' },
    { href: '#chat', label: 'Chat', section: 'chat' },
    { href: '#register', label: 'Register', section: 'register' },
  ]

  return (
    <div>
      <div className="max-w-screen hidden sm:hidden fixed bg-white/5 backdrop-blur-lg top-2 right-1/2 translate-x-1/2 z-100 md:flex gap-6 2xl:gap-8 text-white transition-all duration-300 px-10 py-6">
        {navItems.map((item) => (
          <Link
            key={item.section}
            href={item.href}
            className={`m-auto hover:scale-110 transition-all duration-300 ${activeSection === item.section
              ? 'font-semibold text-2xl'
              : 'text-xl'
              }
              ${item.label == 'Register' && "bg-white text-black px-3 py-2"}
              `
            }
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div
        className={`block sm:block md:hidden fixed z-100 h-10 bg-white/5 backdrop-blur-lg transition-all duration-500 text-white ${isExpanded ? "h-screen w-screen" : "w-10 top-4 left-4"}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <svg className={`${isExpanded ? "hidden" : "block"} p-1 m-auto`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path></svg>
        <div className='absolute flex flex-col gap-4 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2'>
          {navItems.map((item) => (
            <Link
              key={item.section}
              href={item.href}
              className={`m-auto hover:scale-110 transition-all duration-300 ${activeSection === item.section
                ? 'font-semibold text-2xl'
                : 'text-xl'
                } ${isExpanded ? "block" : "hidden"}
                ${item.label == 'Register' && "bg-white text-black px-3 py-2"}
              `}
            >
              {item.label}
            </Link>
          ))}
        </div>

      </div>


    </div>
  )
}

export default Navbar