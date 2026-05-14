// App.jsx - WORK SECTION WITH IDENTITY PANEL - Portfolio de proyectos con vista interna
// MODIFICADO: Lightbox con mejor respiración visual y excepciones quirúrgicas
// NO SE MODIFICARON: ProjectCard, bloom, hover, carrusel, identidad, galería interna, array projects

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'

// Detectar móvil y preferencias al inicio
const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Umbral para distinguir drag de click
const DRAG_THRESHOLD = 6

// Componente ImageLightbox - PREMIUM CON RESPIRACIÓN VISUAL Y EXCEPCIONES QUIRÚRGICAS
const ImageLightbox = memo(({ images, currentIndex, onClose, onPrev, onNext, isMobile, projectId }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [orientationClass, setOrientationClass] = useState('orientation-landscape')
  const [specialClass, setSpecialClass] = useState('')
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const prevIndexRef = useRef(currentIndex)
  const imageKeyRef = useRef(currentIndex)
  const imgRef = useRef(null)
  
  // Forzar key dinámica para animación de entrada
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      setTransitioning(true)
      setImageLoaded(false)
      setOrientationClass('orientation-landscape')
      setSpecialClass('')
      imageKeyRef.current = currentIndex
      
      const timer = setTimeout(() => {
        setTransitioning(false)
      }, 60)
      
      prevIndexRef.current = currentIndex
      return () => clearTimeout(timer)
    }
  }, [currentIndex])
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    document.body.classList.add('lightbox-open')
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      document.body.classList.remove('lightbox-open')
    }
  }, [onClose, onPrev, onNext])

  if (!images || images.length === 0) return null

  const currentImage = images[currentIndex]
  const currentCaption = currentImage.caption || ''
  const currentSrc = currentImage.src || ''
  
  // Detectar excepciones especiales para imágenes problemáticas
  const getSpecialClass = () => {
    // Proyecto 1 - Coastal village overview (panorámica que se veía demasiado cerca)
    if (projectId === 1 && currentCaption.includes('Coastal village overview')) {
      return 'special-wide-safe'
    }
    // Proyecto 4 - Material and atmosphere detail (vertical que se veía demasiado grande)
    if (projectId === 4 && currentCaption.includes('Material and atmosphere detail')) {
      return 'special-ornamental-asset'
    }
    return ''
  }
  
  // Detección de orientación basada en dimensiones reales de la imagen
  const handleImageLoad = (e) => {
    const img = e.target
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight
    const ratio = naturalWidth / naturalHeight
    
    setImageDimensions({ width: naturalWidth, height: naturalHeight })
    
    // Verificar si es una imagen especial
    const special = getSpecialClass()
    setSpecialClass(special)
    
    // Si es imagen especial, no aplicamos orientación normal (se maneja con CSS especial)
    if (special) {
      setOrientationClass('orientation-special')
      setImageLoaded(true)
      return
    }
    
    // Determinar clase de orientación para imágenes normales
    if (ratio >= 2.0) {
      setOrientationClass('orientation-wide')
    } else if (ratio >= 1.2) {
      setOrientationClass('orientation-landscape')
    } else if (ratio >= 0.9 && ratio <= 1.1) {
      setOrientationClass('orientation-square')
    } else {
      setOrientationClass('orientation-portrait')
    }
    
    setImageLoaded(true)
  }
  
  const animStyle = prefersReducedMotion 
    ? 'none' 
    : 'opacity 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05), transform 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05), filter 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05)'
  
  // Determinar la clase del canvas
  const getCanvasClassName = () => {
    if (specialClass) {
      return `lightbox-premium-canvas canvas-${specialClass}`
    }
    return `lightbox-premium-canvas canvas-${orientationClass}`
  }
  
  const getImageClassName = () => {
    if (specialClass) {
      return `lightbox-premium-img img-${specialClass} ${transitioning ? 'img-transitioning' : ''} ${imageLoaded ? 'img-loaded' : ''}`
    }
    return `lightbox-premium-img img-${orientationClass} ${transitioning ? 'img-transitioning' : ''} ${imageLoaded ? 'img-loaded' : ''}`
  }

  return (
    <div className="lightbox-premium-container" onClick={onClose}>
      <div className="lightbox-premium-bg" />
      
      <div className="lightbox-premium-header">
        <span className="lightbox-premium-counter">
          {currentIndex + 1} / {images.length}
        </span>
        <button className="lightbox-premium-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="lightbox-premium-main" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-premium-nav lightbox-premium-prev" onClick={onPrev} disabled={images.length <= 1}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className={getCanvasClassName()}>
          <img
            ref={imgRef}
            key={imageKeyRef.current}
            src={currentImage.src}
            alt={currentImage.caption || `Image ${currentIndex + 1}`}
            className={getImageClassName()}
            style={{ transition: animStyle }}
            onLoad={handleImageLoad}
          />
        </div>

        <button className="lightbox-premium-nav lightbox-premium-next" onClick={onNext} disabled={images.length <= 1}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {currentImage.caption && (
        <div 
          key={`caption-${currentIndex}`}
          className={`lightbox-premium-caption ${transitioning ? 'caption-transitioning' : ''}`}
          style={{ transition: prefersReducedMotion ? 'none' : 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.2, 0.95, 0.4, 1.05)' }}
        >
          <span>{currentImage.caption}</span>
        </div>
      )}
    </div>
  )
})

ImageLightbox.displayName = 'ImageLightbox'

