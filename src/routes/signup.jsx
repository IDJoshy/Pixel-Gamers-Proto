import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useStore } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Signup = () => {
  const [, setLocation] = useLocation();
  const { db, saveUserAccount, setCurrentUser, setActiveRole, addSecurityLog } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successWelcome, setSuccessWelcome] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('La contraseña debe contener al menos 8 caracteres.');
      return;
    }

    const emailExists = db.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (emailExists) {
      setErrorMessage('El correo electrónico ingresado ya se encuentra registrado.');
      return;
    }

    const newUser = {
      name,
      email: email.trim().toLowerCase(),
      rut,
      passwordHash: 'bcrypt_salt_hash_' + Math.random().toString(36),
      role: 'comprador',
      phone,
      address,
      newsletter,
      mfaEnabled: false,
      status: 'activo',
      createdAt: new Date().toISOString()
    };

    saveUserAccount(newUser);
    setCurrentUser(newUser);
    setActiveRole('comprador');

    // Welcome email simulation (HU-COM-01 CA-05)
    addSecurityLog('BIENVENIDA_REGISTRO', `Correo de bienvenida despachado automáticamente a ${newUser.email} vía servidor SMTP.`, 'INFO');

    setSuccessWelcome(true);
    setTimeout(() => {
      setLocation('/');
    }, 2500);
  };

  return (
    <div className="pg-page">
      <div className="pg-card" style={{ maxWidth: '500px', margin: '40px auto', padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="pg-header__tag">Únete a la Comunidad</span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>Crear Cuenta Gamer</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Guarda tus direcciones de despacho y accede a tus compras y claves digitales.
          </p>
        </div>

        {successWelcome ? (
          <div style={{ textAlign: 'center', padding: '25px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>✉️ 🎉</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>
              ¡Registro Completado con Éxito!
            </h2>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
              Te hemos enviado un correo de bienvenida automático. Redirigiéndote al catálogo...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Nombre Completo:</label>
              <input
                type="text"
                className="pg-input"
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Correo Electrónico:</label>
                <input
                  type="email"
                  className="pg-input"
                  placeholder="juan@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>RUT:</label>
                <input
                  type="text"
                  className="pg-input"
                  placeholder="18.234.567-8"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Contraseña (min. 8 cars):</label>
                <input
                  type="password"
                  className="pg-input"
                  placeholder="••••••••"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Teléfono:</label>
                <input
                  type="tel"
                  className="pg-input"
                  placeholder="+56 9 8765 4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Dirección de Despacho:</label>
              <input
                type="text"
                className="pg-input"
                placeholder="Av. Providencia 1234, Depto 402, Providencia"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}>
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
              />
              <span>Deseo recibir el boletín con promociones y alertas de preventa</span>
            </label>

            {errorMessage && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                {errorMessage}
              </div>
            )}

            <button type="submit" className="pg-btn pg-btn--primary" style={{ padding: '12px', marginTop: '6px' }}>
              Crear mi Cuenta
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px' }}>
          ¿Ya tienes cuenta? <Link href="/login" style={{ color: 'var(--color-identity)', fontWeight: 600 }}>Inicia sesión aquí</Link>
        </div>
      </div>

      <Loader />
    </div>
  );
};

export default Signup;
