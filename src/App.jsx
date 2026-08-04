// App.jsx - TECHNICAL ENVIRONMENT ARTIST PORTFOLIO
// Enterprise-grade portfolio with technical breakdowns, metrics, R&D, and pipeline documentation

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'

const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DRAG_THRESHOLD = 6

// ─── IMAGE LIGHTBOX ───────────────────────────────────
const ImageLightbox = memo(({ images, currentIndex, onClose, onPrev, onNext, isMobile, projectId, mode = 'contain' }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [orientationClass, setOrientationClass] = useState('orientation-landscape')
  const prevIndexRef = useRef(currentIndex)
  const imageKeyRef = useRef(currentIndex)
  
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      setTransitioning(true)
      setImageLoaded(false)
      setOrientationClass('orientation-landscape')
      imageKeyRef.current = currentIndex
      const timer = setTimeout(() => setTransitioning(false), 60)
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
  
  const handleImageLoad = (e) => {
    const img = e.target
    const ratio = img.naturalWidth / img.naturalHeight
    if (ratio >= 2.0) setOrientationClass('orientation-wide')
    else if (ratio >= 1.2) setOrientationClass('orientation-landscape')
    else if (ratio >= 0.9 && ratio <= 1.1) setOrientationClass('orientation-square')
    else setOrientationClass('orientation-portrait')
    setImageLoaded(true)
  }
  
  const getCanvasClassName = () => `lightbox-premium-canvas canvas-${orientationClass} canvas-mode-${mode}`
  const getImageClassName = () => `lightbox-premium-img img-${orientationClass} img-mode-${mode} ${transitioning ? 'img-transitioning' : ''} ${imageLoaded ? 'img-loaded' : ''}`

  const isVideo = currentImage.src && (currentImage.src.endsWith('.mp4') || currentImage.src.endsWith('.webm'))

  return (
    <div className="lightbox-premium-container" onClick={onClose}>
      <div className="lightbox-premium-bg" />
      <div className="lightbox-premium-header">
        <span className="lightbox-premium-counter">{currentIndex + 1} / {images.length}</span>
        <button className="lightbox-premium-close" style={{ border: "none", background: "transparent" }} onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <img src="/Exit Work.png" alt="Close" style={{ width: "32px", height: "32px", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: "0.8", transition: "transform 0.3s ease, opacity 0.3s ease" }} />
        </button>
      </div>
      <div className="lightbox-premium-main" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-premium-nav lightbox-premium-prev" onClick={onPrev} disabled={images.length <= 1}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className={getCanvasClassName()}>
          {isVideo ? (
            <video key={imageKeyRef.current} src={currentImage.src} autoPlay loop muted playsInline className={getImageClassName()} onLoadedData={() => setImageLoaded(true)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <img key={imageKeyRef.current} src={currentImage.src} alt={currentCaption || `Image ${currentIndex + 1}`} className={getImageClassName()} onLoad={handleImageLoad} />
          )}
        </div>
        <button className="lightbox-premium-nav lightbox-premium-next" onClick={onNext} disabled={images.length <= 1}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
      {currentCaption && (
        <div className={`lightbox-premium-caption ${transitioning ? 'caption-transitioning' : ''}`}><span>{currentCaption}</span></div>
      )}
    </div>
  )
})
ImageLightbox.displayName = 'ImageLightbox'

// ─── PROJECT CARD ────────────────────────────────────
const ProjectCard = memo(({ project, isHovered, onMouseEnter, onMouseMove, onMouseLeave, onClick, imageOffset, tilt, isFocused }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [sweepActive, setSweepActive] = useState(false)
  const [sweepOrigin, setSweepOrigin] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)
  const mouseDownPos = useRef({ x: 0, y: 0 })
  const hasMovedRef = useRef(false)
  const isTouchDevice = useRef(isMobile || ('ontouchstart' in window)).current
  const enableEffects = !prefersReducedMotion && !isTouchDevice && !isFocused

  const handleMouseDown = useCallback((e) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
    hasMovedRef.current = false
  }, [])

  const handleClick = useCallback((e) => {
    if (hasMovedRef.current) return
    if (enableEffects && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setSweepOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setSweepActive(true)
    }
    setTimeout(() => setSweepActive(false), 550)
    onClick(e)
  }, [onClick, enableEffects])

  const getTransform = () => {
    if (!enableEffects) return 'none'
    if (tilt && isHovered && !isFocused) return `perspective(1000px) rotateX(${tilt.rotateX * 0.8}deg) rotateY(${tilt.rotateY * 0.8}deg) translateY(-16px) scale(1.045)`
    return 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)'
  }

  const getImageTransform = () => {
    if (!enableEffects) return 'translate(0, 0) scale(1)'
    if (imageOffset && isHovered && !isFocused) return `translate(${imageOffset.x * 0.85}px, ${imageOffset.y * 0.6}px) scale(1.14)`
    return 'translate(0, 0) scale(1)'
  }

  return (
    <div className="project-card-shell">
      <div className="card-bloom" style={{ opacity: isHovered && !isFocused && enableEffects ? 0.8 : 0 }} />
      <div ref={cardRef} className={`premium-card ${isHovered && !isFocused ? 'hovered' : ''} ${isFocused ? 'dimmed' : ''}`} style={{ transform: getTransform() }}
        onMouseEnter={() => !isFocused && !isTouchDevice && onMouseEnter()} onMouseMove={onMouseMove} onMouseDown={handleMouseDown}
        onMouseLeave={() => { !isTouchDevice && !isFocused && onMouseLeave(); mouseDownPos.current = { x: 0, y: 0 } }} onClick={handleClick}>
        {sweepActive && enableEffects && (<div className="sweep-container"><div className="sweep-line" style={{ '--sweep-y': `${sweepOrigin.y}px` }} /></div>)}
        <div className="card-border-glow" style={{ opacity: isHovered && !isFocused ? 1 : 0 }} />
        <div className="card-top-line" style={{ opacity: isHovered && !isFocused ? 0.7 : 0 }} />
        <div className="card-image-container">
          <div className="card-image-parallax" style={{ transform: getImageTransform(), opacity: imageLoaded ? 1 : 0 }}>
            <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" onLoad={() => setImageLoaded(true)} />
          </div>
          <div className="card-overlay">
            <div className="card-accent-line" style={{ width: isHovered && !isFocused && enableEffects ? '52px' : '0px' }} />
            <h3 className="card-title">{project.title}</h3>
            <p className="card-category">{project.category}</p>
            <div className="card-tech-indicators" style={{ opacity: isHovered && enableEffects ? 0.7 : 0 }}>
              {project.techMetrics?.polyCount && (<span className="tech-indicator">{project.techMetrics.polyCount}</span>)}
              {project.techMetrics?.drawCalls && (<span className="tech-indicator">{project.techMetrics.drawCalls}</span>)}
              <span className="tech-indicator">60 FPS</span>
            </div>
            <div className="card-open-hint">OPEN PROJECT</div>
          </div>
        </div>
        <div className="card-info-panel">
          <p className="card-description">{project.extendedDescription || project.description}</p>
          <div className="card-tags">{project.tags.slice(0, 3).map((tag, idx) => (<span key={idx} className="card-tag">{tag}</span>))}</div>
          <div className="card-meta"><span>{project.year}</span><span className="meta-sep">·</span><span>{project.client}</span></div>
        </div>
      </div>
    </div>
  )
})
ProjectCard.displayName = 'ProjectCard'