// Componente ProjectCard - INTERACCIÓN PREMIUM CON BLOOM EXTERNO, FIJO Y CENTRADO
const ProjectCard = memo(({ project, isHovered, onMouseEnter, onMouseMove, onMouseLeave, onClick, imageOffset, tilt, isFocused }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [clickState, setClickState] = useState('idle')
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [sweepActive, setSweepActive] = useState(false)
  const [sweepOrigin, setSweepOrigin] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)
  const mouseDownPos = useRef({ x: 0, y: 0 })
  const hasMovedRef = useRef(false)
  
  const isTouchDevice = useRef(isMobile || ('ontouchstart' in window)).current
  const enableEffects = !prefersReducedMotion && !isTouchDevice && !isFocused
  
  const handleLocalMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card || isFocused || !enableEffects) return
    
    if (mouseDownPos.current) {
      const dx = Math.abs(e.clientX - mouseDownPos.current.x)
      const dy = Math.abs(e.clientY - mouseDownPos.current.y)
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        hasMovedRef.current = true
      }
    }
    
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGlowPos({ x, y })
    onMouseMove(e)
  }, [isFocused, onMouseMove, enableEffects])

  const handleMouseDown = useCallback((e) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
    hasMovedRef.current = false
  }, [])

  const handleClick = useCallback((e) => {
    if (hasMovedRef.current) return
    if (clickState !== 'idle' || isFocused) return
    
    if (enableEffects && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setSweepOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setSweepActive(true)
    }
    
    setClickState('pulsing')
    
    setTimeout(() => {
      setClickState('clicked')
      onClick(e)
      
      setTimeout(() => {
        setClickState('idle')
        setSweepActive(false)
      }, 650)
    }, 200)
  }, [clickState, isFocused, onClick, enableEffects])
  
  useEffect(() => {
    if (!isFocused) {
      setClickState('idle')
      setShowDetails(false)
      setSweepActive(false)
    }
  }, [isFocused])
  
  useEffect(() => {
    return () => {
      setClickState('idle')
      setShowDetails(false)
      setSweepActive(false)
    }
  }, [])

  const getTransform = () => {
    if (!enableEffects) return 'none'
    if (clickState === 'pulsing') return 'scale(0.97)'
    if (clickState === 'clicked') return 'scale(1.05)'
    if (tilt && isHovered && !isFocused) {
      return `perspective(1000px) rotateX(${tilt.rotateX * 0.8}deg) rotateY(${tilt.rotateY * 0.8}deg) translateY(-16px) scale(1.045)`
    }
    return 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)'
  }

  const getTransition = () => {
    if (!enableEffects) return 'none'
    if (clickState === 'pulsing') return 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    if (clickState === 'clicked') return 'all 0.45s cubic-bezier(0.2, 0.95, 0.4, 1.05)'
    if (isHovered && !isFocused) return 'transform 0.35s cubic-bezier(0.2, 0.92, 0.4, 1.05), box-shadow 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05)'
    return 'transform 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05), box-shadow 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05)'
  }

  const getBoxShadow = () => {
    if (!enableEffects) {
      return '0 12px 28px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(240, 235, 216, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.4)'
    }
    if (clickState === 'pulsing') {
      return '0 0 0 0 rgba(94, 156, 250, 0.3), 0 6px 14px -8px rgba(0, 0, 0, 0.5)'
    }
    if (clickState === 'clicked') {
      return '0 0 0 10px rgba(94, 156, 250, 0.08), 0 30px 55px -22px rgba(0, 0, 0, 0.75)'
    }
    if (isHovered && !isFocused) {
      return `
        0 40px 65px -28px rgba(0, 0, 0, 0.8),
        0 0 0 1px rgba(94, 156, 250, 0.25),
        0 8px 20px -12px rgba(94, 156, 250, 0.15),
        0 2px 4px -2px rgba(0, 0, 0, 0.3)
      `
    }
    return `
      0 18px 35px -16px rgba(0, 0, 0, 0.65),
      0 0 0 1px rgba(240, 235, 216, 0.04),
      0 4px 8px -4px rgba(0, 0, 0, 0.3)
    `
  }

  const getImageTransform = () => {
    if (!enableEffects) return 'translate(0, 0) scale(1)'
    if (imageOffset && isHovered && !isFocused) {
      return `translate(${imageOffset.x * 0.85}px, ${imageOffset.y * 0.6}px) scale(1.14)`
    }
    return 'translate(0, 0) scale(1)'
  }

  const getOverlayTransform = () => {
    if (!enableEffects) return 'translateY(0)'
    if (isHovered && !isFocused) return 'translateY(-6px)'
    return 'translateY(0)'
  }

  return (
    <div 
      className="project-card-shell"
      style={{
        position: 'relative',
        flex: '0 0 auto',
        width: '360px',
        overflow: 'visible',
        isolation: 'isolate',
        zIndex: isHovered && !isFocused && !isTouchDevice ? 35 : 10,
        transition: 'z-index 0s'
      }}
    >
      <div 
        className="card-bloom"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 'calc(100% + 240px)',
          height: 'calc(100% + 220px)',
          transform: `translate(-50%, -50%) scale(${isHovered && !isFocused && enableEffects ? 1 : 0.92})`,
          background: `radial-gradient(ellipse at center, 
            rgba(94, 156, 250, 0.9) 0%, 
            rgba(94, 156, 250, 0.45) 28%,
            rgba(116, 140, 171, 0.24) 55%, 
            transparent 82%)`,
          borderRadius: '50%',
          filter: 'blur(70px)',
          opacity: isHovered && !isFocused && enableEffects ? 0.8 : 0,
          transition: `opacity 0.45s cubic-bezier(0.2, 0.95, 0.4, 1.05), 
                       transform 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05)`,
          pointerEvents: 'none',
          zIndex: 0,
          mixBlendMode: 'screen',
          willChange: 'opacity, transform'
        }}
      />
      
      <div 
        ref={cardRef}
        className={`premium-card ${isHovered && !isFocused && !isTouchDevice ? 'hovered' : ''} ${isFocused ? 'dimmed' : ''}`}
        style={{
          position: 'relative',
          borderRadius: '20px',
          cursor: 'pointer',
          transform: getTransform(),
          transition: getTransition(),
          boxShadow: getBoxShadow(),
          zIndex: 2,
          willChange: enableEffects ? 'transform, box-shadow' : 'auto',
          background: (isHovered && !isFocused && enableEffects) 
            ? `radial-gradient(circle 380px at ${glowPos.x}% ${glowPos.y}%, rgba(94, 156, 250, 0.18), rgba(240, 235, 216, 0.04) 40%, rgba(94, 156, 250, 0.02) 65%, transparent 85%)` 
            : 'transparent',
          opacity: isFocused ? 0.3 : 1,
          filter: isFocused ? 'brightness(0.4) saturate(0.3)' : 'none',
          transition: isFocused ? 'opacity 0.5s ease, filter 0.5s ease' : getTransition()
        }}
        onMouseEnter={() => { 
          if (!isFocused && !isTouchDevice && enableEffects) {
            onMouseEnter()
            setShowDetails(true)
          }
        }}
        onMouseMove={handleLocalMouseMove}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => { 
          if (!isTouchDevice && !isFocused && enableEffects) {
            onMouseLeave()
            setShowDetails(false)
          }
          mouseDownPos.current = { x: 0, y: 0 }
        }}
        onClick={handleClick}
      >
        <div style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '22px',
          padding: '2px',
          background: (isHovered && !isFocused && enableEffects)
            ? `linear-gradient(145deg, 
                rgba(94, 156, 250, 0.45), 
                rgba(240, 235, 216, 0.2) 30%,
                rgba(94, 156, 250, 0.15) 60%,
                rgba(240, 235, 216, 0.08) 85%,
                rgba(94, 156, 250, 0.35))`
            : 'transparent',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          zIndex: 2,
          transition: enableEffects ? 'opacity 0.35s ease' : 'none',
          opacity: isHovered && !isFocused ? 1 : 0
        }} />
        
        <div style={{
          position: 'absolute',
          top: '-1px',
          left: '12px',
          right: '12px',
          height: '1px',
          background: (isHovered && !isFocused && enableEffects)
            ? 'linear-gradient(90deg, transparent, rgba(94, 156, 250, 0.5), rgba(240, 235, 216, 0.3), rgba(94, 156, 250, 0.5), transparent)'
            : 'transparent',
          borderRadius: '2px',
          pointerEvents: 'none',
          zIndex: 3,
          transition: enableEffects ? 'opacity 0.3s ease' : 'none',
          opacity: isHovered && !isFocused ? 0.7 : 0
        }} />
        
        {sweepActive && enableEffects && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 15
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), rgba(94, 156, 250, 0.25), transparent)',
              filter: 'blur(8px)',
              transform: `translateY(${sweepOrigin.y}px) translateX(-50%)`,
              animation: 'sweepAcross 0.55s cubic-bezier(0.2, 0.95, 0.4, 1.05) forwards',
              opacity: 1
            }} />
          </div>
        )}
        
        <div style={{
          width: '100%',
          aspectRatio: '4 / 3',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          background: '#0a0a0a',
          transform: isHovered && enableEffects ? 'translateZ(10px)' : 'none',
          transition: enableEffects ? 'transform 0.3s ease' : 'none'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            transform: getImageTransform(),
            transition: imageOffset && enableEffects ? 'none' : 'transform 0.45s cubic-bezier(0.2, 0.95, 0.4, 1.05), opacity 0.5s ease',
            willChange: enableEffects ? 'transform' : 'auto',
            opacity: imageLoaded ? 1 : 0
          }}>
            <img 
              src={project.image} 
              alt={project.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: (isHovered && !isFocused && !isTouchDevice && enableEffects) ? '36px 20px 28px' : '28px 18px 16px',
            background: (isHovered && !isFocused && !isTouchDevice && enableEffects)
              ? 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)' 
              : 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)',
            transform: getOverlayTransform(),
            transition: enableEffects ? 'padding 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05), background 0.45s ease, transform 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05)' : 'none',
            zIndex: 3
          }}>
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, #5e9cfa, rgba(94, 156, 250, 0.2))',
              marginBottom: '10px',
              transition: enableEffects ? 'width 0.45s cubic-bezier(0.2, 0.95, 0.4, 1.05) 0.05s, opacity 0.35s ease 0.05s' : 'none',
              width: (isHovered && !isFocused && !isTouchDevice && enableEffects) ? '52px' : '0px',
              opacity: (isHovered && !isFocused && !isTouchDevice && enableEffects) ? 0.9 : 0
            }} />
            
            <h3 style={{
              fontFamily: "'Source Code Pro', monospace",
              fontWeight: 500,
              fontSize: '17px',
              letterSpacing: '0.08em',
              color: '#ffffff',
              margin: 0,
              marginBottom: '5px',
              transform: (isHovered && !isFocused && !isTouchDevice && enableEffects) ? 'translateY(-5px)' : 'translateY(0)',
              transition: enableEffects ? 'transform 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05), color 0.3s ease' : 'none',
              textShadow: '0 3px 8px rgba(0, 0, 0, 0.7)'
            }}>{project.title}</h3>
            
            <p style={{
              fontFamily: "'Source Code Pro', monospace",
              fontWeight: 300,
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: '#7eb8ff',
              margin: 0,
              textTransform: 'uppercase',
              opacity: (isHovered && !isFocused && !isTouchDevice && enableEffects) ? 1 : 0.7,
              transform: (isHovered && !isFocused && !isTouchDevice && enableEffects) ? 'translateY(-3px)' : 'translateY(0)',
              transition: enableEffects ? 'transform 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05) 0.05s, opacity 0.35s ease, color 0.3s ease' : 'none',
              textShadow: '0 2px 5px rgba(0, 0, 0, 0.6)'
            }}>{project.category}</p>
            
            <div style={{
              fontFamily: "'Source Code Pro', monospace",
              fontSize: '7.5px',
              fontWeight: 400,
              letterSpacing: '0.18em',
              color: '#f0ebd8',
              marginTop: '10px',
              opacity: (isHovered && !isFocused && !isTouchDevice && enableEffects) ? 0.8 : 0,
              transform: (isHovered && !isFocused && !isTouchDevice && enableEffects) ? 'translateY(0)' : 'translateY(8px)',
              transition: enableEffects ? 'opacity 0.35s ease 0.1s, transform 0.35s cubic-bezier(0.2, 0.95, 0.4, 1.05) 0.1s' : 'none',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
            }}>
              OPEN PROJECT →
            </div>
          </div>
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: '-14px',
          left: '14px',
          right: '14px',
          background: 'rgba(8, 14, 24, 0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          padding: '16px 18px',
          opacity: (showDetails && !isFocused && !isTouchDevice && enableEffects) ? 1 : 0,
          transform: (showDetails && !isFocused && !isTouchDevice && enableEffects) ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          pointerEvents: (showDetails && !isFocused && !isTouchDevice && enableEffects) ? 'auto' : 'none',
          transition: enableEffects ? 'opacity 0.35s cubic-bezier(0.2, 0.95, 0.4, 1.05), transform 0.35s cubic-bezier(0.2, 0.95, 0.4, 1.05)' : 'none',
          zIndex: 12,
          border: '1px solid rgba(94, 156, 250, 0.14)',
          boxShadow: '0 20px 40px -18px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(94, 156, 250, 0.06)'
        }}>
          <p style={{
            fontFamily: "'Source Code Pro', monospace",
            fontSize: '10.5px',
            lineHeight: 1.55,
            color: '#e0e6f0',
            margin: '0 0 12px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            letterSpacing: '0.01em'
          }}>{project.extendedDescription || project.description}</p>
          
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {project.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} style={{
                fontFamily: "'Source Code Pro', monospace",
                fontSize: '7.5px',
                letterSpacing: '0.08em',
                color: '#7eb8ff',
                background: 'rgba(94, 156, 250, 0.14)',
                padding: '3px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(94, 156, 250, 0.12)'
              }}>{tag}</span>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'Source Code Pro', monospace",
            fontSize: '8.5px',
            color: '#8ea0b8',
            paddingTop: '10px',
            borderTop: '1px solid rgba(138, 155, 181, 0.2)'
          }}>
            <span>{project.year}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>{project.client}</span>
          </div>
          
          {project.projectUrl && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(94, 156, 250, 0.12)' }}>
              <a 
                href={project.projectUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()} 
                style={{
                  fontFamily: "'Source Code Pro', monospace",
                  fontWeight: 400,
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  color: '#7eb8ff',
                  textDecoration: 'none',
                  display: 'inline-block',
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease, color 0.2s ease'
                }}
                onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.color = '#7eb8ff'; }}
              >
                VIEW PROJECT →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

