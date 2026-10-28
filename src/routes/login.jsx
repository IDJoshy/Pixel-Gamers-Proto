import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useStore } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Login = () => {
  const [, setLocation] = useLocation();
  const { db, setCurrentUser, setActiveRole, addSecurityLog } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      // Friendly generic error message (HU-COM-01 CA-04)
      setErrorMessage('Credenciales inválidas. Por favor verifica tus datos de acceso.');
      addSecurityLog('LOGIN_FALLIDO', `Intento de acceso fallido para ${email}`, 'WARN');
      return;
    }

    if (user.status === 'congelado') {
      setErrorMessage('Tu cuenta se encuentra temporalmente congelada por el administrador.');
      return;
    }

    // Success
    setCurrentUser(user);
    setActiveRole(user.role);
    addSecurityLog('LOGIN_EXITOSO', `Usuario ${user.email} inició sesión correctamente.`, 'INFO', user.email, user.rut);

    if (user.role === 'vendedor') setLocation('/pos');
    else if (user.role === 'inventario') setLocation('/admin-inventario');
    else if (user.role === 'admin') setLocation('/admin-ti');
    else setLocation('/');
  };

  const handleQuickDemoLogin = (role) => {
    const user = db.users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setActiveRole(role);
      if (role === 'vendedor') setLocation('/pos');
      else if (role === 'inventario') setLocation('/admin-inventario');
      else if (role === 'admin') setLocation('/admin-ti');
      else setLocation('/');
    }
  };

  return (
    <div className="pg-page">
      <div className="pg-card" style={{ maxWidth: '460px', margin: '40px auto', padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="pg-header__tag">Acceso al Sistema</span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>Iniciar Sesión</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Ingresa a tu perfil gamer o módulo de administración.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Correo Electrónico:
            </label>
            <input
              type="email"
              className="pg-input"
              placeholder="tu.correo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Contraseña (mínimo 8 caracteres):
            </label>
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

          {errorMessage && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
              {errorMessage}
            </div>
          )}

          <button type="submit" className="pg-btn pg-btn--primary" style={{ padding: '12px' }}>
            Ingresar a Pixel Gamers
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px' }}>
          ¿No tienes una cuenta? <Link href="/signup" style={{ color: 'var(--color-identity)', fontWeight: 600 }}>Regístrate aquí</Link>
        </div>

        {/* QUICK DEMO ACCESS */}
        <div style={{ marginTop: '25px', borderTop: '1px solid var(--color-border-line)', paddingTop: '15px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
            ACCESO RÁPIDO PARA EVALUACIÓN DEL PROTOTIPO:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="pg-btn pg-btn--secondary pg-btn--sm"
              onClick={() => handleQuickDemoLogin('comprador')}
            >
              🛒 Cliente Comprador
            </button>
            <button
              type="button"
              className="pg-btn pg-btn--secondary pg-btn--sm"
              onClick={() => handleQuickDemoLogin('vendedor')}
            >
              🏪 Vendedor POS
            </button>
            <button
              type="button"
              className="pg-btn pg-btn--secondary pg-btn--sm"
              onClick={() => handleQuickDemoLogin('inventario')}
            >
              📦 Adm. Inventario
            </button>
            <button
              type="button"
              className="pg-btn pg-btn--secondary pg-btn--sm"
              onClick={() => handleQuickDemoLogin('admin')}
            >
              🛡️ Adm. Sistemas TI
            </button>
          </div>
        </div>
      </div>

      <Loader />
    </div>
  );
};

export default Login;