// ─── TECHNICAL BREAKDOWN ─────────────────────────────
const TechnicalBreakdown = memo(({ project }) => {
  if (!project.techMetrics) return null
  return (
    <div className="technical-breakdown">
      <div className="tech-header"><div className="tech-accent-line" /><h3 className="tech-title">TECHNICAL BREAKDOWN</h3><span className="tech-badge">PERFORMANCE</span></div>
      <div className="metrics-grid">
        {project.techMetrics.polyCount && (<div className="metric-item"><span className="metric-value">{project.techMetrics.polyCount}</span><span className="metric-label">Poly Count</span></div>)}
        {project.techMetrics.drawCalls && (<div className="metric-item"><span className="metric-value">{project.techMetrics.drawCalls}</span><span className="metric-label">Draw Calls</span></div>)}
        {project.techMetrics.textureMemory && (<div className="metric-item"><span className="metric-value">{project.techMetrics.textureMemory}</span><span className="metric-label">Texture Memory</span></div>)}
        <div className="metric-item metric-target"><span className="metric-value cyan">60</span><span className="metric-label">Target FPS</span></div>
      </div>
      {project.techMetrics.lodStrategy && (<div className="tech-section"><span className="tech-section-label">LOD STRATEGY</span><p className="tech-section-text">{project.techMetrics.lodStrategy}</p></div>)}
      {project.techMetrics.customShaders && (<div className="tech-section"><span className="tech-section-label">CUSTOM SHADERS</span><p className="tech-section-text">{project.techMetrics.customShaders}</p></div>)}
      {project.techMetrics.pipelineTools && (<div className="tech-section"><span className="tech-section-label">PIPELINE TOOLS</span><div className="pipeline-tools-list">{project.techMetrics.pipelineTools.split(', ').map((tool, i) => (<span key={i} className="pipeline-tool-tag">{tool}</span>))}</div></div>)}
    </div>
  )
})
TechnicalBreakdown.displayName = 'TechnicalBreakdown'

