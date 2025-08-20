import React, { useState, useEffect, useRef, useMemo } from 'react'
import CircularGallery from './CircularGallery'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Phone, Mail, Heart } from 'lucide-react'
// usar ruta pública para assets estáticos (Vercel/Vite)

const WeddingInvitation = () => {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)
  const [letterOffsetX, setLetterOffsetX] = useState(0)
  const [bgImgHeight, setBgImgHeight] = useState('90%')
  const [bgOffsetX, setBgOffsetX] = useState(0)
  const [bgPosY, setBgPosY] = useState('50%')
  const [bgBaseShift, setBgBaseShift] = useState(12)
  const [bgImgAspect, setBgImgAspect] = useState(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const calcOffset = () => {
      const w = window.innerWidth
      let val
      if (w >= 1280) val = -Math.round(w * 0.16)
      else if (w >= 1024) val = -Math.round(w * 0.14)
      else if (w >= 768) val = -Math.round(w * 0.10)
      else val = -Math.round(w * 0.06)
      setLetterOffsetX(val)

      // Ajuste avanzado del fondo (altura/posición) para que destaque sin tapar la carta
      const h = window.innerHeight
      const aspect = w / h

      // Altura de la imagen (más generosa para dar protagonismo al sujeto)
      let sizePct
      if (w >= 1536) sizePct = '72%'
      else if (w >= 1280) sizePct = '68%'
      else if (w >= 1024) sizePct = '64%'
      else if (w >= 768) sizePct = '58%'
      else sizePct = '56%'
      setBgImgHeight(sizePct)

      // Desplazamiento base horizontal para encuadrar el rostro del perro
      let baseShift
      if (w >= 1536) baseShift = 140
      else if (w >= 1280) baseShift = 120
      else if (w >= 1024) baseShift = 100
      else if (w >= 768) baseShift = 80
      else baseShift = 40
      setBgBaseShift(baseShift)

      // Posición vertical sutil según relación de aspecto
      let posY
      if (aspect > 1.6) posY = '52%'
      else if (aspect < 1.2) posY = '48%'
      else posY = '50%'
      setBgPosY(posY)
    }
    calcOffset()
    window.addEventListener('resize', calcOffset)
    return () => window.removeEventListener('resize', calcOffset)
  }, [])

  // Cargar dimensiones de la imagen de fondo para calcular su rectángulo visible
  useEffect(() => {
    const img = new Image()
    img.src = '/img/Fondo_opcion2.jpeg'
    img.onload = () => {
      setBgImgAspect(img.naturalWidth / img.naturalHeight)
    }
  }, [])

  // Parallax sutil del fondo al mover el mouse (solo con carta abierta)
  useEffect(() => {
    if (!isEnvelopeOpen) return
    let anim = 0
    let running = false
    const smoothing = 0.15
    let current = 0
    let target = 0
    const onMove = (e) => {
      const ratio = e.clientX / window.innerWidth
      const w = window.innerWidth
      const amplitude = w >= 1280 ? 24 : (w >= 1024 ? 18 : (w >= 768 ? 12 : 8))
      target = (ratio - 0.5) * amplitude
      if (!running) {
        running = true
        const loop = () => {
          current += (target - current) * smoothing
          setBgOffsetX(current)
          anim = requestAnimationFrame(loop)
        }
        anim = requestAnimationFrame(loop)
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (anim) cancelAnimationFrame(anim)
    }
  }, [isEnvelopeOpen])

  // Calcular y aplicar variables CSS para que el marco coincida con el área real de la imagen
  useEffect(() => {
    if (!isEnvelopeOpen || !overlayRef.current || !bgImgAspect) return

    const w = window.innerWidth
    const h = window.innerHeight

    const pctVal = parseFloat(bgImgHeight)
    const heightPct = isNaN(pctVal) ? 60 : pctVal
    const scaledH = h * (heightPct / 100)
    const scaledW = scaledH * bgImgAspect

    const right = w - (bgBaseShift + Math.round(bgOffsetX))
    let left = right - scaledW
    left = Math.max(0, Math.min(left, w - 1))
    let width = Math.min(scaledW, w - left)

    const posYVal = parseFloat(bgPosY)
    const posY = isNaN(posYVal) ? 50 : posYVal
    let top = h * (posY / 100) - scaledH / 2
    top = Math.max(0, Math.min(top, h - 1))
    let height = Math.min(scaledH, h - top)

    const el = overlayRef.current
    el.style.setProperty('--frame-left', `${left}px`)
    el.style.setProperty('--frame-top', `${top}px`)
    el.style.setProperty('--frame-width', `${width}px`)
    el.style.setProperty('--frame-height', `${height}px`)
  }, [isEnvelopeOpen, bgImgAspect, bgImgHeight, bgBaseShift, bgOffsetX, bgPosY])

  const handleEnvelopeClick = () => {
    setIsEnvelopeOpen(true)
  }

  const envelopeVariants = {
    closed: {
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.6 }
    },
    opening: {
      scale: 1.1,
      rotateY: -15,
      transition: { duration: 0.8 }
    },
    open: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.5, delay: 0.3 }
    }
  }

  const letterVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 100,
      rotateX: -90,
      x: 0
    },
    visible: (xOffset) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      x: xOffset,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.8
      }
    })
  }

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const galleryItems = useMemo(() => ([
    { image: '/img/Imagen001.jpeg', text: '' },
    { image: '/img/Imagen003.jpeg', text: '' },
    { image: '/img/Imagen004.jpeg', text: '' },
    { image: '/img/Imagen005.jpeg', text: '' },
    { image: '/img/Imagen006.jpeg', text: '' },
  ]), []);

  return (
    <div className="wedding-invitation-container">
      {/* Fondo con imagen */}
      <div
        className={`background-image ${isEnvelopeOpen ? 'opened perrifo' : ''}`}
        style={{
          transition: 'background-position 900ms cubic-bezier(0.22, 1, 0.36, 1), background-size 900ms cubic-bezier(0.22, 1, 0.36, 1)',
          ...(isEnvelopeOpen
            ? { backgroundImage: `url(/img/Fondo_opcion2.jpeg)`, backgroundPosition: `calc(100% - ${bgBaseShift + Math.round(bgOffsetX)}px) ${bgPosY}`, backgroundSize: `auto ${bgImgHeight}` }
            : {})
        }}
      />
      <div className={`background-overlay ${isEnvelopeOpen ? 'opened' : ''}`} ref={overlayRef} />

      <AnimatePresence>
        {!isEnvelopeOpen ? (
          // SOBRE CERRADO
          <motion.div
            key="envelope"
            className="envelope-container"
            variants={envelopeVariants}
            initial="closed"
            animate={isEnvelopeOpen ? "open" : "closed"}
            exit="open"
          >
            <motion.div
              className="envelope"
              onClick={handleEnvelopeClick}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Cuerpo principal del sobre */}
              <div className="envelope-body">
                {/* Parte frontal del sobre */}
                <div className="envelope-front">
                  {/* Bordes decorativos */}
                  <div className="envelope-border-decoration">
                    <div className="border-corner top-left"></div>
                    <div className="border-corner top-right"></div>
                    <div className="border-corner bottom-left"></div>
                    <div className="border-corner bottom-right"></div>
                  </div>

                  {/* Contenido principal del sobre */}
                  <div className="envelope-content">
                    {/* Ornamento superior */}
                    <motion.div 
                      className="envelope-top-ornament"
                      animate={{
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="ornament-line">
                        <span className="ornament-symbol">❦</span>
                        <span className="ornament-center">✦</span>
                        <span className="ornament-symbol">❦</span>
                      </div>
                    </motion.div>

                    {/* Texto principal */}
                    <div className="envelope-main-text">
                      <p className="invitation-type">Invitación de Matrimonio</p>
                      <div className="couple-names-container">
                        <h2 className="couple-names-envelope">
                          <span className="bride-name-envelope">Jaime</span>
                          <motion.span 
                            className="ampersand-envelope"
                            animate={{
                              color: ["#d4af37", "#f1c40f", "#d4af37"],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            &
                          </motion.span>
                          <span className="groom-name-envelope">Rehinilde</span>
                        </h2>
                      </div>
                      <p className="wedding-date">15 de Junio, 2024</p>
                    </div>

                    {/* Ornamento inferior */}
                    <motion.div 
                      className="envelope-bottom-ornament"
                      animate={{
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                      }}
                    >
                      <div className="ornament-line">
                        <span className="ornament-symbol">❦</span>
                        <span className="ornament-center">✦</span>
                        <span className="ornament-symbol">❦</span>
                      </div>
                    </motion.div>

                    {/* Instrucción para abrir */}
                    <motion.p 
                      className="click-hint"
                      animate={{
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Toca para abrir la invitación
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Solapa triangular del sobre */}
              <div className="envelope-flap">
                <div className="flap-triangle">
                  <div className="flap-pattern">
                    <motion.div 
                      className="flap-ornament"
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      ❦
                    </motion.div>
                  </div>
                </div>
                
                {/* Sello de cera */}
                <motion.div
                  className="envelope-seal"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="seal-inner">
                    <div className="seal-rings">💍</div>
                    <div className="seal-text">J & R</div>
                  </div>
                </motion.div>
              </div>

              {/* Efectos de brillo */}
              <motion.div
                className="envelope-shine"
                animate={{
                  x: [-100, 300],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
            </motion.div>
          </motion.div>
        ) : (
          // CARTA ABIERTA
          <motion.div
            key="letter"
            className="letter-container"
            variants={letterVariants}
            initial="hidden"
            animate="visible"
            custom={letterOffsetX}
          >
            <div className="letter-paper">
                            {/* Decoración superior */}
              <motion.div 
                className="letter-decoration-top"
                animate={{
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ✦
              </motion.div>

              <motion.div
                className="letter-content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Encabezado elegante */}
                <motion.div className="letter-header" variants={itemVariants}>
                  <div className="ornamental-border-top">
                    <div className="ornament-left">❦</div>
                    <div className="ornament-center">✦</div>
                    <div className="ornament-right">❦</div>
                  </div>
                  
                  <motion.div className="wedding-announcement">
                    <p className="announcement-text">Tienen el honor de invitarte a celebrar</p>
                    <h2 className="event-title">Su Matrimonio</h2>
                  </motion.div>

                  <h1 className="couple-names-letter">
                    <motion.span 
                      className="name bride-name"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                    >
                      Jaime
                    </motion.span>
                    <motion.span 
                      className="ampersand"
                      animate={{
                        color: ["#d4af37", "#f1c40f", "#d4af37"],
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      &
                    </motion.span>
                    <motion.span 
                      className="name groom-name"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4, duration: 0.8 }}
                    >
                      Rehinilde
                    </motion.span>
                  </h1>

                  <div className="ornamental-border-bottom">
                    <div className="ornament-left">❦</div>
                    <div className="ornament-center">✦</div>
                    <div className="ornament-right">❦</div>
                  </div>
                </motion.div>

                {/* Mensaje principal elegante */}
                <motion.div className="invitation-message" variants={itemVariants}>
                  <div className="message-container">
                    <motion.p 
                      className="main-message"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6, duration: 0.8 }}
                    >
                      <em style={{ color: '#d4af37' }}>“Dos almas, un destino.”</em>
                    </motion.p>
                    <motion.div 
                      className="invitation-text-elegant"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8, duration: 0.8 }}
                    >
                      <p>Con alegría, te invitamos a celebrar nuestro amor</p>
                      <p>y ser parte de este día tan especial.</p>
                      <div style={{ height: 'min(56vh, 520px)', position: 'relative', marginTop: '24px' }}>
                        <CircularGallery items={galleryItems} bend={3} textColor="#ffffff" borderRadius={0.06} scrollEase={0.04} />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Detalles del evento */}
                <motion.div className="event-details" variants={itemVariants}>
                  <div className="detail-item">
                    <motion.div 
                      className="detail-icon"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      <Calendar size={24} />
                    </motion.div>
                    <div className="detail-text">
                      <h3>Fecha</h3>
                      <p>Sábado, 15 de Junio 2024</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <motion.div 
                      className="detail-icon"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      <Clock size={24} />
                    </motion.div>
                    <div className="detail-text">
                      <h3>Hora</h3>
                      <p>6:00 PM</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <motion.div 
                      className="detail-icon"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      <MapPin size={24} />
                    </motion.div>
                    <div className="detail-text">
                      <h3>Lugar</h3>
                      <p>Iglesia San José</p>
                      <small>Centro de la Ciudad</small>
                    </div>
                  </div>
                </motion.div>

                {/* Código de vestimenta */}
                <motion.div className="dress-code-section" variants={itemVariants}>
                  <h3>👗 Código de Vestimenta</h3>
                  <p>Formal / Cocktail</p>
                  <div className="color-palette">
                    <span>Colores sugeridos:</span>
                    <div className="color-swatches">
                      <motion.div 
                        className="color-swatch navy"
                        whileHover={{ scale: 1.2 }}
                        title="Azul Marino"
                      />
                      <motion.div 
                        className="color-swatch gold"
                        whileHover={{ scale: 1.2 }}
                        title="Dorado"
                      />
                      <motion.div 
                        className="color-swatch white"
                        whileHover={{ scale: 1.2 }}
                        title="Blanco"
                      />
                      <motion.div 
                        className="color-swatch silver"
                        whileHover={{ scale: 1.2 }}
                        title="Plata"
                      />
                    </div>
                  </div>
                </motion.div>

                
                {/* Mensaje de cierre */}
                <motion.div className="closing-message" variants={itemVariants}>
                  <Heart className="heart-icon" size={20} />
                  <p>¡Esperamos celebrar contigo este día tan especial!</p>
                  <div className="signatures">
                    <span className="signature">Jaime</span>
                    <span className="heart-separator">💕</span>
                    <span className="signature">Rehinilde</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Decoración inferior */}
              <motion.div 
                className="letter-decoration-bottom"
                animate={{
                  rotate: [0, -10, 10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                ✦
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WeddingInvitation