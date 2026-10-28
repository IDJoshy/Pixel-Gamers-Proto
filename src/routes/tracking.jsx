import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Tracking = () => {
  const { db } = useStore();

  const [inputTrackingId, setInputTrackingId] = useState(() => {
    return new URLSearchParams(window.location.search).get('id') || '';
  });

  const [searchResult, setSearchResult] = useState(() => {
    const idParam = new URLSearchParams(window.location.search).get('id');
    if (!idParam) return null;
    const cleanId = idParam.trim().toUpperCase();
    return db.orders.find(
      o => o.trackingId?.toUpperCase() === cleanId || o.id?.toUpperCase() === cleanId
    ) || null;
  });

  const [hasSearched, setHasSearched] = useState(() => {
    return Boolean(new URLSearchParams(window.location.search).get('id'));
  });

  const performSearch = (idToSearch) => {
    setHasSearched(true);
    const cleanId = idToSearch.trim().toUpperCase();
    const found = db.orders.find(
      o => o.trackingId?.toUpperCase() === cleanId || o.id?.toUpperCase() === cleanId
    );
    setSearchResult(found || null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputTrackingId) return;
    performSearch(inputTrackingId);
  };

  const getStepActive = (status) => {
    if (status === 'Cancelada') return -1;
    if (status === 'Entregado' || status === 'Entregada en tienda') return 3;
    if (status === 'Enviado' || status === 'En camino') return 2;
    if (status === 'En preparación' || status === 'Listo para retiro' || status === 'Pagada') return 1;
    return 0;
  };

  const currentStep = searchResult ? getStepActive(searchResult.status) : 0;

  return (
    <div className="pg-page">
      <div className="pg-header">
        <span className="pg-header__tag">Rastreo de Envíos en Tiempo Real</span>
        <h1 className="pg-header__title">Seguimiento de tu Pedido Físico</h1>
        <p className="pg-header__subtitle">
          Ingresa tu Tracking ID o N° de Orden para conocer el estado exacto de tu despacho.
        </p>
      </div>

      {/* SEARCH BAR (HU-COM-10) */}
      <div className="pg-card" style={{ maxWidth: '650px', margin: '0 auto 30px auto' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="pg-input"
            placeholder="Ej: CHILEXPRESS-992819382 o ORD-1001..."
            value={inputTrackingId}
            onChange={(e) => setInputTrackingId(e.target.value)}
            required
          />
          <button type="submit" className="pg-btn pg-btn--primary">
            Rastrear
          </button>
        </form>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>
          💡 Ejemplo para probar: <code>CHILEXPRESS-992819382</code> o <code>PICKUP-COSTANERA-1002</code>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {hasSearched && (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          {searchResult ? (
            <div className="pg-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-line)', paddingBottom: '12px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Tracking ID:</span>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-identity)' }}>
                    {searchResult.trackingId}
                  </h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="pg-badge" style={{ fontSize: '13px', background: searchResult.status === 'Cancelada' ? '#ef4444' : '#10b981' }}>
                    {searchResult.status}
                  </span>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    Orden #{searchResult.id}
                  </div>
                </div>
              </div>

              {/* TIMELINE STEPPER (HU-COM-10 CA-02) */}
              {searchResult.status !== 'Cancelada' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '25px 0', textAlign: 'center' }}>
                  <div style={{ padding: '10px', borderRadius: '6px', background: currentStep >= 1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.1)', border: `1px solid ${currentStep >= 1 ? '#10b981' : 'var(--color-border-line)'}` }}>
                    <div style={{ fontSize: '24px' }}>📦</div>
                    <strong style={{ fontSize: '13px', color: currentStep >= 1 ? '#10b981' : '#94a3b8' }}>
                      1. En Preparación
                    </strong>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Empaque y picking en bodega</p>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '6px', background: currentStep >= 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.1)', border: `1px solid ${currentStep >= 2 ? '#10b981' : 'var(--color-border-line)'}` }}>
                    <div style={{ fontSize: '24px' }}>🚚</div>
                    <strong style={{ fontSize: '13px', color: currentStep >= 2 ? '#10b981' : '#94a3b8' }}>
                      2. En Camino
                    </strong>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>En manos del courier externo</p>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '6px', background: currentStep >= 3 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.1)', border: `1px solid ${currentStep >= 3 ? '#10b981' : 'var(--color-border-line)'}` }}>
                    <div style={{ fontSize: '24px' }}>🏠</div>
                    <strong style={{ fontSize: '13px', color: currentStep >= 3 ? '#10b981' : '#94a3b8' }}>
                      3. Entregado
                    </strong>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Recepción confirmada</p>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '15px', borderRadius: '6px', color: '#fca5a5', marginBottom: '20px' }}>
                  ⚠️ Esta orden fue cancelada. Motivo: {searchResult.cancellationReason || 'Solicitud de cliente'}. El stock fue reintegrado y el cobro revertido.
                </div>
              )}

              {/* DETAILS (HU-COM-10 CA-03, 05) */}
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '15px', borderRadius: '6px', fontSize: '13px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Destinatario:</strong> {searchResult.customerName}<br />
                  <strong>Dirección de Entrega:</strong> {searchResult.shippingAddress || 'Retiro presencial en sucursal'}<br />
                  <strong>Empresa Courier:</strong> {searchResult.courierName}
                </div>
                <div>
                  <strong>Fecha de Compra:</strong> {new Date(searchResult.date).toLocaleString('es-CL')}<br />
                  <strong>Medio de Pago:</strong> {searchResult.paymentMethod}<br />
                  <strong>Total Pagado:</strong> ${searchResult.total.toLocaleString('es-CL')}
                </div>
              </div>

              {/* External Courier simulated link (HU-COM-10 CA-03) */}
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <a
                  href={`https://www.chilexpress.cl/seguimiento?orden=${searchResult.trackingId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="pg-btn pg-btn--secondary"
                >
                  🔗 Ver Rastreo Oficial en Web del Courier
                </a>
              </div>
            </div>
          ) : (
            <div className="pg-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
                No encontramos ningún envío con el código "{inputTrackingId}"
              </p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                Por favor verifica el Tracking ID recibido en tu correo de confirmación.
              </p>
            </div>
          )}
        </div>
      )}

      <Loader />
    </div>
  );
};

export default Tracking;
