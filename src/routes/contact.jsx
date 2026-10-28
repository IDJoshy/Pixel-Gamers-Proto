import React, { useState } from 'react';
import Hero from "../components/hero/hero";
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Soporte con clave digital');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSentSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSentSuccess(false), 5000);
  };

  return (
    <>
      <div className="about" style={{ paddingBottom: '30px' }}>
        <div className="about__container about__container--hero">
          <Hero
            header="Contacto y Asistencia"
            title="CANAL DE ATENCIÓN GAMER"
            body={`¿Tienes dudas con la entrega de tu clave digital, el seguimiento de tu paquete físico o necesitas asistencia posventa?
            
            Nuestro equipo técnico especializado está disponible los 7 días de la semana para ayudarte.`}
          />
        </div>
      </div>

      <div className="pg-page" style={{ margin: '20px auto 50px auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', alignItems: 'start' }}>
          {/* Contact form */}
          <div className="pg-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px' }}>
              Envíanos tu Consulta o Requerimiento
            </h2>

            {sentSuccess ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#a7f3d0', padding: '20px', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '30px', marginBottom: '8px' }}>✉️</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>¡Mensaje Enviado con Éxito!</h3>
                <p style={{ fontSize: '13px' }}>
                  Tu ticket ha sido registrado en el sistema. Te responderemos en menos de 2 horas hábiles a tu correo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Nombre Completo:</label>
                  <input
                    type="text"
                    className="pg-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Correo Electrónico:</label>
                  <input
                    type="email"
                    className="pg-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Motivo:</label>
                  <select
                    className="pg-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="Soporte con clave digital">Asistencia con Clave Digital / Canje</option>
                    <option value="Estado de despacho físico">Estado de Despacho Físico / Courier</option>
                    <option value="Garantía de producto">Garantía o Falla Técnica</option>
                    <option value="Consulta comercial">Consulta Comercial o Preventas</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Mensaje o Detalle del Requerimiento:</label>
                  <textarea
                    className="pg-textarea"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe tu consulta, número de orden o inconveniente..."
                    required
                  />
                </div>

                <button type="submit" className="pg-btn pg-btn--primary">
                  Enviar Mensaje a Soporte
                </button>
              </form>
            )}
          </div>

          {/* Direct channels */}
          <div className="pg-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px' }}>
              Canales Directos de Soporte
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '13px' }}>
              <div>
                <strong style={{ color: 'var(--color-identity)' }}>📧 Correo de Soporte Oficial:</strong>
                <p style={{ marginTop: '2px', color: '#cbd5e1' }}>soporte@pixelgamers.cl</p>
              </div>

              <div>
                <strong style={{ color: 'var(--color-identity)' }}>💬 WhatsApp Mesa Central:</strong>
                <p style={{ marginTop: '2px', color: '#cbd5e1' }}>+56 9 8765 4321 (Lunes a Domingo 09:00 - 21:00)</p>
              </div>

              <div>
                <strong style={{ color: 'var(--color-identity)' }}>📍 Atención Presencial en Sucursales:</strong>
                <ul style={{ paddingLeft: '18px', marginTop: '4px', color: '#cbd5e1' }}>
                  <li>Mallplaza Tobalaba: Local 1010, Piso 1</li>
                  <li>Costanera Center: Local 4009, Piso 3</li>
                  <li>Arauco Maipú: Local 300, Piso 2</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
                <strong>⚡ ¿Necesitas canjear una clave ahora?</strong>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                  Visita nuestra <a href="/guia-canje" style={{ color: 'var(--color-identity)' }}>Guía Interactiva de Canje Paso a Paso</a> para PlayStation, Xbox, Nintendo y Steam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Loader />
    </>
  );
};

export default Contact;