// ─── R&D SHOWCASE ────────────────────────────────────
const RDShowcase = memo(({ onClose }) => {
  const [activeTab, setActiveTab] = useState('scripts')
  const rdData = {
    scripts: [
      { title: 'Blender \u2194 UE5 Asset Bridge', desc: 'Bidirectional sync system with TCP socket communication protocol. Transfers meshes, materials, and level layouts incrementally without intermediate files, preserving LODs and Material Instance references.', lang: 'Python + Blender API + UE5 API' },
      { title: 'Biome Scatter & Assembly Toolkit', desc: 'Procedural population system with ecological rules, natural clustering of modular assets, and automatic visual variation generation by altitude. HISM/ISM compatible.', lang: 'Python + UE5 PCG' },
      { title: 'Universal Trim & Atlas Shader System', desc: 'Single master shader for complete modular environments with trim sheets, texture atlases, and vertex mask blending. Reduces draw calls while maintaining visual consistency in massive scenes without sacrificing variation.', lang: 'HLSL + Material Functions + Virtual Textures' }
    ],
    shaders: [
      { title: 'Triplanar Mapping Master', desc: 'Optimized triplanar mapping shader for world-space textures without UV seams.', lang: 'Shader Graph / HLSL', impact: 'Zero UV setup for world-aligned assets' },
      { title: 'Wetness & Weather System', desc: 'Parametric material system that simulates wet surfaces, puddles, and atmospheric aging.', lang: 'Material Functions UE5', impact: 'Used in 3+ projects' }
    ]
  }
  return (
    <div className="rd-showcase">
      <div className="rd-overlay" />
      <button className="rd-close-btn" style={{ border: "none", background: "transparent" }} onClick={onClose}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
      <div className="rd-content">
        <div className="rd-header"><div className="rd-accent" /><h2 className="rd-title">TOOLS & RESEARCH</h2><p className="rd-subtitle">Custom tools, scripts, and shader development</p></div>
        <div className="rd-tabs">
          {Object.keys(rdData).map(tab => (<button key={tab} className={`rd-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab === 'scripts' ? 'SCRIPTS' : 'SHADERS'}</button>))}
        </div>
        <div className="rd-grid">
          {rdData[activeTab].map((item, idx) => (
            <div key={idx} className="rd-card" style={{ animationDelay: `${idx * 0.12}s` }}>
              <div className="rd-card-header"><span className="rd-lang-tag">{item.lang}</span>{item.impact && <span className="rd-impact-badge">{item.impact}</span>}</div>
              <h3 className="rd-card-title">{item.title}</h3>
              <p className="rd-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
RDShowcase.displayName = 'RDShowcase'

// ─── APP ─────────────────────────────────────────────
export default function App() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [focusedCard, setFocusedCard] = useState(null)
  const [focusTransitioning, setFocusTransitioning] = useState(false)
  const [activeView, setActiveView] = useState('artistic')
  const [rdOpen, setRdOpen] = useState(false)
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
    if (focusedCard.additionalImages) focusedCard.additionalImages.forEach(img => images.push({ src: img.src, caption: img.caption }))
    return images
  }, [focusedCard])

  const openLightbox = useCallback((index) => { setLightboxIndex(index); setLightboxOpen(true) }, [])
  const closeLightbox = useCallback(() => setLightboxOpen(false), [])
  const nextImage = useCallback(() => { const images = getLightboxImages(); setLightboxIndex(prev => (prev + 1) % images.length) }, [getLightboxImages])
  const prevImage = useCallback(() => { const images = getLightboxImages(); setLightboxIndex(prev => (prev - 1 + images.length) % images.length) }, [getLightboxImages])

  const handleMouseDown = useCallback((e) => {
    if (focusedCard || lightboxOpen || !scrollContainerRef.current) return
    isDraggingRef.current = true
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft
    lastXRef.current = e.pageX; lastTimeRef.current = performance.now(); velocityRef.current = 0
    scrollContainerRef.current.style.cursor = 'grabbing'; scrollContainerRef.current.style.userSelect = 'none'
  }, [focusedCard, lightboxOpen])

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !scrollContainerRef.current || focusedCard || lightboxOpen) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startXRef.current) * 1.2
    const now = performance.now(); const dt = Math.max(16, now - lastTimeRef.current)
    velocityRef.current = velocityRef.current * 0.6 + ((e.pageX - lastXRef.current) / dt * 12) * 0.4
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk
    lastXRef.current = e.pageX; lastTimeRef.current = now
  }, [focusedCard, lightboxOpen])

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    if (scrollContainerRef.current) { scrollContainerRef.current.style.cursor = 'grab'; scrollContainerRef.current.style.userSelect = 'auto' }
    const applyInertia = () => {
      if (!scrollContainerRef.current || focusedCard || lightboxOpen) return
      velocityRef.current *= 0.96
      if (Math.abs(velocityRef.current) > 0.3) { scrollContainerRef.current.scrollLeft -= velocityRef.current * 2.5; animationFrameRef.current = requestAnimationFrame(applyInertia) }
      else animationFrameRef.current = null
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = requestAnimationFrame(applyInertia)
  }, [focusedCard, lightboxOpen])

  const handleCardMouseMove = useCallback((cardId, e) => {
    if (focusedCard || isMobile || prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5
    setCardImageOffsets(prev => ({ ...prev, [cardId]: { x: mouseX * 32, y: mouseY * 18 } }))
    setCardTilt(prev => ({ ...prev, [cardId]: { rotateX: mouseY * 8, rotateY: mouseX * 8 } }))
  }, [focusedCard])

  const handleCardMouseLeave = useCallback((cardId) => {
    if (focusedCard) return
    setCardImageOffsets(prev => { const s = { ...prev }; delete s[cardId]; return s })
    setCardTilt(prev => { const s = { ...prev }; delete s[cardId]; return s })
    setHoveredCard(null)
  }, [focusedCard])

  const handleCardClick = useCallback((project) => {
    if (focusTransitioning || focusedCard) return
    setFocusTransitioning(true); setFocusedCard(project); setHoveredCard(null); setCardImageOffsets({}); setCardTilt({}); setActiveView('artistic')
    setTimeout(() => setFocusTransitioning(false), 500)
  }, [focusTransitioning, focusedCard])

  const closeFocusedCard = useCallback(() => {
    if (focusTransitioning) return
    setFocusTransitioning(true); setFocusedCard(null)
    setTimeout(() => setFocusTransitioning(false), 500)
  }, [focusTransitioning])

  const projects = useMemo(() => [
    { id: 1, title: "NO DAYS OFF", category: "ENVIRONMENT / REAL-TIME", image: "/1.jpg", description: "Gameplay-driven coastal village environment focused on spatial readability, navigation flow, and in-engine performance validation.", extendedDescription: "Coastal stilt-village environment with gameplay-first approach.", fullDescription: "Coastal stilt-village environment designed with a gameplay-first approach. Focused on spatial readability, organic navigation, and functional layout. Each structure operates as a gameplay node, supporting exploration, cover, and interaction. Tested in-engine for scale, sightlines, LOD transitions, draw calls, and stable framerate performance.", tags: ["ENVIRONMENT", "LEVEL DESIGN", "REAL-TIME"], year: "2026", client: "Personal Project", role: "Environment Artist", software: ["Unreal Engine", "Blender"], has3DContent: true, techMetrics: { polyCount: "~850K tris", drawCalls: "45 avg", textureMemory: "2.1 GB", lodStrategy: "3 LOD levels per asset. LOD0 100%, LOD1 50%, LOD2 25% poly reduction. Billboard impostors for distant trees.", customShaders: "Custom vertex painting shader for cliff/rock blending. Distance-based detail normal fading. Optimized triplanar for terrain.", pipelineTools: "Blender, UE5, Substance Painter" }, additionalImages: [{ id: 1, src: "/anim.mp4", caption: "Coastal village - Animation preview" }, { id: 2, src: "/2.jpg", caption: "Coastal village overview" }, { id: 3, src: "/3.jpg", caption: "Gameplay node layout" }, { id: 4, src: "/4.jpg", caption: "In-engine performance test" }], videos: ["/mochila.webm"] },
    { id: 2, title: "COMMERCIAL KITCHEN", category: "ENVIRONMENT / REAL-TIME", image: "/5.jpg", description: "Industrial kitchen environment prepared for Unreal Engine with clean topology, PBR workflow, and optimized real-time performance.", extendedDescription: "Industrial Kitchen prepared for Unreal Engine.", fullDescription: "Industrial Kitchen prepared for Unreal Engine. Modeled with clean topology and optimized geometry, materials follow a PBR workflow. Lighting is configured for real-time playback and 360 walkthroughs.", tags: ["ENVIRONMENT", "PBR", "REAL-TIME", "KITCHEN"], year: "2025", client: "Spittia Solution", role: "Environment Artist", software: ["Unreal Engine", "Blender"], has3DContent: true, projectUrl: "https://bosco45.github.io/spittiaSolution/", techMetrics: { polyCount: "~420K tris", drawCalls: "32 avg", textureMemory: "1.8 GB", lodStrategy: "2 LOD levels for hero props. Automatic LOD generation via UE5. Combined static mesh actors.", customShaders: "PBR master material with roughness/metallic optimization. Light function for fake caustics.", pipelineTools: "Blender, UE5, Substance Painter" }, additionalImages: [{ id: 1, src: "/8.jpg", caption: "360 walkthrough view" }, { id: 2, src: "/7.jpg", caption: "Kitchen detail - Counter and appliances" }, { id: 3, src: "/6.jpg", caption: "Kitchen detail - Sink and storage" }] },
    { id: 3, title: "ARCHITECTURAL RESIDENCE", category: "ENVIRONMENT / ARCHITECTURE", image: "/10.jpg", description: "High-end architectural environment developed entirely in Blender with premium residential aesthetic and cinematic composition.", extendedDescription: "A polished architectural environment built around strong silhouette language.", fullDescription: "High-end architectural environment developed entirely in Blender, with strong emphasis on visual clarity, material fidelity, and cinematic composition. Designed around strong silhouette language and clean spatial hierarchy.", tags: ["ARCHITECTURE", "BLENDER", "LIGHTING", "PBR"], year: "2025", client: "Personal Project", role: "3D Environment Artist", software: ["Blender"], has3DContent: false, techMetrics: { polyCount: "~680K tris", drawCalls: "N/A (offline)", textureMemory: "3.2 GB", lodStrategy: "Not applicable (offline render). Scene organized in render layers for compositing.", customShaders: "Custom architectural glass shader with dual-layer refraction. Procedural weathering node group.", pipelineTools: "Blender, Cycles, Photoshop" }, additionalImages: [{ id: 1, src: "/12.jpg", caption: "Material detail - Wood and stone textures" }, { id: 2, src: "/11.jpg", caption: "Exterior view - Premium residential aesthetic" }] },
    { id: 4, title: "ORNAMENTAL", category: "ENVIRONMENT / LIGHTING", image: "/20.jpg", description: "Cinematic lighting study focused on a traditional street lamp within a rain-soaked urban scene.", extendedDescription: "A focused environment study built around a traditional street lamp.", fullDescription: "Cinematic lighting study built around a traditional street lamp as the main focal point within a rain-soaked urban scene. Special attention to wet surfaces, reflections, and material response under low-light conditions.", tags: ["ENVIRONMENT", "LIGHTING", "MOOD", "ATMOSPHERIC"], year: "2024", client: "IMPORLED", role: "Environment Artist", software: [], has3DContent: false, techMetrics: { polyCount: "~180K tris", drawCalls: "N/A (offline)", textureMemory: "1.1 GB", lodStrategy: "Not applicable (offline render).", customShaders: "Custom rain droplet shader. Animated wetness map with time-based drying simulation.", pipelineTools: "Blender, Cycles, Substance Painter" }, additionalImages: [{ id: 1, src: "/21.jpg", caption: "Secondary environment angle" }, { id: 2, src: "/22.jpg", caption: "Material and atmosphere detail" }] }
  ], [])

  useEffect(() => { return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current) } }, [])

  return (
    <>
      {lightboxOpen && focusedCard && (<ImageLightbox images={getLightboxImages()} currentIndex={lightboxIndex} onClose={closeLightbox} onPrev={prevImage} onNext={nextImage} isMobile={isMobile} projectId={focusedCard.id} />)}
      {rdOpen && <RDShowcase onClose={() => setRdOpen(false)} />}
      <div className={`work-container ${focusedCard ? 'has-focus' : ''}`}>
        <div className="identity-panel">
          <div className="identity-content">
            <div className="identity-accent" />
            <h1 className="identity-name">Annya Fraysheht</h1>
            <div className="identity-title-wrapper"><span className="identity-title">Technical Environment Artist</span><span className="identity-title-separator">·</span><span className="identity-title">Real-Time</span></div>
            <div className="tech-stack"><span className="stack-label">TECH STACK</span><div className="stack-tags"><span className="stack-tag">Unreal Engine 5</span><span className="stack-tag">Blender</span><span className="stack-tag">Substance</span><span className="stack-tag">LOD Optimization</span></div></div>
            <p className="identity-description">3D Artist specializing in production-ready real-time environments, with a strong focus on clean topology, scalable asset pipelines, performance optimization, and refined visual execution.</p>
            <div className="identity-divider" />
            <div className="identity-contact"><div className="contact-block"><span className="contact-label">CONTACT</span><a href="mailto:annya.frayshehtd@gmail.com" className="contact-email-link">annya.frayshehtd@gmail.com</a></div></div>
            <div className="identity-social"><a href="https://www.instagram.com/trinity3d.360/" target="_blank" rel="noopener noreferrer" className="social-link">INSTAGRAM</a><span className="social-separator">/</span><a href="https://www.linkedin.com/in/annya-fraysheht/" target="_blank" rel="noopener noreferrer" className="social-link">LINKEDIN</a></div>
            <button className="rd-button" onClick={() => setRdOpen(true)}><span className="rd-button-text">TOOLS & RESEARCH</span></button>
          </div>
        </div>
        <div className="carousel-panel">
          <div className="carousel-header"><span className="carousel-label">SELECTED WORK</span><span className="carousel-hint">DRAG</span></div>
          <div ref={scrollContainerRef} className={`carousel-scroll ${focusedCard ? 'carousel-blurred' : ''}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div className="projects-track">
              {projects.map((project) => (<ProjectCard key={project.id} project={project} isHovered={hoveredCard === project.id} onMouseEnter={() => !focusedCard && !isMobile && setHoveredCard(project.id)} onMouseMove={(e) => handleCardMouseMove(project.id, e)} onMouseLeave={() => handleCardMouseLeave(project.id)} onClick={() => handleCardClick(project)} imageOffset={cardImageOffsets[project.id]} tilt={cardTilt[project.id]} isFocused={!!focusedCard} />))}
            </div>
          </div>
        </div>
      </div>
      {focusedCard && (
        <div className="project-master-view">
          <div className="project-overlay" />
          <button className="project-close-btn" style={{ border: "none", background: "transparent" }} onClick={closeFocusedCard}><img src="/Exit Work.png" alt="Close" style={{ width: "40px", height: "40px", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: "0.8", transition: "transform 0.3s ease, opacity 0.3s ease" }} /></button>
          <div className="project-layout">
            <div className="project-gallery">
              <div className="gallery-hero hero-cover-mode" onClick={() => openLightbox(0)}><div className="hero-image-wrapper"><img src={focusedCard.image} alt={focusedCard.title} className="hero-img img-cover" /></div><div className="hero-hint">VIEW</div></div>
              <div className="gallery-grid">
                {focusedCard.additionalImages?.map((img, idx) => {
                  const isVideo = img.src && (img.src.endsWith('.mp4') || img.src.endsWith('.webm'))
                  return (<div key={img.id} className="grid-item grid-cover-mode" onClick={() => openLightbox(idx + 1)} style={{ animationDelay: `${idx * 0.12}s` }}><div className="grid-image-wrapper">{isVideo ? (<video src={img.src} autoPlay loop muted playsInline className="grid-img img-cover" />) : (<img src={img.src} alt={img.caption} className="grid-img img-cover" />)}</div><div className="grid-overlay"><span>{img.caption}</span></div><div className="grid-hint">VIEW</div></div>)
                })}
              </div>
              {focusedCard.videos?.length > 0 && (<div className="gallery-video"><div className="video-container"><video src={focusedCard.videos[0]} autoPlay loop muted playsInline preload="auto" className="video-player" /></div></div>)}
            </div>
            <div className="project-info">
              <div className="info-card">
                <div className="view-toggle"><button className={`toggle-btn ${activeView === 'artistic' ? 'active' : ''}`} onClick={() => setActiveView('artistic')}>ARTISTIC</button><button className={`toggle-btn ${activeView === 'technical' ? 'active' : ''}`} onClick={() => setActiveView('technical')}>TECHNICAL</button></div>
                {activeView === 'artistic' ? (<>
                  <div className="info-accent-line" /><div className="info-category">{focusedCard.category}</div><h1 className="info-title">{focusedCard.title}</h1><p className="info-description">{focusedCard.fullDescription}</p>
                  <div className="info-metadata">
                    <div className="metadata-row"><div className="metadata-field"><span className="field-label">CLIENT</span><span className="field-value">{focusedCard.client}</span></div><div className="metadata-field"><span className="field-label">YEAR</span><span className="field-value">{focusedCard.year}</span></div></div>
                    <div className="metadata-row"><div className="metadata-field"><span className="field-label">ROLE</span><span className="field-value">{focusedCard.role}</span></div><div className="metadata-field"><span className="field-label">SOFTWARE</span><span className="field-value">{focusedCard.software?.length > 0 ? focusedCard.software.join(', ') : '\u2014'}</span></div></div>
                  </div>
                  <div className="info-tags">{focusedCard.tags.map((tag, idx) => (<span key={idx} className="tag-pill">{tag}</span>))}</div>
                </>) : (<TechnicalBreakdown project={focusedCard} />)}
                {focusedCard.projectUrl && (<a href={focusedCard.projectUrl} target="_blank" rel="noopener noreferrer" className="info-link">VIEW PROJECT</a>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── STYLES ──────────────────────────────────────────
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes imageFadeIn { from { opacity: 0; transform: scale(1.03); filter: blur(10px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
  @keyframes sweepAcross { 0% { transform: translateY(var(--sweep-y, 0px)) translateX(-100%); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(var(--sweep-y, 0px)) translateX(100%); opacity: 0; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Source Code Pro', 'SF Mono', monospace; background: #06090f; overflow: hidden; -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent; color: #c8d4e4; }
  body.lightbox-open { overflow: hidden; }
  .work-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; background: #06090f; transition: opacity 0.4s ease; }
  .identity-panel { flex: 0 0 340px; height: 100vh; display: flex; align-items: center; justify-content: flex-end; padding: 50px 28px 50px 55px; border-right: 1px solid rgba(255,255,255,0.04); background: #080c14; position: relative; overflow-y: auto; }
  .identity-content { max-width: 275px; width: 100%; position: relative; z-index: 2; }
  .identity-accent { width: 48px; height: 2px; background: #5e9cfa; margin-bottom: 36px; }
  .identity-name { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; color: #e8e4d8; margin: 0 0 12px 0; line-height: 1.1; }
  .identity-title-wrapper { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; margin-bottom: 20px; }
  .identity-title { font-size: 10px; font-weight: 500; letter-spacing: 0.2em; color: #5e9cfa; text-transform: uppercase; }
  .identity-title-separator { font-size: 10px; font-weight: 300; color: rgba(94,156,250,0.35); }
  .tech-stack { margin-bottom: 22px; }
  .stack-label { font-size: 8px; font-weight: 600; letter-spacing: 0.25em; color: #6b7d95; text-transform: uppercase; display: block; margin-bottom: 10px; }
  .stack-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .stack-tag { font-size: 9px; font-weight: 500; letter-spacing: 0.04em; color: #7eb8ff; background: rgba(94,156,250,0.08); padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(94,156,250,0.12); }
  .identity-description { font-size: 11px; font-weight: 400; line-height: 1.7; color: #8a9bb5; margin-bottom: 30px; max-width: 240px; }
  .identity-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.05); margin-bottom: 28px; }
  .identity-contact { margin-bottom: 28px; }
  .contact-block { display: flex; flex-direction: column; gap: 8px; }
  .contact-label { font-size: 8px; font-weight: 600; letter-spacing: 0.25em; color: #5e9cfa; opacity: 0.7; text-transform: uppercase; }
  .contact-email-link { font-size: 11px; font-weight: 400; color: #c8d4e4; text-decoration: none; transition: color 0.3s; word-break: break-word; border-bottom: 1px solid rgba(94,156,250,0.2); padding-bottom: 3px; }
  .contact-email-link:hover { color: #ffffff; border-bottom-color: rgba(94,156,250,0.5); }
  .identity-social { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 24px; }
  .social-link { font-size: 9px; font-weight: 500; letter-spacing: 0.18em; color: #6b7d95; text-decoration: none; transition: color 0.3s; }
  .social-link:hover { color: #c8d4e4; }
  .social-separator { font-size: 9px; color: rgba(94,156,250,0.3); }
  .rd-button { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 16px; background: rgba(94,156,250,0.06); border: 1px solid rgba(94,156,250,0.15); border-radius: 8px; cursor: pointer; transition: all 0.3s; color: #7eb8ff; font-family: inherit; }
  .rd-button:hover { background: rgba(94,156,250,0.12); border-color: rgba(94,156,250,0.3); color: #ffffff; }
  .rd-button-text { font-size: 11px; font-weight: 600; letter-spacing: 0.15em; }
  .carousel-panel { flex: 1; height: 100vh; overflow: hidden; position: relative; display: flex; flex-direction: column; }
  .carousel-header { padding: 40px 60px 20px 40px; display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px; }
  .carousel-label { font-size: 11px; font-weight: 600; letter-spacing: 0.25em; color: #6b7d95; text-transform: uppercase; }
  .carousel-hint { font-size: 9px; font-weight: 400; color: #6b7d95; opacity: 0.5; }
  .carousel-scroll { flex: 1; width: 100%; display: flex; align-items: center; overflow-x: auto; overflow-y: visible; cursor: grab; transition: filter 0.4s; scrollbar-width: none; -ms-overflow-style: none; }
  .carousel-scroll::-webkit-scrollbar { display: none; }
  .carousel-scroll.carousel-blurred { filter: blur(8px); }
  .projects-track { display: flex; gap: 28px; align-items: center; padding: 80px 120px 100px 80px; }
  .project-card-shell { position: relative; flex: 0 0 auto; width: 360px; overflow: visible; isolation: isolate; z-index: 10; }
  .card-bloom { position: absolute; top: 50%; left: 50%; width: calc(100% + 240px); height: calc(100% + 220px); transform: translate(-50%, -50%) scale(0.92); background: radial-gradient(ellipse at center, rgba(94,156,250,0.7) 0%, rgba(94,156,250,0.3) 28%, transparent 82%); border-radius: 50%; filter: blur(70px); transition: opacity 0.45s; pointer-events: none; z-index: 0; mix-blend-mode: screen; }
  .premium-card { position: relative; border-radius: 16px; cursor: pointer; transition: transform 0.45s cubic-bezier(0.2,0.95,0.4,1.05), box-shadow 0.45s; box-shadow: 0 18px 35px -16px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04); z-index: 2; background: rgba(8,12,20,0.5); }
  .premium-card.hovered { box-shadow: 0 40px 65px -28px rgba(0,0,0,0.8), 0 0 0 1px rgba(94,156,250,0.25); }
  .premium-card.dimmed { opacity: 0.3; filter: brightness(0.4) saturate(0.3); }
  .card-border-glow { position: absolute; inset: -2px; border-radius: 18px; padding: 2px; background: linear-gradient(145deg, rgba(94,156,250,0.45), rgba(255,255,255,0.2) 30%, rgba(94,156,250,0.15) 60%, rgba(255,255,255,0.08) 85%, rgba(94,156,250,0.35)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; z-index: 2; transition: opacity 0.35s; }
  .card-top-line { position: absolute; top: -1px; left: 12px; right: 12px; height: 1px; background: linear-gradient(90deg, transparent, rgba(94,156,250,0.5), rgba(255,255,255,0.3), rgba(94,156,250,0.5), transparent); pointer-events: none; z-index: 3; transition: opacity 0.3s; }
  .card-image-container { width: 100%; aspect-ratio: 4/3; border-radius: 16px; overflow: hidden; position: relative; background: #0a0a0a; }
  .card-image-parallax { width: 100%; height: 100%; transition: transform 0.45s cubic-bezier(0.2,0.95,0.4,1.05); }
  .card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 28px 18px 16px; background: linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.45) 55%, transparent 100%); z-index: 3; }
  .card-accent-line { height: 1px; background: #5e9cfa; margin-bottom: 10px; transition: width 0.45s; }
  .card-title { font-weight: 600; font-size: 15px; letter-spacing: 0.06em; color: #ffffff; margin: 0 0 4px 0; text-shadow: 0 3px 8px rgba(0,0,0,0.7); }
  .card-category { font-weight: 400; font-size: 8px; letter-spacing: 0.25em; color: #5e9cfa; margin: 0; text-transform: uppercase; }
  .card-tech-indicators { display: flex; gap: 6px; margin-top: 10px; transition: opacity 0.3s; }
  .tech-indicator { font-size: 7px; font-weight: 500; letter-spacing: 0.06em; color: #7eb8ff; background: rgba(94,156,250,0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(94,156,250,0.15); }
  .card-open-hint { font-size: 8px; font-weight: 500; letter-spacing: 0.2em; color: #ffffff; margin-top: 10px; opacity: 0; transform: translateY(8px); transition: opacity 0.35s 0.1s, transform 0.35s 0.1s; }
  .premium-card.hovered .card-open-hint { opacity: 0.8; transform: translateY(0); }
  .card-info-panel { position: absolute; bottom: -14px; left: 14px; right: 14px; background: rgba(8,14,24,0.98); backdrop-filter: blur(24px); border-radius: 14px; padding: 16px 18px; opacity: 0; transform: translateY(20px) scale(0.96); pointer-events: none; transition: opacity 0.35s, transform 0.35s; z-index: 12; border: 1px solid rgba(94,156,250,0.14); box-shadow: 0 20px 40px -18px rgba(0,0,0,0.7); }
  .premium-card.hovered .card-info-panel { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
  .card-description { font-size: 11px; line-height: 1.55; color: #c8d4e4; margin: 0 0 12px 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .card-tag { font-size: 8px; font-weight: 500; letter-spacing: 0.08em; color: #7eb8ff; background: rgba(94,156,250,0.14); padding: 3px 10px; border-radius: 10px; border: 1px solid rgba(94,156,250,0.12); }
  .card-meta { display: flex; align-items: center; gap: 8px; font-size: 9px; color: #6b7d95; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); }
  .meta-sep { opacity: 0.4; }
  .sweep-container { position: absolute; inset: 0; border-radius: 16px; overflow: hidden; pointer-events: none; z-index: 15; }
  .sweep-line { position: absolute; top: 0; left: 0; width: 200%; height: 3px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), rgba(94,156,250,0.25), transparent); filter: blur(8px); transform: translateY(var(--sweep-y, 0px)) translateX(-50%); animation: sweepAcross 0.55s cubic-bezier(0.2,0.95,0.4,1.05) forwards; }
  .project-master-view { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 200; animation: fadeIn 0.5s; }
  .project-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(6,9,15,0.97); backdrop-filter: blur(28px); animation: fadeIn 0.7s; }
  .project-close-btn { position: fixed; top: 28px; right: 28px; width: 44px; height: 44px; border-radius: 50%; background: transparent; border: none; color: #c8d4e4; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 210; transition: all 0.25s; opacity: 0.7; animation: fadeIn 0.6s 0.25s both; }
  .project-close-btn:hover { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 14px rgba(255,255,255,0.5)); }
  .project-layout { display: flex; height: 100vh; width: 100%; overflow: hidden; position: relative; z-index: 201; }
  .project-gallery { flex: 0 0 58%; height: 100vh; overflow-y: auto; overflow-x: hidden; padding: 100px 40px 60px 60px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; animation: slideInLeft 0.7s 0.15s both; }
  .project-gallery::-webkit-scrollbar { width: 4px; }
  .project-gallery::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  .gallery-hero { position: relative; width: 100%; margin-bottom: 28px; border-radius: 16px; overflow: hidden; cursor: pointer; transition: transform 0.4s; aspect-ratio: 16/9; }
  .gallery-hero:hover { transform: scale(1.02); }
  .hero-image-wrapper { width: 100%; height: 100%; }
  .hero-img { width: 100%; height: 100%; display: block; }
  .img-cover { object-fit: cover; }
  .hero-hint { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 11px; font-weight: 500; letter-spacing: 0.25em; color: #fff; background: rgba(0,0,0,0.6); padding: 10px 24px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.15); opacity: 0; transition: opacity 0.35s; pointer-events: none; backdrop-filter: blur(8px); }
  .gallery-hero:hover .hero-hint { opacity: 1; }
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; margin-bottom: 32px; }
  .grid-item { position: relative; border-radius: 14px; overflow: hidden; cursor: pointer; transition: transform 0.4s; aspect-ratio: 4/3; animation: slideUp 0.6s forwards; opacity: 0; }
  .grid-item:hover { transform: translateY(-6px); }
  .grid-image-wrapper { width: 100%; height: 100%; }
  .grid-img { width: 100%; height: 100%; display: block; }
  .grid-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 22px 16px 16px; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%); opacity: 0; transform: translateY(6px); transition: opacity 0.35s, transform 0.35s; }
  .grid-overlay span { font-size: 9px; font-weight: 400; color: #fff; }
  .grid-item:hover .grid-overlay { opacity: 1; transform: translateY(0); }
  .grid-hint { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px; font-weight: 500; letter-spacing: 0.18em; color: #fff; background: rgba(0,0,0,0.5); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.14); opacity: 0; transition: opacity 0.35s; pointer-events: none; backdrop-filter: blur(6px); }
  .grid-item:hover .grid-hint { opacity: 1; }
  .gallery-video { margin-top: 16px; margin-bottom: 40px; }
  .video-container { width: 100%; border-radius: 16px; overflow: hidden; background: #0a0e16; border: 1px solid rgba(255,255,255,0.05); aspect-ratio: 16/9; }
  .video-player { width: 100%; height: 100%; display: block; object-fit: contain; background: #0a0e16; }
  .project-info { flex: 0 0 42%; height: 100vh; display: flex; align-items: center; padding: 100px 60px 60px 20px; overflow-y: auto; animation: slideInRight 0.8s 0.25s both; }
  .info-card { width: 100%; padding: 40px 36px; background: rgba(8,12,20,0.7); backdrop-filter: blur(24px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
  .view-toggle { display: flex; gap: 8px; margin-bottom: 28px; padding: 5px; background: rgba(13,19,33,0.5); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
  .toggle-btn { flex: 1; padding: 9px 0; font-size: 9px; font-weight: 600; letter-spacing: 0.15em; color: #6b7d95; background: transparent; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; font-family: inherit; }
  .toggle-btn.active { background: rgba(94,156,250,0.15); color: #5e9cfa; }
  .toggle-btn:hover:not(.active) { color: #8a9bb5; }
  .info-accent-line { width: 38px; height: 2px; background: #5e9cfa; margin-bottom: 26px; }
  .info-category { font-size: 10px; font-weight: 500; letter-spacing: 0.28em; color: #6b7d95; text-transform: uppercase; margin-bottom: 14px; }
  .info-title { font-size: 34px; font-weight: 600; letter-spacing: 0.02em; color: #e8e4d8; margin: 0 0 22px 0; line-height: 1.2; }
  .info-description { font-size: 12px; font-weight: 400; line-height: 1.7; color: #8a9bb5; margin-bottom: 32px; }
  .info-metadata { margin-bottom: 28px; padding: 22px 0; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
  .metadata-row { display: flex; gap: 28px; margin-bottom: 18px; }
  .metadata-row:last-child { margin-bottom: 0; }
  .metadata-field { flex: 1; display: flex; flex-direction: column; gap: 5px; }
  .field-label { font-size: 8px; font-weight: 600; letter-spacing: 0.2em; color: #5e9cfa; text-transform: uppercase; }
  .field-value { font-size: 11px; font-weight: 500; color: #c8d4e4; }
  .info-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 28px; }
  .tag-pill { font-size: 8px; font-weight: 500; letter-spacing: 0.06em; color: #6b7d95; background: rgba(107,125,149,0.08); padding: 3px 12px; border-radius: 14px; transition: all 0.2s; }
  .tag-pill:hover { background: rgba(107,125,149,0.18); color: #8a9bb5; }
  .info-link { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #5e9cfa; text-decoration: none; padding: 7px 0; border-bottom: 1px solid rgba(94,156,250,0.3); display: inline-flex; align-items: center; gap: 4px; transition: all 0.25s; }
  .info-link:hover { color: #7eb8ff; border-bottom-color: rgba(94,156,250,0.6); }
  .technical-breakdown { animation: fadeIn 0.4s; }
  .tech-header { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
  .tech-accent-line { width: 28px; height: 2px; background: #5e9cfa; flex-shrink: 0; }
  .tech-title { font-size: 16px; font-weight: 600; letter-spacing: 0.08em; color: #e8e4d8; }
  .tech-badge { font-size: 8px; font-weight: 600; letter-spacing: 0.15em; color: #5e9cfa; background: rgba(94,156,250,0.1); padding: 3px 10px; border-radius: 8px; border: 1px solid rgba(94,156,250,0.2); margin-left: auto; }
  .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
  .metric-item { background: rgba(94,156,250,0.04); border: 1px solid rgba(94,156,250,0.08); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 6px; }
  .metric-item:hover { background: rgba(94,156,250,0.08); border-color: rgba(94,156,250,0.2); }
  .metric-value { font-size: 22px; font-weight: 600; color: #e8e4d8; }
  .metric-value.cyan { color: #5e9cfa; }
  .metric-label { font-size: 8px; font-weight: 600; letter-spacing: 0.12em; color: #6b7d95; text-transform: uppercase; }
  .metric-target { border-color: rgba(94,156,250,0.2); background: rgba(94,156,250,0.06); }
  .tech-section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .tech-section:last-child { border-bottom: none; }
  .tech-section-label { font-size: 8px; font-weight: 600; letter-spacing: 0.2em; color: #5e9cfa; text-transform: uppercase; display: block; margin-bottom: 8px; }
  .tech-section-text { font-size: 11px; font-weight: 400; line-height: 1.6; color: #8a9bb5; }
  .pipeline-tools-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .pipeline-tool-tag { font-size: 8px; font-weight: 500; color: #c8d4e4; background: rgba(255,255,255,0.04); padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); }
  .rd-showcase { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 300; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.4s; }
  .rd-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(6,9,15,0.98); backdrop-filter: blur(32px); }
  .rd-close-btn { position: fixed; top: 28px; right: 28px; width: 44px; height: 44px; border-radius: 50%; background: transparent; border: none; color: #c8d4e4; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 310; transition: all 0.25s; opacity: 0.7; }
  .rd-close-btn:hover { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 14px rgba(255,255,255,0.5)); }
  .rd-content { position: relative; z-index: 301; width: 85vw; max-width: 900px; max-height: 85vh; overflow-y: auto; padding: 40px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
  .rd-content::-webkit-scrollbar { width: 4px; }
  .rd-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  .rd-header { margin-bottom: 36px; }
  .rd-accent { width: 42px; height: 2px; background: #5e9cfa; margin-bottom: 20px; }
  .rd-title { font-size: 36px; font-weight: 600; letter-spacing: 0.02em; color: #e8e4d8; margin: 0 0 10px 0; }
  .rd-subtitle { font-size: 12px; font-weight: 400; color: #6b7d95; margin: 0; }
  .rd-tabs { display: flex; gap: 8px; margin-bottom: 32px; padding: 5px; background: rgba(13,19,33,0.5); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); width: fit-content; }
  .rd-tab { padding: 10px 22px; font-size: 10px; font-weight: 600; letter-spacing: 0.15em; color: #6b7d95; background: transparent; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; font-family: inherit; }
  .rd-tab.active { background: rgba(94,156,250,0.12); color: #5e9cfa; }
  .rd-tab:hover:not(.active) { color: #8a9bb5; }
  .rd-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
  .rd-card { background: rgba(8,12,20,0.6); backdrop-filter: blur(16px); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.04); transition: all 0.3s; animation: slideUp 0.5s forwards; opacity: 0; }
  .rd-card:hover { border-color: rgba(94,156,250,0.15); box-shadow: 0 20px 40px -18px rgba(0,0,0,0.5); }
  .rd-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .rd-lang-tag { font-size: 9px; font-weight: 600; letter-spacing: 0.12em; color: #c8d4e4; background: rgba(255,255,255,0.06); padding: 3px 10px; border-radius: 6px; }
  .rd-impact-badge { font-size: 9px; font-weight: 500; letter-spacing: 0.06em; color: #5e9cfa; background: rgba(94,156,250,0.08); padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(94,156,250,0.15); }
  .rd-card-title { font-size: 15px; font-weight: 600; letter-spacing: 0.03em; color: #e8e4d8; margin: 0 0 8px 0; }
  .rd-card-desc { font-size: 11px; font-weight: 400; line-height: 1.6; color: #8a9bb5; margin: 0; }
  .lightbox-premium-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(6,9,15,0.97); backdrop-filter: blur(36px); z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: zoom-out; animation: fadeIn 0.35s; }
  .lightbox-premium-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; background: radial-gradient(ellipse at center, rgba(94,156,250,0.03) 0%, transparent 70%); }
  .lightbox-premium-header { position: fixed; top: 0; left: 0; right: 0; padding: 26px 38px; display: flex; justify-content: space-between; align-items: center; z-index: 1002; background: linear-gradient(to bottom, rgba(6,9,15,0.65), transparent); pointer-events: none; }
  .lightbox-premium-header > * { pointer-events: auto; }
  .lightbox-premium-counter { font-size: 10px; font-weight: 400; color: #6b7d95; letter-spacing: 0.12em; padding: 5px 14px; background: rgba(13,19,33,0.45); border-radius: 20px; border: 1px solid rgba(107,125,149,0.08); backdrop-filter: blur(12px); }
  .lightbox-premium-close { width: 38px; height: 38px; border-radius: 50%; background: transparent; border: none; color: #c8d4e4; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.25s; opacity: 0.65; }
  .lightbox-premium-close:hover { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 14px rgba(255,255,255,0.5)); }
  .lightbox-premium-main { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 72px 96px 76px; z-index: 1001; }
  .lightbox-premium-canvas { display: inline-flex; align-items: center; justify-content: center; background: transparent; border-radius: 12px; transition: all 0.5s; }
  .canvas-orientation-landscape { max-width: 80vw; max-height: 74vh; padding: 10px; }
  .canvas-orientation-wide { max-width: 82vw; max-height: 70vh; padding: 8px; }
  .canvas-orientation-square { max-width: min(72vw, 860px); max-height: 74vh; padding: 12px; }
  .canvas-orientation-portrait { max-width: 62vw; max-height: 74vh; padding: 14px; }
  .lightbox-premium-canvas video { max-width: 80vw !important; max-height: 75vh !important; width: auto !important; height: auto !important; }
  .lightbox-premium-img { display: block; transition: opacity 0.5s, transform 0.5s, filter 0.5s; width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
  .img-transitioning { opacity: 0; transform: scale(0.97); filter: blur(8px); }
  .img-loaded { opacity: 1; transform: scale(1); filter: blur(0); animation: imageFadeIn 0.5s; }
  .lightbox-premium-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border-radius: 50%; background: rgba(13,19,33,0.45); border: 1px solid rgba(255,255,255,0.08); color: #c8d4e4; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.25s; opacity: 0.45; z-index: 1003; backdrop-filter: blur(10px); }
  .lightbox-premium-nav:hover:not(:disabled) { opacity: 1; background: rgba(13,19,33,0.8); border-color: rgba(255,255,255,0.22); transform: translateY(-50%) scale(1.1); }
  .lightbox-premium-nav:disabled { opacity: 0; visibility: hidden; }
  .lightbox-premium-prev { left: 32px; }
  .lightbox-premium-next { right: 32px; }
  .lightbox-premium-caption { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); padding: 8px 24px; background: rgba(8,13,22,0.75); backdrop-filter: blur(18px); border-radius: 28px; border: 1px solid rgba(255,255,255,0.06); font-size: 11px; font-weight: 400; color: #8a9bb5; letter-spacing: 0.05em; z-index: 1002; white-space: nowrap; max-width: 80vw; overflow: hidden; text-overflow: ellipsis; transition: opacity 0.45s, transform 0.45s; }
  .caption-transitioning { opacity: 0; transform: translateX(-50%) translateY(10px); }
  @media (max-width: 1200px) { .identity-panel { flex: 0 0 300px; padding: 45px 20px 45px 40px; } .projects-track { padding: 65px 80px 80px 55px; } .project-layout { flex-direction: column; overflow-y: auto; } .project-gallery { flex: none; height: auto; padding: 80px 30px 30px 30px; } .project-info { flex: none; height: auto; padding: 0 30px 60px 30px; animation: slideUp 0.6s 0.2s both; } }
  @media (max-width: 768px) { .work-container { flex-direction: column; } .identity-panel { flex: none; height: auto; min-height: auto; padding: 28px 24px 24px 24px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.04); justify-content: flex-start; } .identity-name { font-size: 22px; } .projects-track { gap: 20px; padding: 55px 70px 65px 45px; } .rd-content { width: 92vw; padding: 28px; } .rd-title { font-size: 28px; } }
  @media (pointer: coarse) { .premium-card { box-shadow: 0 12px 28px -12px rgba(0,0,0,0.6) !important; transform: none !important; } .card-bloom { display: none !important; } .card-info-panel { display: none !important; } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } .premium-card { transform: none !important; } .card-bloom { display: none !important; } }
`;
document.head.appendChild(styleSheet);