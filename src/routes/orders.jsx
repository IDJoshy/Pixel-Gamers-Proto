import React, { useState } from 'react';
import { Link } from 'wouter';
import { useStore } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Orders = () => {
  const { currentUser, db, cancelOrder, saveUserAccount } = useStore();

  // Selected invoice modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Cancellation modal state (HU-COM-14)
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Error en la dirección');
  const [cancelFeedback, setCancelFeedback] = useState('');

  // Profile fields state (HU-COM-01, 11)
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [newsletter, setNewsletter] = useState(currentUser?.newsletter || false);
  const [profileMsg, setProfileMsg] = useState('');

  // Filter orders for the active customer
  const userOrders = db.orders.filter(o => o.customerEmail === currentUser?.email);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    saveUserAccount({
      ...currentUser,
      phone,
      address,
      newsletter
    });
    setProfileMsg('Perfil y preferencias actualizadas correctamente en la base de datos.');
    setTimeout(() => setProfileMsg(''), 4000);
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrderId) return;
    const res = cancelOrder(cancellingOrderId, cancelReason);
    setCancelFeedback(res.message);
    if (res.success) {
      setTimeout(() => {
        setCancellingOrderId(null);
        setCancelFeedback('');
      }, 2000);
    }
  };

  return (
    <div className="pg-page">
      <div className="pg-header">
        <span className="pg-header__tag">Portal Privado del Comprador</span>
        <h1 className="pg-header__title">Mi Perfil, Pedidos y Claves Digitales</h1>
        <p className="pg-header__subtitle">
          Consulta tu historial de compras, copia tus claves digitales y gestiona tus datos de despacho.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', alignItems: 'start' }}>
        {/* ORDERS & DIGITAL KEYS LIST (HU-COM-09) */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="pg-card" style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid var(--color-border-line)', paddingBottom: '12px', marginBottom: '15px' }}>
              Historial de Compras ({userOrders.length})
            </h2>

            {userOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <p style={{ color: '#94a3b8' }}>Aún no tienes pedidos registrados en tu cuenta.</p>
                <Link href="/" className="pg-btn pg-btn--primary pg-btn--sm" style={{ marginTop: '12px' }}>
                  Ir al Catálogo
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {userOrders.map(order => {
                  const canCancel = order.status === 'Pagada' || order.status === 'En proceso';

                  return (
                    <div
                      key={order.id}
                      style={{
                        background: 'rgba(0,0,0,0.15)',
                        border: '1px solid var(--color-border-line)',
                        borderRadius: '8px',
                        padding: '16px'
                      }}
                    >
                      {/* Order Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--color-border-line)', paddingBottom: '10px', marginBottom: '12px' }}>
                        <div>
                          <strong style={{ fontSize: '15px' }}>Orden #{order.id}</strong>
                          <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '10px' }}>
                            {new Date(order.date).toLocaleString('es-CL')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            className="pg-badge"
                            style={{
                              background: order.status === 'Entregado' || order.status === 'Entregada en tienda'
                                ? '#10b981'
                                : order.status === 'Cancelada'
                                ? '#ef4444'
                                : '#3b82f6'
                            }}
                          >
                            {order.status}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-contrast)' }}>
                            ${order.total.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>

                      {/* Items & Digital Keys */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '4px' }}>
                            <div>
                              <span>{item.quantity}x <strong>{item.title}</strong> ({item.format})</span>
                              {/* DIGITAL KEY COPIER (HU-COM-09 CA-02) */}
                              {item.digitalKey && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                  <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700 }}>Clave:</span>
                                  <code style={{ background: '#0f172a', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                                    {item.digitalKey}
                                  </code>
                                  <button
                                    className="pg-btn pg-btn--secondary pg-btn--sm"
                                    style={{ padding: '2px 6px', fontSize: '11px' }}
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.digitalKey);
                                      alert(`Clave copiada: ${item.digitalKey}`);
                                    }}
                                  >
                                    📋 Copiar
                                  </button>
                                </div>
                              )}
                            </div>
                            <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Logistics Info & Tracking Link (HU-COM-09 CA-03, HU-COM-10) */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#94a3b8' }}>
                        <div>
                          <span>Modalidad: <strong>{order.deliveryType === 'retiro' ? 'Retiro en Tienda' : 'Despacho'}</strong></span> • 
                          <span style={{ marginLeft: '6px' }}>Tracking: <Link href={`/tracking?id=${order.trackingId}`} style={{ color: 'var(--color-identity)', fontWeight: 700 }}>{order.trackingId}</Link></span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="pg-btn pg-btn--secondary pg-btn--sm"
                            onClick={() => setSelectedInvoiceOrder(order)}
                          >
                            📄 Ver Boleta PDF
                          </button>

                          {/* Order Cancellation (HU-COM-14) */}
                          {canCancel && (
                            <button
                              className="pg-btn pg-btn--danger pg-btn--sm"
                              onClick={() => setCancellingOrderId(order.id)}
                            >
                              Anular Pedido
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CUSTOMER PROFILE & NEWSLETTER (HU-COM-01, HU-COM-11) */}
        <div>
          <div className="pg-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid var(--color-border-line)', paddingBottom: '12px', marginBottom: '15px' }}>
              Mis Datos de Despacho
            </h2>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Nombre:</label>
                <input
                  type="text"
                  className="pg-input"
                  value={currentUser?.name || ''}
                  disabled
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>RUT:</label>
                <input
                  type="text"
                  className="pg-input"
                  value={currentUser?.rut || ''}
                  disabled
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Correo Electrónico:</label>
                <input
                  type="email"
                  className="pg-input"
                  value={currentUser?.email || ''}
                  disabled
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Teléfono de Contacto:</label>
                <input
                  type="tel"
                  className="pg-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Dirección por Defecto:</label>
                <textarea
                  className="pg-textarea"
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, depto, comuna..."
                  required
                />
              </div>

              {/* NEWSLETTER PREFERENCES (HU-COM-11) */}
              <div style={{ borderTop: '1px solid var(--color-border-line)', paddingTop: '10px', marginTop: '5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                  />
                  <span>Recibir boletín de promociones y preventas exclusivas</span>
                </label>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                  Puedes desuscribirte en cualquier momento con un clic.
                </span>
              </div>

              <button type="submit" className="pg-btn pg-btn--primary" style={{ marginTop: '10px' }}>
                Guardar Cambios
              </button>

              {profileMsg && (
                <p style={{ color: '#10b981', fontSize: '12px', textAlign: 'center' }}>
                  {profileMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* CANCELLATION MODAL (HU-COM-14) */}
      {cancellingOrderId && (
        <div className="pg-modal-overlay" onClick={() => setCancellingOrderId(null)}>
          <div className="pg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#ef4444' }}>
              Confirmar Cancelación de Pedido #{cancellingOrderId}
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '15px' }}>
              Solo es posible anular antes del embalaje. El monto pagado será reembolsado automáticamente y las unidades reintegradas al inventario.
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Motivo de la Cancelación:
              </label>
              <select
                className="pg-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="Error en la dirección">Error en la dirección ingresada</option>
                <option value="Cambio de opinión">Cambio de opinión sobre el producto</option>
                <option value="Comprado por error">Comprado por error</option>
                <option value="Tiempo de entrega estimado">Tiempo de entrega inconveniente</option>
              </select>
            </div>

            {cancelFeedback && (
              <p style={{ fontSize: '13px', color: cancelFeedback.includes('éxito') ? '#10b981' : '#ef4444', marginBottom: '12px' }}>
                {cancelFeedback}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="pg-btn pg-btn--secondary pg-btn--sm"
                onClick={() => setCancellingOrderId(null)}
              >
                Volver
              </button>
              <button
                className="pg-btn pg-btn--danger pg-btn--sm"
                onClick={handleConfirmCancel}
              >
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL (HU-COM-07) */}
      {selectedInvoiceOrder && (
        <div className="pg-modal-overlay" onClick={() => setSelectedInvoiceOrder(null)}>
          <div className="pg-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#111827', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px', marginBottom: '15px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>PIXEL GAMERS SpA</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>RUT: 76.998.112-K | Giro: Venta de Videojuegos y Licencias</p>
              </div>
              <div style={{ textAlign: 'right', border: '2px solid #ef4444', padding: '6px 12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444' }}>BOLETA ELECTRÓNICA</div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>N° {selectedInvoiceOrder.invoiceFolio}</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', marginBottom: '15px' }}>
              <strong>Cliente:</strong> {selectedInvoiceOrder.customerName}<br />
              <strong>RUT:</strong> {selectedInvoiceOrder.customerRut}<br />
              <strong>Fecha:</strong> {new Date(selectedInvoiceOrder.date).toLocaleString('es-CL')}<br />
              <strong>Orden:</strong> #{selectedInvoiceOrder.id}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '15px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>Cant.</th>
                  <th style={{ padding: '6px' }}>Descripción</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceOrder.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px' }}>{item.quantity}</td>
                    <td style={{ padding: '6px' }}>{item.title} ({item.format})</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${(item.price * item.quantity).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '10px', fontSize: '13px', textAlign: 'right' }}>
              <div>Neto: ${selectedInvoiceOrder.subtotal.toLocaleString('es-CL')}</div>
              <div>IVA 19%: ${selectedInvoiceOrder.tax.toLocaleString('es-CL')}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                TOTAL: ${selectedInvoiceOrder.total.toLocaleString('es-CL')}
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                className="pg-btn pg-btn--primary pg-btn--sm"
                onClick={() => window.print()}
              >
                🖨️ Imprimir / Guardar PDF
              </button>
              <button
                className="pg-btn pg-btn--secondary pg-btn--sm"
                style={{ marginLeft: '10px' }}
                onClick={() => setSelectedInvoiceOrder(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Loader />
    </div>
  );
};

export default Orders;