ProjectCard.displayName = 'ProjectCard'

// Componente principal App
export default function App() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [focusedCard, setFocusedCard] = useState(null)
  const [focusTransitioning, setFocusTransitioning] = useState(false)
  
  const scrollContainerRef = useRef(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const velocityRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTimeRef = useRef(0)
  const animationFrameRef = useRef(null)
  
  const [hoveredCard, setHoveredCard] = useState(null)
  const [cardImageOffsets, setCardImageOffsets] = useState({})
  const [cardTilt, setCardTilt] = useState({})

  const getLightboxImages = useCallback(() => {
    if (!focusedCard) return []
    const images = [{ src: focusedCard.image, caption: focusedCard.title }]
    if (focusedCard.additionalImages) {
      focusedCard.additionalImages.forEach(img => {
        images.push({ src: img.src, caption: img.caption })
      })
    }
    return images
  }, [focusedCard])

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const nextImage = useCallback(() => {
    const images = getLightboxImages()
    setLightboxIndex(prev => (prev + 1) % images.length)
  }, [getLightboxImages])

  const prevImage = useCallback(() => {
    const images = getLightboxImages()
    setLightboxIndex(prev => (prev - 1 + images.length) % images.length)
  }, [getLightboxImages])

  const handleMouseDown = useCallback((e) => {
    if (focusedCard || lightboxOpen) return
    if (!scrollContainerRef.current) return
    isDraggingRef.current = true
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft
    lastXRef.current = e.pageX
    lastTimeRef.current = performance.now()
    velocityRef.current = 0
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    scrollContainerRef.current.style.cursor = 'grabbing'
    scrollContainerRef.current.style.userSelect = 'none'
  }, [focusedCard, lightboxOpen])

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !scrollContainerRef.current || focusedCard || lightboxOpen) return
    e.preventDefault()
    
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startXRef.current) * 1.2
    const now = performance.now()
    const dt = Math.max(16, now - lastTimeRef.current)
    const instantVelocity = (e.pageX - lastXRef.current) / dt * 12
    
    velocityRef.current = velocityRef.current * 0.6 + instantVelocity * 0.4
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk
    
    lastXRef.current = e.pageX
    lastTimeRef.current = now
  }, [focusedCard, lightboxOpen])

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
      scrollContainerRef.current.style.userSelect = 'auto'
    }
    
    const applyInertia = () => {
      if (!scrollContainerRef.current || focusedCard || lightboxOpen) return
      velocityRef.current *= 0.96
      if (Math.abs(velocityRef.current) > 0.3) {
        scrollContainerRef.current.scrollLeft -= velocityRef.current * 2.5
        animationFrameRef.current = requestAnimationFrame(applyInertia)
      } else {
        animationFrameRef.current = null
      }
    }
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = requestAnimationFrame(applyInertia)
  }, [focusedCard, lightboxOpen])

  const handleCardMouseMove = useCallback((cardId, e) => {
    if (focusedCard || isMobile || prefersReducedMotion) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5
    
    setCardImageOffsets(prev => ({ ...prev, [cardId]: { x: mouseX * 32, y: mouseY * 18 } }))
    setCardTilt(prev => ({ ...prev, [cardId]: { rotateX: mouseY * 8, rotateY: mouseX * 8 } }))
  }, [focusedCard])

  const handleCardMouseLeave = useCallback((cardId) => {
    if (focusedCard) return
    setCardImageOffsets(prev => { const newState = { ...prev }; delete newState[cardId]; return newState })
    setCardTilt(prev => { const newState = { ...prev }; delete newState[cardId]; return newState })
    setHoveredCard(null)
  }, [focusedCard])

  const handleCardClick = useCallback((project) => {
    if (focusTransitioning || focusedCard) return
    setFocusTransitioning(true)
    setFocusedCard(project)
    setHoveredCard(null)
    setCardImageOffsets({})
    setCardTilt({})
    setTimeout(() => setFocusTransitioning(false), 500)
  }, [focusTransitioning, focusedCard])

  const closeFocusedCard = useCallback(() => {
    if (focusTransitioning) return
    setFocusTransitioning(true)
    setFocusedCard(null)
    setTimeout(() => setFocusTransitioning(false), 500)
  }, [focusTransitioning])

  const projects = useMemo(() => [
    {
      id: 1,
      title: "NO DAYS OFF",
      category: "ENVIRONMENT / REAL-TIME",
      image: "/1.jpg",
      description: "Gameplay-driven coastal village environment focused on spatial readability, navigation flow, and in-engine performance validation.",
      extendedDescription: "Coastal stilt-village environment designed with a gameplay-first approach.",
      fullDescription: "Coastal stilt-village environment designed with a gameplay-first approach. Focused on spatial readability, organic navigation, and functional layout. Each structure operates as a gameplay node, supporting exploration, cover, and interaction. Tested in-engine for scale, sightlines, LOD transitions, draw calls, and stable framerate performance. The environment was built to support verticality, clear sightlines, and distinct gameplay zones.",
      tags: ["ENVIRONMENT", "LEVEL DESIGN", "REAL-TIME"],
      year: "2026",
      client: "Personal Project",
      role: "Environment Artist",
      software: ["Unreal Engine", "Blender"],
      has3DContent: true,
      additionalImages: [
        { id: 1, src: "/2.jpg", caption: "Coastal village overview" },
        { id: 2, src: "/3.jpg", caption: "Gameplay node layout" },
        { id: 3, src: "/4.jpg", caption: "In-engine performance test" }
      ],
      videos: ["/mochila.webm"]
    },
    {
      id: 2,
      title: "COMMERCIAL KITCHEN",
      category: "ENVIRONMENT / REAL-TIME",
      image: "/5.jpg",
      description: "Industrial kitchen environment prepared for Unreal Engine with clean topology, PBR workflow, and optimized real-time performance.",
      extendedDescription: "Industrial Kitchen prepared for Unreal Engine.",
      fullDescription: "Industrial Kitchen prepared for Unreal Engine. Modeled with clean topology and optimized geometry, materials follow a PBR workflow. Lighting is configured for real-time playback and 360 walkthroughs, and assets are optimized for interactive performance with LODs, organized UVs and controlled reflection maps. The project includes a 360 walkthrough, Unreal viewport captures and a production breakdown.",
      tags: ["ENVIRONMENT", "PBR", "REAL-TIME", "KITCHEN"],
      year: "2025",
      client: "Spittia Solution",
      role: "Environment Artist",
      software: ["Unreal Engine", "Blender"],
      has3DContent: true,
      projectUrl: "https://bosco45.github.io/spittiaSolution/",
      additionalImages: [
        { id: 1, src: "/8.jpg", caption: "360 walkthrough view" },
        { id: 2, src: "/7.jpg", caption: "Kitchen detail - Counter and appliances" },
        { id: 3, src: "/6.jpg", caption: "Kitchen detail - Sink and storage" }
      ]
    },
    {
      id: 3,
      title: "ARCHITECTURAL RESIDENCE",
      category: "ENVIRONMENT / ARCHITECTURE",
      image: "/10.jpg",
      description: "High-end architectural environment developed entirely in Blender with premium residential aesthetic and cinematic composition.",
      extendedDescription: "A polished architectural environment built around strong silhouette language.",
      fullDescription: "This project presents a high-end architectural environment developed entirely in Blender, with a strong emphasis on visual clarity, material fidelity, and cinematic composition. The scene was built to deliver a polished and believable atmosphere, using a restrained palette of natural wood, stone, glass, and soft interior lighting to reinforce a premium residential aesthetic. The environment was designed around strong silhouette language and clean spatial hierarchy, allowing both the interior and exterior views to read clearly from multiple camera positions.",
      tags: ["ARCHITECTURE", "BLENDER", "LIGHTING", "PBR"],
      year: "2025",
      client: "Personal Project",
      role: "3D Environment Artist",
      software: ["Blender"],
      has3DContent: false,
      additionalImages: [
        { id: 1, src: "/12.jpg", caption: "Material detail - Wood and stone textures" },
        { id: 2, src: "/11.jpg", caption: "Exterior view - Premium residential aesthetic" }
      ]
    },
    {
      id: 4,
      title: "ORNAMENTAL",
      category: "ENVIRONMENT / LIGHTING",
      image: "/20.jpg",
      description: "Cinematic lighting study focused on a traditional street lamp within a rain-soaked urban scene.",
      extendedDescription: "A focused environment study built around a traditional street lamp.",
      fullDescription: "This project is a cinematic lighting study built around a traditional street lamp as the main focal point within a rain-soaked urban scene. The composition emphasizes atmosphere, contrast, and depth, using warm emissive light against a colder environment to strengthen mood and visual hierarchy. Special attention was given to wet surfaces, reflections, and material response under low-light conditions.",
      tags: ["ENVIRONMENT", "LIGHTING", "MOOD", "ATMOSPHERIC"],
      year: "2024",
      client: "IMPORLED",
      role: "Environment Artist",
      software: [],
      has3DContent: false,
      additionalImages: [
        { id: 1, src: "/21.jpg", caption: "Secondary environment angle" },
        { id: 2, src: "/22.jpg", caption: "Material and atmosphere detail" }
      ]
    }
  ], [])

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  return (
    <>
      {lightboxOpen && focusedCard && (
        <ImageLightbox
          images={getLightboxImages()}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
          isMobile={isMobile}
          projectId={focusedCard.id}
        />
      )}

      <div className={`work-container ${focusedCard ? 'has-focus' : ''}`}>
        
        {/* BLOQUE DE IDENTIDAD */}
        <div className="identity-panel">
          <div className="identity-content">
            <div className="identity-accent" />
            
            <h1 className="identity-name">Annya Fraysheht</h1>
            
            <div className="identity-title-wrapper">
              <span className="identity-title">3D Artist</span>
              <span className="identity-title-separator">—</span>
              <span className="identity-title">Hard Surface</span>
              <span className="identity-title-separator">—</span>
              <span className="identity-title">Real-Time</span>
            </div>
            
            <p className="identity-description">
              3D Artist specializing in production-ready real-time environments, with a strong focus on clean topology, scalable asset pipelines, performance optimization, and refined visual execution.
            </p>
            
            <div className="identity-divider" />
            
            <div className="identity-contact">
              <div className="contact-block">
                <span className="contact-label">CONTACT</span>
                <a href="mailto:annya.frayshehtd@gmail.com" className="contact-email-link">
                  annya.frayshehtd@gmail.com
                </a>
              </div>
            </div>
            
            <div className="identity-social">
              <a 
                href="https://www.instagram.com/trinity3d.360/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
              >
                INSTAGRAM
              </a>
              <span className="social-separator">/</span>
              <a 
                href="https://www.linkedin.com/in/annya-fraysheht/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
              >
                LINKEDIN
              </a>
            </div>
          </div>
        </div>

        {/* CARRUSEL DE TARJETAS */}
        <div className="carousel-panel">
          <div className="carousel-header">
            <span className="carousel-label">SELECTED WORK</span>
            <span className="carousel-hint">← DRAG →</span>
          </div>
          
          <div 
            ref={scrollContainerRef} 
            className={`carousel-scroll ${focusedCard ? 'carousel-blurred' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="projects-track">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isHovered={hoveredCard === project.id}
                  onMouseEnter={() => !focusedCard && !isMobile && setHoveredCard(project.id)}
                  onMouseMove={(e) => handleCardMouseMove(project.id, e)}
                  onMouseLeave={() => handleCardMouseLeave(project.id)}
                  onClick={() => handleCardClick(project)}
                  imageOffset={cardImageOffsets[project.id]}
                  tilt={cardTilt[project.id]}
                  isFocused={!!focusedCard}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VISTA INMERSIVA DEL PROYECTO */}
      {focusedCard && (
        <div className="project-master-view">
          <div className="project-overlay" />
          
          <button className="project-close-btn" onClick={closeFocusedCard}>
            <span>×</span>
          </button>

          <div className="project-layout">
            
            {/* COLUMNA IZQUIERDA - GALERÍA */}
            <div className="project-gallery">
              <div 
                className="gallery-hero hero-cover-mode"
                onClick={() => openLightbox(0)}
              >
                <div className="hero-image-wrapper">
                  <img 
                    src={focusedCard.image} 
                    alt={focusedCard.title}
                    className="hero-img img-cover"
                  />
                </div>
                <div className="hero-hint">VIEW</div>
              </div>

              <div className="gallery-grid">
                {focusedCard.additionalImages?.map((img, idx) => (
                  <div 
                    key={img.id} 
                    className="grid-item grid-cover-mode"
                    onClick={() => openLightbox(idx + 1)}
                    style={{ animationDelay: `${idx * 0.12}s` }}
                  >
                    <div className="grid-image-wrapper">
                      <img 
                        src={img.src} 
                        alt={img.caption}
                        className="grid-img img-cover"
                      />
                    </div>
                    <div className="grid-overlay">
                      <span>{img.caption}</span>
                    </div>
                    <div className="grid-hint">VIEW</div>
                  </div>
                ))}
              </div>

              {focusedCard.videos?.length > 0 && (
                <div className="gallery-video">
                  <div className="video-container">
                    <video 
                      src={focusedCard.videos[0]} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      preload="auto"
                      className="video-player"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA - INFO PANEL */}
            <div className="project-info">
              <div className="info-card">
                <div className="info-accent-line" />
                <div className="info-category">{focusedCard.category}</div>
                <h1 className="info-title">{focusedCard.title}</h1>
                <p className="info-description">{focusedCard.fullDescription}</p>
                
                <div className="info-metadata">
                  <div className="metadata-row">
                    <div className="metadata-field">
                      <span className="field-label">CLIENT</span>
                      <span className="field-value">{focusedCard.client}</span>
                    </div>
                    <div className="metadata-field">
                      <span className="field-label">YEAR</span>
                      <span className="field-value">{focusedCard.year}</span>
                    </div>
                  </div>
                  <div className="metadata-row">
                    <div className="metadata-field">
                      <span className="field-label">ROLE</span>
                      <span className="field-value">{focusedCard.role}</span>
                    </div>
                    <div className="metadata-field">
                      <span className="field-label">SOFTWARE</span>
                      <span className="field-value">
                        {focusedCard.software?.length > 0 ? focusedCard.software.join(', ') : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="info-tags">
                  {focusedCard.tags.map((tag, idx) => (
                    <span key={idx} className="tag-pill">{tag}</span>
                  ))}
                </div>
                
                {focusedCard.projectUrl && (
                  <a href={focusedCard.projectUrl} target="_blank" rel="noopener noreferrer" className="info-link">
                    VIEW PROJECT →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Inyectar estilos CSS globales
const styleSheet = document.createElement("style");
styleSheet.textContent = `  
  /* === ANIMACIONES === */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(60px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes imageFadeIn {
    from { opacity: 0; transform: scale(1.03); filter: blur(10px); }
    to { opacity: 1; transform: scale(1); filter: blur(0); }
  }
  @keyframes sweepAcross {
    0% { transform: translateY(var(--sweep-y, 0px)) translateX(-100%); opacity: 0; }
    15% { opacity: 1; }
    85% { opacity: 1; }
    100% { transform: translateY(var(--sweep-y, 0px)) translateX(100%); opacity: 0; }
  }

  /* === ESTILOS GLOBALES === */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Source Code Pro', monospace;
    background: #000000;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
  }
  
  body.lightbox-open { overflow: hidden; }

  /* === WORK CONTAINER === */
  .work-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    background: #000000;
    transition: opacity 0.4s ease;
  }
  
  .work-container.has-focus {
    opacity: 1;
  }

  /* === BLOQUE DE IDENTIDAD === */
  .identity-panel {
    flex: 0 0 320px;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 60px 32px 60px 60px;
    border-right: 1px solid rgba(240, 235, 216, 0.03);
    background: linear-gradient(
      135deg,
      rgba(2, 5, 10, 0.4) 0%,
      rgba(0, 0, 0, 0.95) 100%
    );
    backdrop-filter: blur(2px);
    position: relative;
  }
  
  .identity-panel::before {
    content: '';
    position: absolute;
    top: 24px;
    right: 0;
    bottom: 24px;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(94, 156, 250, 0.15),
      rgba(94, 156, 250, 0.05),
      transparent
    );
  }
  
  .identity-content {
    max-width: 260px;
    width: 100%;
    position: relative;
    z-index: 2;
  }
  
  .identity-accent {
    width: 48px;
    height: 1px;
    background: linear-gradient(90deg, #5e9cfa, rgba(94, 156, 250, 0.2), transparent);
    margin-bottom: 40px;
    transition: width 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05);
    box-shadow: 0 0 4px rgba(94, 156, 250, 0.3);
  }
  
  .identity-panel:hover .identity-accent {
    width: 68px;
  }
  
  .identity-name {
    font-family: 'Source Code Pro', monospace;
    font-size: 28px;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: #f0ebd8;
    margin: 0 0 18px 0;
    line-height: 1.15;
    position: relative;
    text-rendering: optimizeLegibility;
  }
  
  .identity-title-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 32px;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(94, 156, 250, 0.08);
  }
  
  .identity-title {
    font-family: 'Source Code Pro', monospace;
    font-size: 8px;
    font-weight: 400;
    letter-spacing: 0.18em;
    color: #8a9bb5;
    text-transform: uppercase;
    transition: color 0.2s ease;
  }
  
  .identity-title-separator {
    font-family: 'Source Code Pro', monospace;
    font-size: 8px;
    font-weight: 300;
    color: rgba(94, 156, 250, 0.35);
    letter-spacing: 0.05em;
  }
  
  .identity-description {
    font-family: 'Source Code Pro', monospace;
    font-size: 11.5px;
    font-weight: 300;
    line-height: 1.7;
    color: #c8d4e4;
    margin-bottom: 36px;
    letter-spacing: 0.015em;
    max-width: 240px;
    text-rendering: optimizeLegibility;
  }
  
  .identity-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, rgba(240, 235, 216, 0.08) 0%, rgba(240, 235, 216, 0) 100%);
    margin-bottom: 32px;
    position: relative;
  }
  
  .identity-divider::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 24px;
    height: 1px;
    background: rgba(94, 156, 250, 0.25);
  }
  
  .identity-contact {
    margin-bottom: 32px;
  }
  
  .contact-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .contact-label {
    font-family: 'Source Code Pro', monospace;
    font-size: 7px;
    font-weight: 500;
    letter-spacing: 0.25em;
    color: #5e9cfa;
    opacity: 0.65;
    text-transform: uppercase;
  }
  
  .contact-email-link {
    font-family: 'Source Code Pro', monospace;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.02em;
    color: #e2ded0;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.2, 0.95, 0.4, 1.05);
    opacity: 0.9;
    word-break: break-word;
    overflow-wrap: break-word;
    display: inline-block;
    border-bottom: 1px solid rgba(94, 156, 250, 0.15);
    padding-bottom: 3px;
    max-width: 100%;
    position: relative;
  }
  
  .contact-email-link::before {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 0;
    height: 1px;
    background: #5e9cfa;
    transition: width 0.3s ease;
  }
  
  .contact-email-link:hover {
    opacity: 1;
    color: #ffffff;
    border-bottom-color: rgba(94, 156, 250, 0.3);
  }
  
  .contact-email-link:hover::before {
    width: 100%;
  }
  
  .identity-social {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding-top: 8px;
    margin-top: 4px;
  }
  
  .social-link {
    font-family: 'Source Code Pro', monospace;
    font-size: 8px;
    font-weight: 450;
    letter-spacing: 0.18em;
    color: #a8b8cc;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.2, 0.95, 0.4, 1.05);
    opacity: 0.7;
    position: relative;
    padding: 4px 0;
  }
  
  .social-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background: #5e9cfa;
    transition: width 0.25s ease;
  }
  
  .social-link:hover {
    opacity: 1;
    color: #f0ebd8;
    letter-spacing: 0.2em;
  }
  
  .social-link:hover::after {
    width: 100%;
  }
  
  .social-separator {
    font-family: 'Source Code Pro', monospace;
    font-size: 8px;
    color: #5e9cfa;
    opacity: 0.3;
    font-weight: 300;
  }

  /* === CARRUSEL DE TARJETAS === */
  .carousel-panel {
    flex: 1;
    height: 100vh;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  
  .carousel-header {
    padding: 40px 60px 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid rgba(240, 235, 216, 0.03);
    margin-bottom: 20px;
  }
  
  .carousel-label {
    font-family: 'Source Code Pro', monospace;
    font-size: 9px;
    font-weight: 400;
    letter-spacing: 0.2em;
    color: #8a9bb5;
    text-transform: uppercase;
    opacity: 0.6;
  }
  
  .carousel-hint {
    font-family: 'Source Code Pro', monospace;
    font-size: 8px;
    font-weight: 300;
    letter-spacing: 0.12em;
    color: #8a9bb5;
    opacity: 0.4;
  }
  
  .carousel-scroll {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    overflow-x: auto;
    overflow-y: visible;
    cursor: grab;
    transition: filter 0.4s ease;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .carousel-scroll::-webkit-scrollbar {
    display: none;
  }
  
  .carousel-scroll.carousel-blurred {
    filter: blur(8px);
  }
  
  .projects-track {
    display: flex;
    gap: 28px;
    align-items: center;
    padding: 90px 120px 110px 80px;
  }

  /* === VISTA INMERSIVA DEL PROYECTO - TRANSICIONES VISIBLES === */
  .project-master-view {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 200;
    animation: fadeIn 0.5s ease;
  }

  .project-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(2, 5, 10, 0.96);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    animation: fadeIn 0.7s ease;
  }

  .project-close-btn {
    position: fixed;
    top: 28px;
    right: 28px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(13, 19, 33, 0.6);
    border: 1px solid rgba(240, 235, 216, 0.14);
    color: #f0ebd8;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 210;
    transition: all 0.25s ease;
    backdrop-filter: blur(8px);
    opacity: 0.75;
    animation: fadeIn 0.6s ease 0.25s both;
  }

  .project-close-btn:hover {
    opacity: 1;
    transform: scale(1.08);
    background: rgba(13, 19, 33, 0.85);
    border-color: rgba(240, 235, 216, 0.28);
  }

  .project-close-btn span {
    line-height: 1;
    margin-top: -2px;
  }

  .project-layout {
    display: flex;
    height: 100vh;
    width: 100%;
    gap: 0;
    overflow: hidden;
    position: relative;
    z-index: 201;
  }

  /* === COLUMNA IZQUIERDA - GALERÍA - TRANSICIÓN VISIBLE === */
  .project-gallery {
    flex: 0 0 58%;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 100px 40px 60px 60px;
    scrollbar-width: thin;
    scrollbar-color: rgba(240, 235, 216, 0.12) transparent;
    animation: slideInLeft 0.7s cubic-bezier(0.2, 0.95, 0.4, 1.05) 0.15s both;
  }

  .project-gallery::-webkit-scrollbar { width: 4px; }
  .project-gallery::-webkit-scrollbar-track { background: transparent; }
  .project-gallery::-webkit-scrollbar-thumb { background: rgba(240, 235, 216, 0.12); border-radius: 4px; }

  .gallery-hero {
    position: relative;
    width: 100%;
    margin-bottom: 28px;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05), box-shadow 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05);
  }

  .hero-cover-mode {
    background: transparent;
    aspect-ratio: 16 / 9;
  }

  .hero-image-wrapper { width: 100%; height: 100%; }
  .hero-img { width: 100%; height: 100%; display: block; }
  .hero-img.img-cover { object-fit: cover; }

  .gallery-hero:hover {
    transform: scale(1.025);
    box-shadow: 0 35px 70px -26px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(94, 156, 250, 0.14);
  }

  .hero-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Source Code Pro', monospace;
    font-size: 11px;
    font-weight: 350;
    letter-spacing: 0.25em;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.55);
    padding: 10px 24px;
    border-radius: 30px;
    border: 1px solid rgba(240, 235, 216, 0.18);
    opacity: 0;
    transition: opacity 0.35s ease, background 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.95, 0.4, 1.05);
    pointer-events: none;
    backdrop-filter: blur(8px);
  }

  .gallery-hero:hover .hero-hint { 
    opacity: 1;
    background: rgba(0, 0, 0, 0.7);
    transform: translate(-50%, -50%) scale(1.03);
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .grid-item {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05), box-shadow 0.4s cubic-bezier(0.2, 0.95, 0.4, 1.05);
    animation: slideUp 0.6s ease forwards;
    opacity: 0;
  }

  .grid-cover-mode { background: transparent; aspect-ratio: 4 / 3; }

  .grid-image-wrapper { width: 100%; height: 100%; }
  .grid-img { width: 100%; height: 100%; display: block; }
  .grid-img.img-cover { object-fit: cover; }

  .grid-item:hover {
    transform: translateY(-6px) scale(1.04);
    box-shadow: 0 25px 50px -20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(94, 156, 250, 0.12);
  }

  .grid-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 22px 16px 16px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, transparent 100%);
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.95, 0.4, 1.05);
  }

  .grid-overlay span {
    font-family: 'Source Code Pro', monospace;
    font-size: 9.5px;
    font-weight: 350;
    letter-spacing: 0.04em;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .grid-item:hover .grid-overlay { 
    opacity: 1; 
    transform: translateY(0);
  }

  .grid-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Source Code Pro', monospace;
    font-size: 9px;
    font-weight: 350;
    letter-spacing: 0.18em;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.5);
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid rgba(240, 235, 216, 0.14);
    opacity: 0;
    transition: opacity 0.35s ease, background 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.95, 0.4, 1.05);
    pointer-events: none;
    backdrop-filter: blur(6px);
  }

  .grid-item:hover .grid-hint { 
    opacity: 1;
    background: rgba(0, 0, 0, 0.65);
    transform: translate(-50%, -50%) scale(1.04);
  }

  .gallery-video { margin-top: 16px; margin-bottom: 40px; }

  .video-container {
    width: 100%;
    border-radius: 20px;
    overflow: hidden;
    background: #0a0e16;
    border: 1px solid rgba(240, 235, 216, 0.05);
    transition: transform 0.35s cubic-bezier(0.2, 0.95, 0.4, 1.05), box-shadow 0.35s cubic-bezier(0.2, 0.95, 0.4, 1.05);
    aspect-ratio: 16 / 9;
  }

  .video-container:hover {
    transform: translateY(-3px);
    box-shadow: 0 30px 50px -22px rgba(0, 0, 0, 0.6);
  }

  .video-player {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    background: #0a0e16;
  }

  /* === COLUMNA DERECHA - INFO PANEL - TRANSICIÓN VISIBLE === */
  .project-info {
    flex: 0 0 42%;
    height: 100vh;
    display: flex;
    align-items: center;
    padding: 100px 60px 60px 20px;
    overflow-y: auto;
    animation: slideInRight 0.8s cubic-bezier(0.2, 0.95, 0.4, 1.05) 0.25s both;
  }

  .info-card {
    width: 100%;
    padding: 44px 38px;
    background: rgba(6, 10, 18, 0.6);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-radius: 26px;
    border: 1px solid rgba(240, 235, 216, 0.05);
    box-shadow: 0 40px 70px -34px rgba(0, 0, 0, 0.6);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .info-card:hover {
    border-color: rgba(240, 235, 216, 0.08);
    box-shadow: 0 45px 80px -34px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(94, 156, 250, 0.04);
  }

  .info-accent-line {
    width: 38px;
    height: 1px;
    background: linear-gradient(90deg, rgba(94, 156, 250, 0.6), rgba(94, 156, 250, 0.08), transparent);
    margin-bottom: 26px;
  }

  .info-category {
    font-family: 'Source Code Pro', monospace;
    font-size: 9px;
    font-weight: 350;
    letter-spacing: 0.28em;
    color: #8a9bb5;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .info-title {
    font-family: 'Source Code Pro', monospace;
    font-size: 36px;
    font-weight: 450;
    letter-spacing: 0.02em;
    color: #f0ebd8;
    margin: 0 0 22px 0;
    line-height: 1.2;
  }

  .info-description {
    font-family: 'Source Code Pro', monospace;
    font-size: 13px;
    font-weight: 300;
    line-height: 1.68;
    color: #b8c4d4;
    margin-bottom: 34px;
    letter-spacing: 0.01em;
  }

  .info-metadata {
    margin-bottom: 30px;
    padding: 22px 0;
    border-top: 1px solid rgba(240, 235, 216, 0.04);
    border-bottom: 1px solid rgba(240, 235, 216, 0.04);
  }

  .metadata-row {
    display: flex;
    gap: 28px;
    margin-bottom: 18px;
  }

  .metadata-row:last-child { margin-bottom: 0; }

  .metadata-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .field-label {
    font-family: 'Source Code Pro', monospace;
    font-size: 7.5px;
    font-weight: 400;
    letter-spacing: 0.18em;
    color: #8a9bb5;
    text-transform: uppercase;
  }

  .field-value {
    font-family: 'Source Code Pro', monospace;
    font-size: 12px;
    font-weight: 400;
    color: #e2ded0;
    letter-spacing: 0.01em;
    word-break: break-word;
  }

  .info-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 28px;
  }

  .tag-pill {
    font-family: 'Source Code Pro', monospace;
    font-size: 8px;
    font-weight: 350;
    letter-spacing: 0.06em;
    color: #8a9bb5;
    background: rgba(138, 155, 181, 0.06);
    padding: 3px 12px;
    border-radius: 18px;
    transition: all 0.2s ease;
  }

  .tag-pill:hover {
    background: rgba(138, 155, 181, 0.14);
    color: #c8d4e4;
  }

  .info-link {
    font-family: 'Source Code Pro', monospace;
    font-size: 10px;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: #8a9bb5;
    text-decoration: none;
    padding: 7px 0 5px 0;
    border-bottom: 1px solid rgba(138, 155, 181, 0.3);
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.25s ease;
    opacity: 0.85;
  }

  .info-link:hover {
    opacity: 1;
    color: #b8c4d4;
    border-bottom-color: rgba(138, 155, 181, 0.6);
  }

  /* ================================================================ */
  /* === LIGHTBOX PREMIUM - CON RESPIRACIÓN VISUAL Y EXCEPCIONES === */
  /* ================================================================ */
  
  .lightbox-premium-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(2, 5, 10, 0.96);
    backdrop-filter: blur(36px);
    -webkit-backdrop-filter: blur(36px);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    animation: fadeIn 0.35s ease;
  }

  .lightbox-premium-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: radial-gradient(ellipse at center, rgba(94, 156, 250, 0.03) 0%, transparent 70%);
  }

  .lightbox-premium-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 26px 38px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1002;
    background: linear-gradient(to bottom, rgba(2, 5, 10, 0.65), transparent);
    pointer-events: none;
  }
  
  .lightbox-premium-header > * {
    pointer-events: auto;
  }

  .lightbox-premium-counter {
    font-family: 'Source Code Pro', monospace;
    font-size: 10px;
    font-weight: 350;
    color: #8a9bb5;
    letter-spacing: 0.12em;
    padding: 5px 14px;
    background: rgba(13, 19, 33, 0.45);
    border-radius: 20px;
    border: 1px solid rgba(138, 155, 181, 0.08);
    backdrop-filter: blur(12px);
  }

  .lightbox-premium-close {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(13, 19, 33, 0.45);
    border: 1px solid rgba(240, 235, 216, 0.08);
    color: #f0ebd8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    opacity: 0.65;
    backdrop-filter: blur(12px);
  }

  .lightbox-premium-close:hover {
    opacity: 1;
    transform: scale(1.08);
    background: rgba(13, 19, 33, 0.75);
    border-color: rgba(240, 235, 216, 0.22);
  }

  /* Contenedor principal - centrado flexible */
  .lightbox-premium-main {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 72px 96px 76px;
    z-index: 1001;
  }

  /* Canvas base - transparente y adaptable */
  .lightbox-premium-canvas {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border-radius: 12px;
    transition: all 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05);
  }

  /* ORIENTACIÓN WIDE (panorámica > 2:1) - Más contenida */
  .lightbox-premium-canvas.canvas-orientation-wide {
    max-width: 82vw;
    max-height: 70vh;
    padding: 8px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 12px;
    box-shadow: 0 25px 55px -22px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(240, 235, 216, 0.04);
  }

  /* ORIENTACIÓN LANDSCAPE (entre 1.2:1 y 2:1) - Con aire */
  .lightbox-premium-canvas.canvas-orientation-landscape {
    max-width: 80vw;
    max-height: 74vh;
    padding: 10px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 14px;
    box-shadow: 0 28px 58px -24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(240, 235, 216, 0.05);
  }

  /* ORIENTACIÓN SQUARE (entre 0.9:1 y 1.1:1) - Equilibrada */
  .lightbox-premium-canvas.canvas-orientation-square {
    max-width: min(72vw, 860px);
    max-height: 74vh;
    padding: 12px;
    background: rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    box-shadow: 0 30px 60px -25px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(240, 235, 216, 0.05);
  }

  /* ORIENTACIÓN PORTRAIT (vertical) - Contenida en ancho */
  .lightbox-premium-canvas.canvas-orientation-portrait {
    max-width: 62vw;
    max-height: 74vh;
    padding: 14px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    box-shadow: 0 32px 62px -26px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(240, 235, 216, 0.06);
  }

  /* EXCEPCIÓN: Coastal village overview (imagen panorámica muy ancha) */
  .lightbox-premium-canvas.canvas-special-wide-safe {
    max-width: 82vw;
    max-height: 68vh;
    padding: 10px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 14px;
    box-shadow: 0 28px 55px -24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(240, 235, 216, 0.05);
  }

  /* EXCEPCIÓN: ORNAMENTAL Material and atmosphere detail (vertical contenida) */
  .lightbox-premium-canvas.canvas-special-ornamental-asset {
    max-width: 56vw;
    max-height: 72vh;
    padding: 16px;
    background: rgba(0, 0, 0, 0.12);
    border-radius: 16px;
    box-shadow: 0 30px 60px -25px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(240, 235, 216, 0.06);
  }

  /* Imágenes base */
  .lightbox-premium-img {
    display: block;
    transition: opacity 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05),
                transform 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05),
                filter 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05);
  }

  .lightbox-premium-img.img-transitioning {
    opacity: 0;
    transform: scale(0.97);
    filter: blur(8px);
  }

  .lightbox-premium-img.img-loaded {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
    animation: imageFadeIn 0.5s cubic-bezier(0.2, 0.95, 0.4, 1.05);
  }

  /* Todas las imágenes usan object-fit: contain - SIN RECORTES */
  .lightbox-premium-img.img-orientation-wide,
  .lightbox-premium-img.img-orientation-landscape,
  .lightbox-premium-img.img-orientation-square,
  .lightbox-premium-img.img-orientation-portrait,
  .lightbox-premium-img.img-special-wide-safe,
  .lightbox-premium-img.img-special-ornamental-asset {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 10px;
  }

  /* Navegación */
  .lightbox-premium-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: rgba(13, 19, 33, 0.45);
    border: 1px solid rgba(240, 235, 216, 0.08);
    color: #f0ebd8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    opacity: 0.45;
    z-index: 1003;
    backdrop-filter: blur(10px);
  }

  .lightbox-premium-nav:hover:not(:disabled) {
    opacity: 1;
    background: rgba(13, 19, 33, 0.8);
    border-color: rgba(240, 235, 216, 0.22);
    transform: translateY(-50%) scale(1.1);
  }

  .lightbox-premium-nav:disabled {
    opacity: 0;
    cursor: default;
    visibility: hidden;
  }

  .lightbox-premium-prev { left: 32px; }
  .lightbox-premium-next { right: 32px; }

  /* Caption - con separación adecuada */
  .lightbox-premium-caption {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 24px;
    background: rgba(8, 13, 22, 0.75);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-radius: 28px;
    border: 1px solid rgba(240, 235, 216, 0.06);
    font-family: 'Source Code Pro', monospace;
    font-size: 11px;
    font-weight: 300;
    color: #c0cce0;
    letter-spacing: 0.05em;
    z-index: 1002;
    white-space: nowrap;
    max-width: 80vw;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: opacity 0.45s ease,
                transform 0.45s cubic-bezier(0.2, 0.95, 0.4, 1.05);
  }

  .lightbox-premium-caption.caption-transitioning {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }

  /* === RESPONSIVE - LIGHTBOX === */
  @media (max-width: 768px) {
    .lightbox-premium-main {
      padding: 56px 54px 62px;
    }
    
    .lightbox-premium-canvas.canvas-orientation-wide {
      max-width: 88vw;
      max-height: 64vh;
      padding: 6px;
    }
    
    .lightbox-premium-canvas.canvas-orientation-landscape {
      max-width: 86vw;
      max-height: 68vh;
      padding: 8px;
    }
    
    .lightbox-premium-canvas.canvas-orientation-square {
      max-width: min(78vw, 680px);
      max-height: 68vh;
      padding: 10px;
    }
    
    .lightbox-premium-canvas.canvas-orientation-portrait {
      max-width: 70vw;
      max-height: 70vh;
      padding: 12px;
    }
    
    .lightbox-premium-canvas.canvas-special-wide-safe {
      max-width: 88vw;
      max-height: 62vh;
      padding: 8px;
    }
    
    .lightbox-premium-canvas.canvas-special-ornamental-asset {
      max-width: 68vw;
      max-height: 66vh;
      padding: 12px;
    }
    
    .lightbox-premium-nav {
      width: 38px;
      height: 38px;
    }
    
    .lightbox-premium-prev { left: 16px; }
    .lightbox-premium-next { right: 16px; }
    
    .lightbox-premium-caption {
      white-space: normal;
      text-align: center;
      max-width: 88vw;
      font-size: 10px;
      bottom: 20px;
      padding: 6px 18px;
    }
    
    .lightbox-premium-header {
      padding: 18px 24px;
    }
  }

  @media (max-width: 480px) {
    .lightbox-premium-main {
      padding: 44px 36px 50px;
    }
    
    .lightbox-premium-canvas.canvas-orientation-wide {
      max-width: 92vw;
      max-height: 58vh;
      padding: 4px;
    }
    
    .lightbox-premium-canvas.canvas-orientation-landscape {
      max-width: 90vw;
      max-height: 62vh;
      padding: 6px;
    }
    
    .lightbox-premium-canvas.canvas-orientation-square {
      max-width: min(82vw, 520px);
      max-height: 64vh;
      padding: 8px;
    }
    
    .lightbox-premium-canvas.canvas-orientation-portrait {
      max-width: 76vw;
      max-height: 66vh;
      padding: 10px;
    }
    
    .lightbox-premium-canvas.canvas-special-wide-safe {
      max-width: 92vw;
      max-height: 55vh;
      padding: 6px;
    }
    
    .lightbox-premium-canvas.canvas-special-ornamental-asset {
      max-width: 74vw;
      max-height: 60vh;
      padding: 10px;
    }
    
    .lightbox-premium-nav {
      width: 34px;
      height: 34px;
    }
    
    .lightbox-premium-prev { left: 10px; }
    .lightbox-premium-next { right: 10px; }
    
    .lightbox-premium-close {
      width: 34px;
      height: 34px;
    }
    
    .lightbox-premium-counter {
      font-size: 9px;
      padding: 4px 10px;
    }
    
    .lightbox-premium-caption {
      max-width: 92vw;
      font-size: 9px;
      bottom: 16px;
      padding: 5px 14px;
    }
  }

  /* === RESPONSIVE GENERAL === */
  @media (max-width: 1200px) {
    .identity-panel {
      flex: 0 0 280px;
      padding: 50px 24px 50px 45px;
    }
    .identity-content {
      max-width: 230px;
    }
    .identity-name {
      font-size: 24px;
    }
    .identity-title {
      font-size: 7.5px;
    }
    .identity-description {
      font-size: 10.5px;
      max-width: 220px;
    }
    .projects-track {
      padding: 70px 90px 85px 60px;
    }
    .carousel-header {
      padding: 35px 50px 18px 35px;
    }
    .project-layout { flex-direction: column; overflow-y: auto; }
    .project-gallery { flex: none; height: auto; padding: 80px 30px 30px 30px; }
    .project-info { flex: none; height: auto; padding: 0 30px 60px 30px; animation: slideUp 0.6s ease 0.2s both; }
    .info-title { font-size: 32px; }
    .info-card { padding: 38px 30px; }
  }

  @media (max-width: 768px) {
    .work-container {
      flex-direction: column;
    }
    .identity-panel {
      flex: none;
      height: auto;
      min-height: auto;
      padding: 32px 28px 28px 28px;
      border-right: none;
      border-bottom: 1px solid rgba(240, 235, 216, 0.03);
      justify-content: flex-start;
      background: linear-gradient(180deg, rgba(2, 5, 10, 0.6) 0%, rgba(0, 0, 0, 0.95) 100%);
    }
    .identity-panel::before {
      display: none;
    }
    .identity-content {
      max-width: 100%;
    }
    .identity-accent {
      width: 40px;
      margin-bottom: 28px;
    }
    .identity-name {
      font-size: 24px;
      margin-bottom: 14px;
    }
    .identity-title-wrapper {
      margin-bottom: 24px;
      gap: 6px;
    }
    .identity-title {
      font-size: 7px;
    }
    .identity-title-separator {
      font-size: 7px;
    }
    .identity-description {
      font-size: 10px;
      margin-bottom: 28px;
      max-width: 100%;
    }
    .identity-divider {
      margin-bottom: 26px;
    }
    .identity-contact {
      margin-bottom: 26px;
    }
    .contact-label {
      font-size: 6.5px;
    }
    .contact-email-link {
      font-size: 10px;
    }
    .identity-social {
      gap: 14px;
    }
    .social-link {
      font-size: 7px;
    }
    .social-separator {
      font-size: 7px;
    }
    .carousel-panel {
      height: calc(100vh - auto);
      flex: 1;
    }
    .carousel-header {
      padding: 25px 25px 15px 25px;
      margin-bottom: 10px;
    }
    .carousel-label {
      font-size: 8px;
    }
    .carousel-hint {
      font-size: 7px;
    }
    .projects-track {
      gap: 20px;
      padding: 60px 80px 70px 50px;
    }
    
    .premium-card {
      box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(240, 235, 216, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.4) !important;
      transform: none !important;
      background: transparent !important;
    }
    
    .card-bloom {
      display: none !important;
    }
    
    .project-close-btn { top: 18px; right: 18px; width: 38px; height: 38px; font-size: 22px; }
    .project-gallery { padding: 65px 18px 18px 18px; animation: slideUp 0.5s ease 0.1s both; }
    .project-info { padding: 0 18px 40px 18px; animation: slideUp 0.5s ease 0.15s both; }
    .gallery-grid { grid-template-columns: 1fr; gap: 14px; }
    .info-title { font-size: 26px; }
    .info-card { padding: 28px 22px; border-radius: 22px; }
    .info-description { font-size: 12px; line-height: 1.6; margin-bottom: 28px; }
    .metadata-row { flex-direction: column; gap: 14px; }
    .field-value { font-size: 11px; }
  }

  @media (max-width: 480px) {
    .identity-panel {
      padding: 24px 20px 20px 20px;
    }
    .identity-accent {
      width: 36px;
      margin-bottom: 22px;
    }
    .identity-name {
      font-size: 22px;
      margin-bottom: 12px;
    }
    .identity-title-wrapper {
      margin-bottom: 20px;
      gap: 5px;
    }
    .identity-title {
      font-size: 6.5px;
      letter-spacing: 0.14em;
    }
    .identity-title-separator {
      font-size: 6.5px;
    }
    .identity-description {
      font-size: 9px;
      line-height: 1.6;
      margin-bottom: 22px;
    }
    .identity-divider {
      margin-bottom: 22px;
    }
    .identity-contact {
      margin-bottom: 22px;
    }
    .contact-block {
      gap: 7px;
    }
    .contact-label {
      font-size: 6px;
    }
    .contact-email-link {
      font-size: 9px;
    }
    .identity-social {
      gap: 12px;
    }
    .social-link {
      font-size: 6.5px;
      letter-spacing: 0.15em;
    }
    .social-separator {
      font-size: 6.5px;
    }
    .carousel-header {
      padding: 20px 18px 12px 18px;
    }
    .projects-track {
      gap: 16px;
      padding: 50px 60px 55px 40px;
    }
    .info-title { font-size: 22px; }
    .info-card { padding: 24px 18px; border-radius: 18px; }
    .info-description { font-size: 11px; }
    .field-value { font-size: 10px; }
  }
  
  @media (pointer: coarse) {
    .premium-card {
      box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(240, 235, 216, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.4) !important;
      transform: none !important;
      background: transparent !important;
    }
    
    .card-bloom {
      display: none !important;
    }
    
    .gallery-hero:hover,
    .grid-item:hover {
      transform: none !important;
    }
    
    .gallery-hero:hover .hero-hint,
    .grid-item:hover .grid-hint,
    .grid-item:hover .grid-overlay {
      opacity: 0 !important;
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    .premium-card {
      transform: none !important;
      background: transparent !important;
      box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(240, 235, 216, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.4) !important;
    }
    
    .card-bloom {
      display: none !important;
    }
  }
`;

document.head.appendChild(styleSheet);