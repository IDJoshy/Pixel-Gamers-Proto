import React, { useState } from 'react';
import { Link } from 'wouter';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const GUIDE_PLATFORMS = [
  {
    id: 'psn',
    name: 'PlayStation (PS5 / PS4)',
    color: '#003791',
    steps: [
      { step: 1, title: 'Inicia sesión en PSN', desc: 'Enciende tu consola PS5 o PS4 e ingresa con tu cuenta de PlayStation Network.' },
      { step: 2, title: 'Abre PlayStation Store', desc: 'Navega hasta la PlayStation Store en el menú de inicio.' },
      { step: 3, title: 'Selecciona "Canjear Código"', desc: 'En PS5, presiona en los tres puntos (...) junto al carrito y elige "Canjear código". En PS4, ve al fondo del menú lateral.' },
      { step: 4, title: 'Introduce los 12 dígitos', desc: 'Ingresa con cuidado tu clave de 12 caracteres (sin guiones) y confirma. ¡El juego comenzará a descargarse de inmediato!' }
    ]
  },
  {
    id: 'xbox',
    name: 'Xbox Series X|S & PC',
    color: '#107c10',
    steps: [
      { step: 1, title: 'Presiona el botón Xbox', desc: 'En tu mando, pulsa el botón central iluminado Xbox para abrir la guía.' },
      { step: 2, title: 'Dirígete a Store', desc: 'Selecciona la pestaña Store y luego presiona "Ver en Store".' },
      { step: 3, title: 'Presiona botón Vista / Canjear', desc: 'Selecciona la opción "Canjear" en el menú de la tienda.' },
      { step: 4, title: 'Escribe tu código de 25 caracteres', desc: 'Ingresa tu clave de 25 caracteres alfanuméricos y selecciona "Comprobar código". ¡Listo!' }
    ]
  },
  {
    id: 'nintendo',
    name: 'Nintendo Switch (eShop)',
    color: '#e60012',
    steps: [
      { step: 1, title: 'Abre Nintendo eShop', desc: 'Selecciona el ícono naranja de la bolsa de Nintendo eShop en el menú HOME.' },
      { step: 2, title: 'Selecciona tu Usuario', desc: 'Elige el perfil con el que vas a jugar y vincular la licencia digital.' },
      { step: 3, title: 'Ve a "Canjear Código"', desc: 'En el menú del lateral izquierdo, desplázate hasta la última opción: "Canjear código".' },
      { step: 4, title: 'Ingresa los 16 caracteres', desc: 'Introduce la clave de descarga de 16 caracteres de tu juego o suscripción y presiona "Confirmar".' }
    ]
  },
  {
    id: 'pc',
    name: 'Steam & GOG (PC)',
    color: '#171a21',
    steps: [
      { step: 1, title: 'Abre tu cliente Steam / GOG', desc: 'Inicia la aplicación de Steam en tu computador e inicia sesión.' },
      { step: 2, title: 'Menú "Juegos"', desc: 'En la barra superior de Steam, haz clic en el menú "Juegos".' },
      { step: 3, title: 'Activar un producto', desc: 'Selecciona "Activar un producto en Steam..." y acepta el acuerdo de suscriptor.' },
      { step: 4, title: 'Pega tu clave Pixel Gamers', desc: 'Pega el código digital copiado desde tu perfil y presiona "Siguiente" para añadirlo a tu biblioteca.' }
    ]
  }
];

const FAQS = [
  { q: '¿Qué hago si la consola dice "Código no válido o ya utilizado"?', a: 'Asegúrate de no confundir la letra O con el número 0, o la I mayúscula con el número 1. Verifica además que tu cuenta coincida con la región de la clave comprada (Chile / Región Americana).' },
  { q: '¿Cuánto tiempo tarda en llegar el código tras pagar?', a: 'El envío es instantáneo mediante nuestro servicio automatizado: tu código se despacha a tu correo y se habilita en tu perfil en menos de 60 segundos.' },
  { q: '¿Puedo reembolsar una clave digital ya revelada o canjeada?', a: 'Por normativas de los fabricantes y políticas de seguridad, las licencias digitales no admiten devolución una vez visualizadas o asignadas.' }
];

const RedemptionGuide = () => {
  const [activeTab, setActiveTab] = useState('psn');

  const currentPlatform = GUIDE_PLATFORMS.find(p => p.id === activeTab);

  return (
    <div className="pg-page">
      <div className="pg-header">
        <span className="pg-header__tag">Centro de Ayuda Digital</span>
        <h1 className="pg-header__title">Guía Interactiva para Canjear tus Códigos</h1>
        <p className="pg-header__subtitle">
          Aprende paso a paso cómo activar tus licencias digitales en PlayStation, Xbox, Nintendo y PC sin errores.
        </p>
      </div>

      {/* PLATFORM TABS (HU-COM-13 CA-02) */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
        {GUIDE_PLATFORMS.map(platform => (
          <button
            key={platform.id}
            className={`pg-btn ${activeTab === platform.id ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
            style={{
              borderColor: activeTab === platform.id ? platform.color : 'var(--color-border-line)',
              background: activeTab === platform.id ? platform.color : 'transparent'
            }}
            onClick={() => setActiveTab(platform.id)}
          >
            {platform.name}
          </button>
        ))}
      </div>

      {/* 4 STEP GUIDE (HU-COM-13 CA-03) */}
      <div className="pg-card" style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: currentPlatform.color }}>
          Activación en {currentPlatform.name}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {currentPlatform.steps.map(s => (
            <div
              key={s.step}
              style={{
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--color-border-line)',
                borderRadius: '8px',
                padding: '20px',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: currentPlatform.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '15px',
                  marginBottom: '12px'
                }}
              >
                {s.step}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQS (HU-COM-13 CA-04) */}
      <div className="pg-card" style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px' }}>
          Preguntas Frecuentes y Solución de Errores
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--color-border-line)', paddingBottom: '12px' }}>
              <strong style={{ fontSize: '14px', color: 'var(--color-identity)' }}>{faq.q}</strong>
              <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SUPPORT CONTACT BUTTON (HU-COM-13 CA-05) */}
      <div className="pg-card" style={{ textAlign: 'center', padding: '30px 20px', background: 'rgba(49, 108, 160, 0.1)' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
          ¿Aún tienes dudas o experimentas problemas con un código?
        </h4>
        <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '15px' }}>
          Nuestro equipo de soporte técnico gamer te responderá de inmediato.
        </p>
        <Link href="/contact" className="pg-btn pg-btn--contrast">
          💬 Contactar a Soporte Técnico
        </Link>
      </div>

      <Loader />
    </div>
  );
};

export default RedemptionGuide;
