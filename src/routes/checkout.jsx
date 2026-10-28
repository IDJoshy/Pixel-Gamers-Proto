import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useStore, BRANCHES } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Checkout = () => {
  const { cart, currentUser, db, processCheckout } = useStore();

  // Delivery options (HU-COM-05)
  const [deliveryType, setDeliveryType] = useState('despacho'); // despacho | retiro
  const [selectedBranch, setSelectedBranch] = useState('sucursal_1');
  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || 'Av. Providencia 1234, Providencia, RM');
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Juan Pérez');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'juan.perez@email.com');
  const [customerRut, setCustomerRut] = useState(currentUser?.rut || '18.234.567-8');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+56 9 8765 4321');

  // Payment options (HU-COM-06)
  const [paymentGateway, setPaymentGateway] = useState('webpay'); // webpay | mercadopago
  const [paymentType, setPaymentType] = useState('credito'); // credito | debito | transferencia

  // Gateway Simulation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.19 / 1.19);
  const net = subtotal - tax;
  const shippingCost = deliveryType === 'retiro'
    ? 0
    : (subtotal >= (db.settings.freeShippingThreshold || 50000) ? 0 : (db.settings.courierDefaultRate || 3990));
  const total = subtotal + shippingCost;

  if (cart.length === 0 && !completedOrder) {
    return (
      <div className="pg-page" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>No hay productos en el carrito para procesar</h2>
        <Link href="/" className="pg-btn pg-btn--primary" style={{ marginTop: '20px' }}>
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  // Handle simulated payment
  const handlePay = (shouldSimulateFailure = false) => {
    setIsProcessing(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsProcessing(false);

      if (shouldSimulateFailure) {
        // Payment Rejected simulation (HU-COM-06 CA-04)
        setErrorMessage('La transacción fue rechazada por el banco emisor (Código 99). Se ha liberado la reserva temporal de tu inventario.');
        return;
      }

      // Approved! Process order (HU-COM-06 CA-03, HU-COM-07, HU-COM-08)
      const order = processCheckout({
        deliveryType,
        shippingAddress: deliveryType === 'despacho' ? shippingAddress : null,
        pickupBranchId: deliveryType === 'retiro' ? selectedBranch : null,
        paymentMethod: `${paymentGateway === 'webpay' ? 'Webpay Plus' : 'MercadoPago'} (${paymentType === 'credito' ? 'Tarjeta de Crédito' : paymentType === 'debito' ? 'Tarjeta de Débito' : 'Transferencia Electrónica'})`,
        customerData: {
          name: customerName,
          email: customerEmail,
          rut: customerRut,
          phone: customerPhone
        }
      });

      setCompletedOrder(order);
    }, 1500);
  };

  return (
    <div className="pg-page">
      <div className="pg-header">
        <span className="pg-header__tag">Pasarela Segura PCI-DSS</span>
        <h1 className="pg-header__title">
          {completedOrder ? '¡Compra Exitosa y Confirmada!' : 'Finalizar Compra & Checkout'}
        </h1>
        <p className="pg-header__subtitle">
          {completedOrder
            ? `Tu orden #${completedOrder.id} ha sido procesada con éxito. Boleta electrónica emitida y licencias generadas.`
            : 'Configura la logística de entrega y autoriza tu pago mediante canales bancarios cifrados TLS 1.3.'}
        </p>
      </div>

      {/* COMPLETED ORDER VIEW (HU-COM-07, 08) */}
      {completedOrder ? (
        <div className="pg-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '50px', marginBottom: '10px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginBottom: '10px' }}>
            Pago Autorizado Exitosamente
          </h2>
          <p style={{ fontSize: '15px', color: '#cbd5e1', marginBottom: '20px' }}>
            Hemos enviado un correo a <strong>{completedOrder.customerEmail}</strong> con el comprobante de boleta electrónica adjunta y las instrucciones.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', textAlign: 'left', marginBottom: '25px', border: '1px solid var(--color-border-line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '13px' }}>
              <div>
                <strong>N° de Orden:</strong> {completedOrder.id}<br />
                <strong>Folio Boleta:</strong> {completedOrder.invoiceFolio}<br />
                <strong>Fecha:</strong> {new Date(completedOrder.date).toLocaleString('es-CL')}
              </div>
              <div>
                <strong>Modalidad:</strong> {completedOrder.deliveryType === 'retiro' ? 'Retiro en Tienda ($0)' : 'Despacho a Domicilio'}<br />
                <strong>Tracking ID:</strong> <span style={{ color: 'var(--color-identity)', fontWeight: 700 }}>{completedOrder.trackingId}</span><br />
                <strong>Total Pagado:</strong> ${completedOrder.total.toLocaleString('es-CL')}
              </div>
            </div>

            {/* INSTANT DIGITAL KEYS DISPLAY (HU-COM-08) */}
            {completedOrder.items.some(i => i.digitalKey) && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border-line)', paddingTop: '15px' }}>
                <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  ⚡ Claves Digitales Asignadas Instantáneamente (&lt; 1 min):
                </h4>
                {completedOrder.items.filter(i => i.digitalKey).map(item => (
                  <div key={item.digitalKey} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '12px', borderRadius: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{item.title}</strong>
                      <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                        {item.digitalKey}
                      </div>
                    </div>
                    <button
                      className="pg-btn pg-btn--secondary pg-btn--sm"
                      onClick={() => {
                        navigator.clipboard.writeText(item.digitalKey);
                        alert(`¡Clave copiada al portapapeles: ${item.digitalKey}`);
                      }}
                    >
                      📋 Copiar Clave
                    </button>
                  </div>
                ))}
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                  Puedes consultar el paso a paso en nuestra <Link href="/guia-canje" style={{ color: 'var(--color-identity)' }}>Guía Interactiva de Canje</Link>.
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="pg-btn pg-btn--primary"
              onClick={() => setShowInvoiceModal(true)}
            >
              📄 Ver / Descargar Boleta Electrónica PDF
            </button>
            <Link href="/orders" className="pg-btn pg-btn--secondary">
              Ver Mis Pedidos
            </Link>
            <Link href="/" className="pg-btn pg-btn--secondary">
              Volver a la Tienda
            </Link>
          </div>
        </div>
      ) : (
        /* CHECKOUT FORM */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* STEP 1: CUSTOMER DATA (HU-COM-01) */}
            <div className="pg-card">
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                1. Datos del Comprador
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Nombre Completo:</label>
                  <input
                    type="text"
                    className="pg-input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>RUT:</label>
                  <input
                    type="text"
                    className="pg-input"
                    value={customerRut}
                    onChange={(e) => setCustomerRut(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Correo Electrónico:</label>
                  <input
                    type="email"
                    className="pg-input"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Teléfono de Contacto:</label>
                  <input
                    type="tel"
                    className="pg-input"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: LOGISTICS MODALITY (HU-COM-05) */}
            <div className="pg-card">
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                2. Modalidad de Entrega (Logística)
              </h2>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <label style={{ flex: 1, padding: '12px', border: `2px solid ${deliveryType === 'despacho' ? 'var(--color-identity)' : 'var(--color-border-line)'}`, borderRadius: '6px', cursor: 'pointer', background: deliveryType === 'despacho' ? 'rgba(49, 108, 160, 0.1)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryType === 'despacho'}
                    onChange={() => setDeliveryType('despacho')}
                    style={{ marginRight: '8px' }}
                  />
                  <strong>🚚 Despacho a Domicilio</strong>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    {subtotal >= 50000 ? 'Envío GRATIS (compras sobre $50.000)' : '$3.990 (Courier 24-48 hrs)'}
                  </div>
                </label>

                <label style={{ flex: 1, padding: '12px', border: `2px solid ${deliveryType === 'retiro' ? 'var(--color-identity)' : 'var(--color-border-line)'}`, borderRadius: '6px', cursor: 'pointer', background: deliveryType === 'retiro' ? 'rgba(49, 108, 160, 0.1)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryType === 'retiro'}
                    onChange={() => setDeliveryType('retiro')}
                    style={{ marginRight: '8px' }}
                  />
                  <strong>🏪 Retiro en Tienda ($0)</strong>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    Sin costo en cualquiera de nuestras 3 sucursales
                  </div>
                </label>
              </div>

              {deliveryType === 'despacho' ? (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Dirección Exacta de Despacho:
                  </label>
                  <input
                    type="text"
                    className="pg-input"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Calle, Número, Depto, Comuna, Región"
                    required
                  />
                </div>
              ) : (
                /* SELECTOR OF 3 PHYSICAL BRANCHES (HU-COM-05 CA-02) */
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Selecciona la Sucursal de Retiro:
                  </label>
                  <select
                    className="pg-select"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    {BRANCHES.filter(b => b.id !== 'bodega_web').map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* STEP 3: PAYMENT GATEWAY (HU-COM-06) */}
            <div className="pg-card">
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                3. Pasarela de Pago Segura
              </h2>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                <button
                  type="button"
                  className={`pg-btn ${paymentGateway === 'webpay' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
                  onClick={() => setPaymentGateway('webpay')}
                  style={{ flex: 1 }}
                >
                  🔴 Transbank Webpay Plus
                </button>
                <button
                  type="button"
                  className={`pg-btn ${paymentGateway === 'mercadopago' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
                  onClick={() => setPaymentGateway('mercadopago')}
                  style={{ flex: 1 }}
                >
                  🔵 MercadoPago Chile
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
                <label style={{ padding: '8px', border: '1px solid var(--color-border-line)', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', background: paymentType === 'credito' ? 'rgba(255, 87, 34, 0.15)' : 'transparent', borderColor: paymentType === 'credito' ? 'var(--color-contrast)' : 'var(--color-border-line)' }}>
                  <input
                    type="radio"
                    name="paytype"
                    checked={paymentType === 'credito'}
                    onChange={() => setPaymentType('credito')}
                  />
                  <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>Crédito</div>
                </label>
                <label style={{ padding: '8px', border: '1px solid var(--color-border-line)', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', background: paymentType === 'debito' ? 'rgba(255, 87, 34, 0.15)' : 'transparent', borderColor: paymentType === 'debito' ? 'var(--color-contrast)' : 'var(--color-border-line)' }}>
                  <input
                    type="radio"
                    name="paytype"
                    checked={paymentType === 'debito'}
                    onChange={() => setPaymentType('debito')}
                  />
                  <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>Débito / Redcompra</div>
                </label>
                <label style={{ padding: '8px', border: '1px solid var(--color-border-line)', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', background: paymentType === 'transferencia' ? 'rgba(255, 87, 34, 0.15)' : 'transparent', borderColor: paymentType === 'transferencia' ? 'var(--color-contrast)' : 'var(--color-border-line)' }}>
                  <input
                    type="radio"
                    name="paytype"
                    checked={paymentType === 'transferencia'}
                    onChange={() => setPaymentType('transferencia')}
                  />
                  <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>Transferencia</div>
                </label>
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔒 Cumplimiento estricto con PCI-DSS y encriptación HTTPS/TLS 1.3.</span>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY & ACTIONS */}
          <div className="pg-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid var(--color-border-line)', paddingBottom: '12px', marginBottom: '15px' }}>
              Resumen Final de Pago
            </h2>

            {/* Items summary */}
            <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '15px' }}>
              {cart.map(item => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--color-border-line)' }}>
                  <span>{item.quantity}x {item.product.title} ({item.product.format})</span>
                  <strong>${(item.product.price * item.quantity).toLocaleString('es-CL')}</strong>
                </div>
              ))}
            </div>

            {/* Calculations breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Subtotal Neto:</span>
                <span>${net.toLocaleString('es-CL')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>IVA 19%:</span>
                <span>${tax.toLocaleString('es-CL')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Costo Logístico ({deliveryType === 'retiro' ? 'Retiro $0' : 'Despacho'}):</span>
                <span>{shippingCost === 0 ? 'GRATIS ($0)' : `$${shippingCost.toLocaleString('es-CL')}`}</span>
              </div>
              <div style={{ borderTop: '2px solid var(--color-border-line)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800 }}>
                <span>Total a Pagar:</span>
                <span style={{ color: 'var(--color-contrast)' }}>${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            {errorMessage && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px' }}>
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Payment buttons */}
            <button
              className="pg-btn pg-btn--contrast"
              style={{ width: '100%', padding: '14px', fontSize: '16px', marginBottom: '10px' }}
              disabled={isProcessing}
              onClick={() => handlePay(false)}
            >
              {isProcessing ? 'Conectando con Pasarela...' : `Pagar $${total.toLocaleString('es-CL')} con ${paymentGateway === 'webpay' ? 'Webpay' : 'MercadoPago'}`}
            </button>

            {/* Testing button for CA-04 Payment Rejection simulation */}
            <button
              type="button"
              className="pg-btn pg-btn--secondary pg-btn--sm"
              style={{ width: '100%', color: '#ef4444' }}
              disabled={isProcessing}
              onClick={() => handlePay(true)}
              title="Simula un rechazo bancario para verificar la liberación de inventario (HU-COM-06 CA-04)"
            >
              🧪 Probar Escenario: Pago Rechazado
            </button>
          </div>
        </div>
      )}

      {/* BOLETA ELECTRÓNICA PDF MODAL (HU-COM-07) */}
      {showInvoiceModal && completedOrder && (
        <div className="pg-modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="pg-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#111827', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px', marginBottom: '15px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>PIXEL GAMERS SpA</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>RUT: 76.998.112-K | Giro: Venta de Videojuegos y Licencias</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Santiago, Chile | www.pixelgamers.cl</p>
              </div>
              <div style={{ textAlign: 'right', border: '2px solid #ef4444', padding: '6px 12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444' }}>BOLETA ELECTRÓNICA</div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>N° {completedOrder.invoiceFolio}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>S.I.I. - SANTIAGO CENTRO</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', marginBottom: '15px' }}>
              <strong>Cliente:</strong> {completedOrder.customerName}<br />
              <strong>RUT:</strong> {completedOrder.customerRut}<br />
              <strong>Fecha Emisión:</strong> {new Date(completedOrder.date).toLocaleString('es-CL')}<br />
              <strong>Medio de Pago:</strong> {completedOrder.paymentMethod}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '15px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>Cant.</th>
                  <th style={{ padding: '6px' }}>Descripción</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Precio Unit.</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {completedOrder.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px' }}>{item.quantity}</td>
                    <td style={{ padding: '6px' }}>{item.title} ({item.format})</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${item.price.toLocaleString('es-CL')}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${(item.price * item.quantity).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
                {completedOrder.shippingCost > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px' }}>1</td>
                    <td style={{ padding: '6px' }}>Flete Despacho a Domicilio</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${completedOrder.shippingCost.toLocaleString('es-CL')}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${completedOrder.shippingCost.toLocaleString('es-CL')}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '10px', fontSize: '13px', textAlign: 'right' }}>
              <div>Neto: ${completedOrder.subtotal.toLocaleString('es-CL')}</div>
              <div>IVA 19%: ${completedOrder.tax.toLocaleString('es-CL')}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                TOTAL: ${completedOrder.total.toLocaleString('es-CL')}
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                className="pg-btn pg-btn--primary pg-btn--sm"
                onClick={() => {
                  window.print();
                }}
              >
                🖨️ Imprimir / Guardar en PDF
              </button>
              <button
                className="pg-btn pg-btn--secondary pg-btn--sm"
                style={{ marginLeft: '10px' }}
                onClick={() => setShowInvoiceModal(false)}
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

export default Checkout;
