import React from 'react';
import { Link, useLocation } from 'wouter';
import { useStore } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Cart = () => {
  const [, setLocation] = useLocation();
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTimer } = useStore();

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.19 / 1.19);
  const net = subtotal - tax;

  const hasPhysicalItems = cart.some(item => item.product.format === 'Físico');
  const hasDigitalItems = cart.some(item => item.product.format === 'Digital' || item.product.format === 'DLC');

  return (
    <div className="pg-page">
      <div className="pg-header">
        <span className="pg-header__tag">Transacción Unificada</span>
        <h1 className="pg-header__title">Mi Carrito de Compras</h1>
        <p className="pg-header__subtitle">
          Consolida videojuegos físicos y licencias digitales en una sola transacción segura.
        </p>
      </div>

      {/* 15 MINUTE RESERVATION BANNER (HU-COM-04 CA-04) */}
      {cart.length > 0 && (
        <div
          className="pg-card"
          style={{
            background: cartTimer < 180 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.1)',
            borderColor: cartTimer < 180 ? '#ef4444' : '#38bdf8',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <strong style={{ color: cartTimer < 180 ? '#ef4444' : '#38bdf8' }}>
              ⏱️ Reserva Temporal de Inventario Activa
            </strong>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>
              Los productos y claves digitales en tu carrito están apartados por 15 minutos mientras completas la orden.
            </p>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: cartTimer < 180 ? '#ef4444' : '#38bdf8' }}>
            {formatTimer(cartTimer)}
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="pg-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>
            Tu carrito está vacío 🛒
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '25px' }}>
            Explora nuestro catálogo para descubrir los mejores títulos físicos y digitales.
          </p>
          <Link href="/" className="pg-btn pg-btn--primary">
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', alignItems: 'start' }}>
          {/* CART ITEMS LIST (HU-COM-04) */}
          <div className="pg-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-line)', paddingBottom: '12px', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                Productos ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
              <button
                className="pg-btn pg-btn--secondary pg-btn--sm"
                onClick={clearCart}
                style={{ color: '#ef4444' }}
              >
                Vaciar Carrito
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {cart.map(item => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    gap: '15px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid var(--color-border-line)',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                      <span className={`pg-badge pg-badge--${item.product.format.toLowerCase()}`}>
                        {item.product.format === 'Físico' ? '💿 Físico' : item.product.format === 'Digital' ? '⚡ Digital' : '🧩 DLC'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.product.platform}</span>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{item.product.title}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--color-contrast)', fontWeight: 700, marginTop: '2px' }}>
                      ${item.product.price.toLocaleString('es-CL')} c/u
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="pg-btn pg-btn--secondary pg-btn--sm"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      className="pg-btn pg-btn--secondary pg-btn--sm"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Line total & remove */}
                  <div style={{ textAlign: 'right', minWidth: '90px' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>
                      ${(item.product.price * item.quantity).toLocaleString('es-CL')}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mixed cart alert indicator */}
            <div style={{ marginTop: '15px', fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '15px' }}>
              {hasPhysicalItems && <span>📦 Incluye despacho / retiro de productos físicos.</span>}
              {hasDigitalItems && <span>⚡ Incluye licencias digitales con entrega inmediata.</span>}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="pg-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid var(--color-border-line)', paddingBottom: '12px', marginBottom: '15px' }}>
              Resumen de la Transacción
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Subtotal Neto:</span>
                <span>${net.toLocaleString('es-CL')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>IVA Débito Fiscal (19%):</span>
                <span>${tax.toLocaleString('es-CL')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Costo de Despacho:</span>
                <span style={{ color: '#10b981' }}>Calculado en Checkout</span>
              </div>
              <div style={{ borderTop: '2px solid var(--color-border-line)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800 }}>
                <span>Total Estimado:</span>
                <span style={{ color: 'var(--color-contrast)' }}>${subtotal.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <button
              className="pg-btn pg-btn--contrast"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              onClick={() => setLocation('/checkout')}
            >
              Continuar al Checkout →
            </button>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <Link href="/" style={{ color: 'var(--color-identity)', fontSize: '13px', textDecoration: 'none' }}>
                ← Seguir agregando videojuegos
              </Link>
            </div>
          </div>
        </div>
      )}

      <Loader />
    </div>
  );
};

export default Cart;
