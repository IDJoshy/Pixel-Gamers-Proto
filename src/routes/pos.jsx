import React, { useState, useMemo } from 'react';
import { useStore, BRANCHES } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Pos = () => {
  const {
    db,
    currentUser,
    selectedBranch,
    setSelectedBranch,
    isOfflineMode,
    setIsOfflineMode,
    offlineQueue,
    syncOfflineQueue,
    processPosSale,
    createPhoneReservation,
    cancelPhoneReservation,
    deliverPickupOrder,
    requestStockTransfer,
    restockPhysicalProduct
  } = useStore();

  // POS tabs
  const [activeTab, setActiveTab] = useState('caja'); // caja | inventario | retiro | reservas | traspasos | cierre

  // Cashier Cart state
  const [posCart, setPosCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0); // HU-VEN-11
  const [customerRut, setCustomerRut] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  // Thermal ticket print modal state (HU-VEN-10)
  const [thermalTicket, setThermalTicket] = useState(null);

  // Omnichannel Stock Search state (HU-VEN-01)
  const [stockSearchQuery, setStockSearchQuery] = useState('');

  // Phone reservation form state (HU-VEN-03)
  const [resName, setResName] = useState('');
  const [resRut, setResRut] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resProductId, setResProductId] = useState(db.products[0]?.id || '');
  const [resFeedback, setResFeedback] = useState('');

  // Pickup delivery search state (HU-VEN-07)
  const [pickupSearchQuery, setPickupSearchQuery] = useState('');
  const [selectedPickupOrder, setSelectedPickupOrder] = useState(null);
  const [verifiedIdRut, setVerifiedIdRut] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [deliveryFeedback, setDeliveryFeedback] = useState('');

  // Inter-branch transfer form state (HU-VEN-12)
  const [trfProductId, setTrfProductId] = useState(db.products[0]?.id || '');
  const [trfSourceBranch, setTrfSourceBranch] = useState('sucursal_2');
  const [trfQty, setTrfQty] = useState(1);
  const [trfFeedback, setTrfFeedback] = useState('');

  // Shift Close (Arqueo de Caja) state (HU-VEN-15)
  const [countedCash, setCountedCash] = useState('');
  const [closingReport, setClosingReport] = useState(null);

  // Local newsletter blast form state (HU-VEN-13)
  const [blastSubject, setBlastSubject] = useState('');
  const [blastMessage, setBlastMessage] = useState('');
  const [blastSuccess, setBlastSuccess] = useState('');

  // Current branch info
  const currentBranchInfo = BRANCHES.find(b => b.id === selectedBranch) || BRANCHES[0];

  // Barcode / SKU scan action (HU-VEN-04)
  const handleScanBarcode = (skuToScan) => {
    const sku = (skuToScan || barcodeInput).trim().toUpperCase();
    if (!sku) return;

    const product = db.products.find(p => p.sku.toUpperCase() === sku || p.title.toLowerCase().includes(sku.toLowerCase()));
    if (!product) {
      alert(`⚠️ Código "${sku}" no encontrado en el catálogo.`);
      return;
    }

    // Check branch stock if physical
    const availableStock = product.format === 'Físico' ? (product.stock[selectedBranch] || 0) : product.stock.bodega_web;
    if (availableStock <= 0 && product.status !== 'Preventa') {
      alert(`⚠️ Sin stock disponible en ${currentBranchInfo.name} para ${product.title}.`);
      return;
    }

    // Add to POS Cart
    setPosCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setBarcodeInput('');
  };

  // Process POS sale (HU-VEN-02, 05)
  const handleCheckoutPos = () => {
    if (posCart.length === 0) return;

    const subtotalRaw = posCart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discountAmount = Math.round(subtotalRaw * (discountPercent / 100));

    const items = posCart.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      sku: item.product.sku,
      format: item.product.format,
      quantity: item.quantity,
      price: item.product.price
    }));

    const result = processPosSale({
      items,
      branchId: selectedBranch,
      customerRut: customerRut || '12.345.678-9',
      customerName: customerName || 'Cliente Presencial',
      paymentMethod,
      discountAmount
    });

    if (result.success) {
      // Build thermal ticket for printout
      setThermalTicket({
        orderId: result.orderId,
        invoiceFolio: result.invoiceFolio,
        date: new Date().toISOString(),
        branchName: currentBranchInfo.name,
        branchAddress: currentBranchInfo.address,
        cashierName: currentUser?.name || 'Vendedor en Turno',
        items: posCart,
        subtotal: subtotalRaw,
        discount: discountAmount,
        total: subtotalRaw - discountAmount,
        paymentMethod,
        offline: result.offline
      });

      setPosCart([]);
      setCustomerRut('');
      setCustomerName('');
      setDiscountPercent(0);
    }
  };

  // Submit phone reservation (HU-VEN-03)
  const handleCreateReservation = (e) => {
    e.preventDefault();
    const res = createPhoneReservation({
      customerName: resName,
      customerRut: resRut,
      customerPhone: resPhone,
      productId: resProductId,
      branchId: selectedBranch,
      quantity: 1
    });

    if (res.success) {
      setResFeedback(`¡Reserva ${res.reservation.id} creada con éxito! Stock bloqueado por 30 minutos.`);
      setResName('');
      setResRut('');
      setResPhone('');
    } else {
      setResFeedback(`Error: ${res.message}`);
    }
  };

  // Search pickup orders for counter delivery (HU-VEN-07)
  const pickupOrders = useMemo(() => {
    if (!pickupSearchQuery.trim()) {
      return db.orders.filter(o => o.deliveryType === 'retiro');
    }
    const q = pickupSearchQuery.toLowerCase();
    return db.orders.filter(
      o => o.deliveryType === 'retiro' && (o.id.toLowerCase().includes(q) || o.customerRut.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
    );
  }, [db.orders, pickupSearchQuery]);

  // Execute counter pickup delivery (HU-VEN-07 CA-03, 04, 05)
  const handleConfirmPickupDelivery = () => {
    if (!selectedPickupOrder || !verifiedIdRut || !hasSignature) {
      alert('Debes ingresar el RUT verificado de la cédula y confirmar la firma del cliente.');
      return;
    }
    const res = deliverPickupOrder(selectedPickupOrder.id, { rut: verifiedIdRut });
    setDeliveryFeedback(res.message);
    if (res.success) {
      setTimeout(() => {
        setSelectedPickupOrder(null);
        setVerifiedIdRut('');
        setHasSignature(false);
        setDeliveryFeedback('');
      }, 2000);
    }
  };

  // Shift close calculation (HU-VEN-15)
  const handleExecuteShiftClose = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    const branchSales = db.orders.filter(
      o => o.pickupBranchId === selectedBranch && o.date.startsWith(today) && o.status !== 'Cancelada'
    );

    let cashTotal = 0;
    let cardTotal = 0;
    let transferTotal = 0;
    let physicalCount = 0;
    let digitalCount = 0;

    branchSales.forEach(order => {
      if (order.paymentMethod.includes('Efectivo')) cashTotal += order.total;
      else if (order.paymentMethod.includes('Débito') || order.paymentMethod.includes('Crédito') || order.paymentMethod.includes('POS')) cardTotal += order.total;
      else transferTotal += order.total;

      order.items.forEach(i => {
        if (i.format === 'Físico') physicalCount += i.quantity;
        else digitalCount += i.quantity;
      });
    });

    const theoreticalCash = cashTotal;
    const actualCash = Number(countedCash) || 0;
    const difference = actualCash - theoreticalCash;

    setClosingReport({
      date: new Date().toISOString(),
      branchName: currentBranchInfo.name,
      cashier: currentUser?.name || 'Vendedor en Turno',
      transactionsCount: branchSales.length,
      cashTotal,
      cardTotal,
      transferTotal,
      totalSales: cashTotal + cardTotal + transferTotal,
      physicalCount,
      digitalCount,
      theoreticalCash,
      actualCash,
      difference
    });
  };

  // Local newsletter blast (HU-VEN-13)
  const handleSendBranchEmail = (e) => {
    e.preventDefault();
    setBlastSuccess(`¡Comunicado "${blastSubject}" programado y enviado a los clientes suscritos de ${currentBranchInfo.name}!`);
    setBlastSubject('');
    setBlastMessage('');
    setTimeout(() => setBlastSuccess(''), 4000);
  };

  return (
    <div className="pg-page">
      {/* HEADER & BRANCH SWITCHER */}
      <div className="pg-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span className="pg-header__tag">Módulo 2: Vendedor de Tienda (Punto de Venta)</span>
          <h1 className="pg-header__title">Terminal POS Omnicanal</h1>
          <p className="pg-header__subtitle">
            Caja registradora, control de stock inter-sucursales, ventas presenciales y entregas de retiro.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* BRANCH SELECTOR */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', color: '#94a3b8' }}>Sucursal Actual:</label>
            <select
              className="pg-select"
              style={{ width: '220px', fontWeight: 700 }}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {BRANCHES.filter(b => b.id !== 'bodega_web').map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* OFFLINE CONTINGENCY MODE TOGGLE (HU-VEN-14) */}
          <div style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', color: '#94a3b8' }}>Red POS:</label>
            <button
              className={`pg-btn pg-btn--sm ${isOfflineMode ? 'pg-btn--danger' : 'pg-btn--primary'}`}
              onClick={() => {
                if (isOfflineMode) {
                  // Synchronize
                  const sync = syncOfflineQueue();
                  alert(`Conexión restablecida. Se sincronizaron ${sync.count} ventas offline.`);
                } else {
                  setIsOfflineMode(true);
                }
              }}
              title="Simula caída de internet y contingencia offline con sincronización automática"
            >
              {isOfflineMode ? `⚠️ Offline (${offlineQueue.length} en cola) → Sincronizar` : '🟢 En Línea'}
            </button>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          className={`pg-btn ${activeTab === 'caja' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('caja')}
        >
          🛒 Caja de Cobro POS
        </button>
        <button
          className={`pg-btn ${activeTab === 'inventario' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('inventario')}
        >
          🔍 Existencias Omnicanal
        </button>
        <button
          className={`pg-btn ${activeTab === 'retiro' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('retiro')}
        >
          📦 Entregar Pedidos Retiro
        </button>
        <button
          className={`pg-btn ${activeTab === 'reservas' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('reservas')}
        >
          📞 Reservas Telefónicas
        </button>
        <button
          className={`pg-btn ${activeTab === 'traspasos' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('traspasos')}
        >
          🔄 Traspasos entre Tiendas
        </button>
        <button
          className={`pg-btn ${activeTab === 'cierre' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('cierre')}
        >
          📊 Arqueo y Cierre de Turno
        </button>
      </div>

      {/* TAB 1: CAJA DE COBRO POS (HU-VEN-02, 04, 05, 11) */}
      {activeTab === 'caja' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {/* BARCODE SCANNER & QUICK SKU BAR (HU-VEN-04) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
              Escaneo de Códigos de Barras / SKU
            </h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                className="pg-input"
                placeholder="Escanear o escribir SKU (Ej: PXG-PS5-ELDEN)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleScanBarcode();
                }}
              />
              <button
                type="button"
                className="pg-btn pg-btn--primary"
                onClick={() => handleScanBarcode()}
              >
                Ingresar
              </button>
            </div>

            {/* Quick barcode simulation buttons */}
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
              Simular escaneo de pistola rápida:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {db.products.slice(0, 6).map(p => (
                <button
                  key={p.sku}
                  type="button"
                  className="pg-btn pg-btn--secondary pg-btn--sm"
                  onClick={() => handleScanBarcode(p.sku)}
                  title={`Stock en esta sucursal: ${p.stock[selectedBranch] || 0}`}
                >
                  {p.format === 'Físico' ? '💿' : '⚡'} {p.title.split(':')[0]}
                </button>
              ))}
            </div>

            {/* Items currently in cashier */}
            <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid var(--color-border-line)', paddingBottom: '8px', marginBottom: '12px' }}>
              Productos en Caja ({posCart.reduce((a, b) => a + b.quantity, 0)})
            </h3>

            {posCart.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                Escanea un producto o selecciona un botón rápido para iniciar la venta.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {posCart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--color-border-line)' }}>
                    <div>
                      <strong>{item.product.title}</strong>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {item.product.sku} | {item.product.format} | ${item.product.price.toLocaleString('es-CL')} c/u
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="pg-btn pg-btn--secondary pg-btn--sm"
                        style={{ padding: '2px 8px' }}
                        onClick={() => {
                          if (item.quantity === 1) {
                            setPosCart(posCart.filter(i => i.product.id !== item.product.id));
                          } else {
                            setPosCart(posCart.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity - 1 } : i));
                          }
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                      <button
                        className="pg-btn pg-btn--secondary pg-btn--sm"
                        style={{ padding: '2px 8px' }}
                        onClick={() => {
                          setPosCart(posCart.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity + 1 } : i));
                        }}
                      >
                        +
                      </button>
                      <strong style={{ minWidth: '75px', textAlign: 'right' }}>
                        ${(item.product.price * item.quantity).toLocaleString('es-CL')}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOTAL & PAYMENT CONTROLS (HU-VEN-02, 11) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Cobro y Emisión de Boleta
            </h2>

            {/* Customer data optional */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>RUT Cliente (Opcional):</label>
                <input
                  type="text"
                  className="pg-input"
                  placeholder="12.345.678-9"
                  value={customerRut}
                  onChange={(e) => setCustomerRut(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Nombre Cliente:</label>
                <input
                  type="text"
                  className="pg-input"
                  placeholder="Cliente Presencial"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            {/* AUTHORIZED DISCOUNTS (HU-VEN-11) */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                🏷️ Descuento Autorizado en Caja:
              </label>
              <select
                className="pg-select"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
              >
                <option value="0">Sin Descuento (0%)</option>
                <option value="5">Convenio Estudiante / Gamer Club (5%)</option>
                <option value="10">Promoción Tienda Local (10%)</option>
                <option value="15">Descuento Autorizado Jefatura (15%)</option>
              </select>
            </div>

            {/* PAYMENT METHOD SELECTOR */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                💳 Medio de Pago en Caja:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['Efectivo', 'Tarjeta Débito', 'Tarjeta Crédito'].map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`pg-btn pg-btn--sm ${paymentMethod === m ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
                    onClick={() => setPaymentMethod(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* CALCULATIONS BREAKDOWN */}
            {(() => {
              const subtotalRaw = posCart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
              const discountAmount = Math.round(subtotalRaw * (discountPercent / 100));
              const finalTotal = subtotalRaw - discountAmount;
              const tax = Math.round(finalTotal * 0.19 / 1.19);
              const net = finalTotal - tax;

              return (
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Subtotal:</span>
                    <span>${subtotalRaw.toLocaleString('es-CL')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Descuento ({discountPercent}%):</span>
                      <span>-${discountAmount.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Neto:</span>
                    <span>${net.toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>IVA (19%):</span>
                    <span>${tax.toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{ borderTop: '2px solid var(--color-border-line)', paddingTop: '6px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800 }}>
                    <span>Total a Cobrar:</span>
                    <span style={{ color: 'var(--color-contrast)' }}>${finalTotal.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              );
            })()}

            <button
              className="pg-btn pg-btn--contrast"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              disabled={posCart.length === 0}
              onClick={handleCheckoutPos}
            >
              💵 Cobrar e Imprimir Boleta POS
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: OMNICHANNEL STOCK CHECKER (HU-VEN-01, 09) */}
      {activeTab === 'inventario' && (
        <div className="pg-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Consulta Unificada de Existencias Omnicanal (&lt; 1s)
            </h2>
            <input
              type="text"
              className="pg-input"
              style={{ width: '300px' }}
              placeholder="Filtrar por SKU o título..."
              value={stockSearchQuery}
              onChange={(e) => setStockSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="pg-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Título & Formato</th>
                  <th>Consola</th>
                  <th>Tobalaba</th>
                  <th>Costanera</th>
                  <th>Maipú</th>
                  <th>Bodega Web</th>
                  <th>Estado / Alerta</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {db.products
                  .filter(p => !stockSearchQuery || p.title.toLowerCase().includes(stockSearchQuery.toLowerCase()) || p.sku.toLowerCase().includes(stockSearchQuery.toLowerCase()))
                  .map(p => {
                    const localStock = p.stock[selectedBranch] || 0;
                    const isCritical = p.format === 'Físico' && localStock > 0 && localStock <= p.criticalThreshold;
                    const isZero = p.format === 'Físico' && localStock === 0;

                    return (
                      <tr key={p.id}>
                        <td><code>{p.sku}</code></td>
                        <td>
                          <strong>{p.title}</strong>
                          <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>{p.format}</span>
                        </td>
                        <td>{p.platform}</td>
                        <td style={{ fontWeight: selectedBranch === 'sucursal_1' ? 800 : 400 }}>{p.stock.sucursal_1 || 0}</td>
                        <td style={{ fontWeight: selectedBranch === 'sucursal_2' ? 800 : 400 }}>{p.stock.sucursal_2 || 0}</td>
                        <td style={{ fontWeight: selectedBranch === 'sucursal_3' ? 800 : 400 }}>{p.stock.sucursal_3 || 0}</td>
                        <td>{p.stock.bodega_web || 0}</td>
                        <td>
                          {/* VISUAL STOCK ALERTS (HU-VEN-09) */}
                          {isZero ? (
                            <span className="pg-badge pg-badge--critical">Agotado Local</span>
                          ) : isCritical ? (
                            <span className="pg-badge pg-badge--warning">⚠️ Stock Crítico</span>
                          ) : (
                            <span className="pg-badge pg-badge--success">Disponible</span>
                          )}
                        </td>
                        <td>
                          {/* 1-CLICK RESTOCK REQUEST (HU-VEN-09 CA-03) */}
                          {p.format === 'Físico' && (isZero || isCritical) ? (
                            <button
                              className="pg-btn pg-btn--primary pg-btn--sm"
                              style={{ fontSize: '11px' }}
                              onClick={() => {
                                restockPhysicalProduct({
                                  productId: p.id,
                                  branchId: selectedBranch,
                                  quantity: 5,
                                  unitCost: p.cost,
                                  invoiceRef: 'SOLICITUD-POS-LOCAL'
                                });
                                alert(`Solicitud de reposición enviada a Bodega Central para ${p.title}.`);
                              }}
                            >
                              + Reponer
                            </button>
                          ) : (
                            <button
                              className="pg-btn pg-btn--secondary pg-btn--sm"
                              onClick={() => {
                                setPosCart(prev => [...prev, { product: p, quantity: 1 }]);
                                setActiveTab('caja');
                              }}
                            >
                              Vender
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: IN-STORE PICKUP DELIVERY (HU-VEN-07) */}
      {activeTab === 'retiro' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
              Búsqueda de Órdenes de Retiro en Mostrador
            </h2>
            <input
              type="text"
              className="pg-input"
              placeholder="Buscar por RUT o Número de Pedido..."
              value={pickupSearchQuery}
              onChange={(e) => setPickupSearchQuery(e.target.value)}
              style={{ marginBottom: '15px' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pickupOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedPickupOrder(order)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: selectedPickupOrder?.id === order.id ? 'rgba(49, 108, 160, 0.2)' : 'rgba(0,0,0,0.1)',
                    border: `1px solid ${selectedPickupOrder?.id === order.id ? 'var(--color-identity)' : 'var(--color-border-line)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{order.id}</strong>
                    <span className="pg-badge" style={{ background: order.status === 'Entregada en tienda' ? '#10b981' : '#3b82f6' }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                    Cliente: {order.customerName} (RUT: {order.customerRut})
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Sucursal: {BRANCHES.find(b => b.id === order.pickupBranchId)?.name || 'Cualquiera'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFICATION & HANDOVER FORM (HU-VEN-07 CA-03, 04, 05) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Validación y Entrega en Mostrador
            </h2>

            {selectedPickupOrder ? (
              <div>
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>
                  <strong>Orden:</strong> #{selectedPickupOrder.id}<br />
                  <strong>Cliente:</strong> {selectedPickupOrder.customerName}<br />
                  <strong>RUT Registrado:</strong> {selectedPickupOrder.customerRut}<br />
                  <strong>Estado Actual:</strong> {selectedPickupOrder.status}<br />
                  <strong>Productos:</strong>
                  <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                    {selectedPickupOrder.items.map((it, idx) => (
                      <li key={idx}>{it.quantity}x {it.title} ({it.format})</li>
                    ))}
                  </ul>
                </div>

                {selectedPickupOrder.status === 'Entregada en tienda' ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#a7f3d0', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
                    ✓ Esta orden ya fue entregada presencialmente por {selectedPickupOrder.deliveredBy} el {new Date(selectedPickupOrder.deliveredAt).toLocaleString('es-CL')}.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600 }}>
                        🪪 Validar RUT de Cédula de Identidad en Mano:
                      </label>
                      <input
                        type="text"
                        className="pg-input"
                        placeholder="Ingresa el RUT verificado del cliente..."
                        value={verifiedIdRut}
                        onChange={(e) => setVerifiedIdRut(e.target.value)}
                        required
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={hasSignature}
                        onChange={(e) => setHasSignature(e.target.checked)}
                      />
                      <span>✍️ Firma del cliente y comprobante de retiro recepcionado</span>
                    </label>

                    {deliveryFeedback && (
                      <p style={{ color: deliveryFeedback.includes('éxito') ? '#10b981' : '#ef4444', fontSize: '13px' }}>
                        {deliveryFeedback}
                      </p>
                    )}

                    <button
                      className="pg-btn pg-btn--primary"
                      onClick={handleConfirmPickupDelivery}
                    >
                      Confirmar Entrega en Mostrador
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
                Selecciona una orden de retiro para proceder a la validación de identidad y entrega.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PHONE RESERVATIONS (HU-VEN-03, 08) */}
      {activeTab === 'reservas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {/* CREATE PHONE RESERVATION FORM (HU-VEN-03) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Nueva Reserva Telefónica (Bloqueo por 30 Minutos)
            </h2>

            <form onSubmit={handleCreateReservation} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Nombre del Cliente:</label>
                <input
                  type="text"
                  className="pg-input"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  placeholder="Ej: Matías González"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>RUT del Cliente:</label>
                <input
                  type="text"
                  className="pg-input"
                  value={resRut}
                  onChange={(e) => setResRut(e.target.value)}
                  placeholder="19.876.543-2"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Teléfono:</label>
                <input
                  type="tel"
                  className="pg-input"
                  value={resPhone}
                  onChange={(e) => setResPhone(e.target.value)}
                  placeholder="+56 9 9123 4567"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Videojuego a Reservar:</label>
                <select
                  className="pg-select"
                  value={resProductId}
                  onChange={(e) => setResProductId(e.target.value)}
                >
                  {db.products.filter(p => p.format === 'Físico' && (p.stock[selectedBranch] || 0) > 0).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Stock {currentBranchInfo.name}: {p.stock[selectedBranch]})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="pg-btn pg-btn--primary">
                Bloquear Stock por 30 Minutos
              </button>

              {resFeedback && (
                <p style={{ color: resFeedback.includes('éxito') ? '#10b981' : '#ef4444', fontSize: '12px', marginTop: '6px' }}>
                  {resFeedback}
                </p>
              )}
            </form>
          </div>

          {/* ACTIVE RESERVATIONS & CANCELLATION (HU-VEN-08, 10) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Reservas Telefónicas Activas ({db.phoneReservations.filter(r => r.branchId === selectedBranch).length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {db.phoneReservations.filter(r => r.branchId === selectedBranch).map(res => (
                <div key={res.id} style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px', border: '1px solid var(--color-border-line)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{res.id} — {res.productTitle}</strong>
                    <span className="pg-badge" style={{ background: res.status === 'activa' ? '#f59e0b' : '#ef4444' }}>
                      {res.status}
                    </span>
                  </div>
                  <div style={{ color: '#cbd5e1', marginTop: '4px' }}>
                    Cliente: {res.customerName} | Tel: {res.customerPhone}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Expira a las: {new Date(res.expiresAt).toLocaleTimeString('es-CL')}
                  </div>

                  {res.status === 'activa' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        className="pg-btn pg-btn--danger pg-btn--sm"
                        onClick={() => cancelPhoneReservation(res.id, 'Anulado manualmente por vendedor')}
                      >
                        Anular y Liberar Stock Web
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INTER-BRANCH TRANSFERS (HU-VEN-12, 13) */}
      {activeTab === 'traspasos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {/* REQUEST TRANSFER FORM */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Solicitar Traspaso desde Otra Sucursal
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const res = requestStockTransfer({
                  productId: trfProductId,
                  sourceBranchId: trfSourceBranch,
                  destBranchId: selectedBranch,
                  quantity: Number(trfQty)
                });
                if (res.success) {
                  setTrfFeedback('Solicitud de traspaso enviada exitosamente a la tienda de origen.');
                } else {
                  setTrfFeedback(res.message);
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Videojuego Solicitado:</label>
                <select
                  className="pg-select"
                  value={trfProductId}
                  onChange={(e) => setTrfProductId(e.target.value)}
                >
                  {db.products.filter(p => p.format === 'Físico').map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Sucursal de Origen (que tiene existencias):</label>
                <select
                  className="pg-select"
                  value={trfSourceBranch}
                  onChange={(e) => setTrfSourceBranch(e.target.value)}
                >
                  {BRANCHES.filter(b => b.id !== selectedBranch).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Cantidad a Transferir:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="pg-input"
                  value={trfQty}
                  onChange={(e) => setTrfQty(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="pg-btn pg-btn--primary">
                Enviar Solicitud Electrónica
              </button>

              {trfFeedback && (
                <p style={{ color: trfFeedback.includes('éxito') ? '#10b981' : '#ef4444', fontSize: '12px' }}>
                  {trfFeedback}
                </p>
              )}
            </form>
          </div>

          {/* LOCAL BRANCH NEWSLETTER BLAST (HU-VEN-13) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Comunicado Local a Clientes Suscritos de {currentBranchInfo.name}
            </h2>

            <form onSubmit={handleSendBranchEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Asunto del Evento / Oferta:</label>
                <input
                  type="text"
                  className="pg-input"
                  placeholder="Ej: Torneo EA Sports FC 25 este sábado en tienda"
                  value={blastSubject}
                  onChange={(e) => setBlastSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Mensaje para la Comunidad Local:</label>
                <textarea
                  className="pg-textarea"
                  rows="3"
                  placeholder="Estimados gamers de la sucursal, los invitamos..."
                  value={blastMessage}
                  onChange={(e) => setBlastMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="pg-btn pg-btn--secondary">
                ✉️ Enviar a Clientes con Marketing Activo
              </button>

              {blastSuccess && (
                <p style={{ color: '#10b981', fontSize: '12px' }}>{blastSuccess}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: SHIFT CLOSE & ARQUEO DE CAJA (HU-VEN-15) */}
      {activeTab === 'cierre' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Arqueo y Cierre de Turno en Caja
            </h2>

            <form onSubmit={handleExecuteShiftClose} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Sucursal:</label>
                <input type="text" className="pg-input" value={currentBranchInfo.name} disabled />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Cajero Responsable:</label>
                <input type="text" className="pg-input" value={currentUser?.name || ''} disabled />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Recuento de Efectivo en Caja ($):</label>
                <input
                  type="number"
                  className="pg-input"
                  placeholder="Ingresa el efectivo contado..."
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="pg-btn pg-btn--primary">
                📊 Generar Arqueo y Cuadre de Caja
              </button>
            </form>
          </div>

          {closingReport && (
            <div className="pg-card" style={{ background: '#fff', color: '#111827' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>COMPROBANTE DE CIERRE DE TURNO</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Pixel Gamers — {closingReport.branchName}</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>Fecha: {new Date(closingReport.date).toLocaleString('es-CL')}</p>
              </div>

              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ventas en Efectivo:</span>
                  <strong>${closingReport.cashTotal.toLocaleString('es-CL')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ventas con Tarjetas:</span>
                  <strong>${closingReport.cardTotal.toLocaleString('es-CL')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ventas Transferencias:</span>
                  <strong>${closingReport.transferTotal.toLocaleString('es-CL')}</strong>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800 }}>
                  <span>Total Ventas Turno:</span>
                  <span>${closingReport.totalSales.toLocaleString('es-CL')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span>Juegos Físicos Vendidos:</span>
                  <span>{closingReport.physicalCount} un.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Licencias Digitales Vendidas:</span>
                  <span>{closingReport.digitalCount} un.</span>
                </div>

                {/* Theoretical vs Counted */}
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', marginTop: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Efectivo Teórico Sistema:</span>
                    <span>${closingReport.theoreticalCash.toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Efectivo Contado por Cajero:</span>
                    <span>${closingReport.actualCash.toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: closingReport.difference === 0 ? '#10b981' : closingReport.difference > 0 ? '#3b82f6' : '#ef4444', marginTop: '4px' }}>
                    <span>Diferencia de Caja:</span>
                    <span>${closingReport.difference.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <button
                  className="pg-btn pg-btn--primary pg-btn--sm"
                  onClick={() => window.print()}
                >
                  🖨️ Imprimir Cierre Térmico 80mm
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* THERMAL TICKET PRINT PREVIEW (HU-VEN-10) */}
      {thermalTicket && (
        <div className="pg-modal-overlay" onClick={() => setThermalTicket(null)}>
          <div className="pg-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#000', maxWidth: '380px', fontFamily: 'monospace', fontSize: '12px' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>PIXEL GAMERS</div>
              <div>{thermalTicket.branchName}</div>
              <div>{thermalTicket.branchAddress}</div>
              <div>RUT: 76.998.112-K</div>
              <div style={{ marginTop: '4px' }}>BOLETA DE VENTA N° {thermalTicket.invoiceFolio}</div>
              {thermalTicket.offline && <div style={{ color: 'red', fontWeight: 'bold' }}>[CONTINGENCIA OFFLINE]</div>}
            </div>

            <div>
              <div>Fecha: {new Date(thermalTicket.date).toLocaleString('es-CL')}</div>
              <div>Cajero: {thermalTicket.cashierName}</div>
              <div>Medio de Pago: {thermalTicket.paymentMethod}</div>
            </div>

            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', margin: '10px 0', padding: '6px 0' }}>
              {thermalTicket.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{it.quantity}x {it.product.title.slice(0, 20)}</span>
                  <span>${(it.product.price * it.quantity).toLocaleString('es-CL')}</span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right' }}>
              {thermalTicket.discount > 0 && <div>Desc: -${thermalTicket.discount.toLocaleString('es-CL')}</div>}
              <div style={{ fontSize: '15px', fontWeight: 'bold' }}>TOTAL: ${thermalTicket.total.toLocaleString('es-CL')}</div>
            </div>

            {/* Simulated 80mm QR code */}
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <div style={{ display: 'inline-block', padding: '10px', border: '2px solid #000', borderRadius: '4px', background: '#fff' }}>
                <div style={{ width: '80px', height: '80px', background: 'repeating-linear-gradient(45deg, #000, #000 4px, #fff 4px, #fff 8px)' }} />
              </div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>Validación QR S.I.I. / Orden #{thermalTicket.orderId}</div>
            </div>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button
                className="pg-btn pg-btn--primary pg-btn--sm"
                onClick={() => window.print()}
              >
                🖨️ Imprimir Ticket 80mm
              </button>
              <button
                className="pg-btn pg-btn--secondary pg-btn--sm"
                style={{ marginLeft: '8px' }}
                onClick={() => setThermalTicket(null)}
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

export default Pos;
