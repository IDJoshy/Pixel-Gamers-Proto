import React, { useState } from 'react';
import { useStore, BRANCHES } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Inventory = () => {
  const {
    db,
    saveProduct,
    deleteProduct,
    importDigitalLicensesBatch,
    restockPhysicalProduct,
    updateOrderLogistics,
    updateTransferStatus
  } = useStore();

  const [activeTab, setActiveTab] = useState('catalogo'); // catalogo | licencias | ingreso | despacho | traspasos | proveedores | reportes

  // PRODUCT EDIT / CREATE MODAL (HU-INV-01)
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '',
    sku: '',
    platform: 'PS5',
    format: 'Físico',
    category: 'Acción',
    price: 59990,
    cost: 35000,
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    description: '',
    specs: '',
    criticalThreshold: 3
  });

  // BATCH DIGITAL LICENSE IMPORT (HU-INV-02)
  const [batchProductId, setBatchProductId] = useState(db.products.find(p => p.format === 'Digital')?.id || db.products[0]?.id);
  const [rawLicensesInput, setRawLicensesInput] = useState('');
  const [batchResult, setBatchResult] = useState(null);

  // PHYSICAL STOCK RESTOCK FORM (HU-INV-03)
  const [restockProduct, setRestockProduct] = useState(db.products[0]?.id || '');
  const [restockBranch, setRestockBranch] = useState('sucursal_1');
  const [restockQty, setRestockQty] = useState(10);
  const [restockCost, setRestockCost] = useState(35000);
  const [restockInvoice, setRestockInvoice] = useState('FAC-SONY-2026-9921');
  const [restockFeedback, setRestockFeedback] = useState('');

  // DISPATCH & PICKING LIST (HU-INV-05, 07, 08)
  const [selectedDispatchOrder, setSelectedDispatchOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('Chilexpress');

  // SUPPLIER CRUD (HU-INV-14)
  const [suppliersList, setSuppliersList] = useState(db.suppliers || []);
  const [newSupplier, setNewSupplier] = useState({ rut: '', name: '', contact: '', phone: '', paymentTerms: '30 días' });
  const [supplierMsg, setSupplierMsg] = useState('');

  // Open product editor
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsCreating(false);
    setProductForm({ ...product });
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsCreating(true);
    setProductForm({
      title: '',
      sku: `PXG-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      platform: 'PS5',
      format: 'Físico',
      category: 'Acción',
      price: 59990,
      cost: 38000,
      status: 'Activo',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      description: 'Nuevo título agregado al catálogo maestro.',
      specs: 'Ficha técnica oficial.',
      criticalThreshold: 3
    });
  };

  const handleSaveProductSubmit = (e) => {
    e.preventDefault();
    saveProduct({
      ...productForm,
      id: editingProduct ? editingProduct.id : undefined,
      price: Number(productForm.price),
      cost: Number(productForm.cost),
      criticalThreshold: Number(productForm.criticalThreshold)
    });
    setEditingProduct(null);
    setIsCreating(false);
  };

  // Submit batch licenses
  const handleBatchImportSubmit = (e) => {
    e.preventDefault();
    if (!rawLicensesInput.trim()) return;
    const res = importDigitalLicensesBatch(batchProductId, rawLicensesInput);
    setBatchResult(res);
    setRawLicensesInput('');
  };

  // Submit physical restock
  const handleRestockSubmit = (e) => {
    e.preventDefault();
    restockPhysicalProduct({
      productId: restockProduct,
      branchId: restockBranch,
      quantity: Number(restockQty),
      unitCost: Number(restockCost),
      invoiceRef: restockInvoice
    });
    setRestockFeedback(`¡Stock reabastecido con éxito! Se incrementaron ${restockQty} unidades.`);
    setTimeout(() => setRestockFeedback(''), 4000);
  };

  // Export report to CSV (HU-INV-15)
  const handleExportCsv = () => {
    const headers = 'SKU,Título,Formato,Plataforma,Precio,Costo,Stock_Tobalaba,Stock_Costanera,Stock_Maipu,Stock_BodegaWeb\n';
    const rows = db.products.map(p =>
      `"${p.sku}","${p.title}","${p.format}","${p.platform}",${p.price},${p.cost},${p.stock.sucursal_1 || 0},${p.stock.sucursal_2 || 0},${p.stock.sucursal_3 || 0},${p.stock.bodega_web || 0}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_inventario_pixel_gamers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pg-page">
      <div className="pg-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span className="pg-header__tag">Módulo 3: Inventario & Logística Omnicanal</span>
          <h1 className="pg-header__title">Panel de Control de Inventario & Envíos</h1>
          <p className="pg-header__subtitle">
            Administración del catálogo maestro, carga cifrada de licencias digitales, despacho de couriers y traspasos.
          </p>
        </div>

        <button className="pg-btn pg-btn--primary" onClick={handleExportCsv}>
          📥 Exportar Catálogo a CSV / Excel
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          className={`pg-btn ${activeTab === 'catalogo' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('catalogo')}
        >
          🎮 Catálogo Maestro (CRUD)
        </button>
        <button
          className={`pg-btn ${activeTab === 'licencias' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('licencias')}
        >
          ⚡ Carga Masiva de Licencias AES-256
        </button>
        <button
          className={`pg-btn ${activeTab === 'ingreso' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('ingreso')}
        >
          📦 Reabastecimiento Físico
        </button>
        <button
          className={`pg-btn ${activeTab === 'despacho' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('despacho')}
        >
          🚚 Despacho & Etiquetas 10x15cm
        </button>
        <button
          className={`pg-btn ${activeTab === 'traspasos' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('traspasos')}
        >
          🔄 Aprobación de Traspasos
        </button>
        <button
          className={`pg-btn ${activeTab === 'proveedores' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('proveedores')}
        >
          🏢 Proveedores & Facturas
        </button>
      </div>

      {/* TAB 1: MASTER CATALOG CRUD (HU-INV-01) */}
      {activeTab === 'catalogo' && (
        <div className="pg-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Productos en el Catálogo ({db.products.length})
            </h2>
            <button className="pg-btn pg-btn--contrast pg-btn--sm" onClick={handleOpenCreate}>
              + Crear Nuevo Producto
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="pg-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Título</th>
                  <th>Plataforma</th>
                  <th>Formato</th>
                  <th>Precio Venta</th>
                  <th>Costo</th>
                  <th>Stock Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {db.products.map(p => {
                  const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);

                  return (
                    <tr key={p.id}>
                      <td><code>{p.sku}</code></td>
                      <td><strong>{p.title}</strong></td>
                      <td>{p.platform}</td>
                      <td>
                        <span className={`pg-badge pg-badge--${p.format.toLowerCase()}`}>
                          {p.format}
                        </span>
                      </td>
                      <td>${p.price.toLocaleString('es-CL')}</td>
                      <td>${p.cost.toLocaleString('es-CL')}</td>
                      <td style={{ fontWeight: 700, color: totalStock > 0 ? '#10b981' : '#ef4444' }}>
                        {totalStock} un.
                      </td>
                      <td>
                        <span className="pg-badge" style={{ background: p.status === 'Activo' ? '#10b981' : p.status === 'Preventa' ? '#f59e0b' : '#64748b' }}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="pg-btn pg-btn--secondary pg-btn--sm"
                            onClick={() => handleOpenEdit(p)}
                          >
                            Editar
                          </button>
                          <button
                            className="pg-btn pg-btn--danger pg-btn--sm"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar ${p.title} del catálogo?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL LICENSE BATCH IMPORT (HU-INV-02, 09) */}
      {activeTab === 'licencias' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {/* UPLOAD BATCH FORM */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Importación de Lotes de Licencias (Cifrado AES-256)
            </h2>

            <form onSubmit={handleBatchImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Seleccionar Producto Digital:</label>
                <select
                  className="pg-select"
                  value={batchProductId}
                  onChange={(e) => setBatchProductId(e.target.value)}
                >
                  {db.products.filter(p => p.format === 'Digital' || p.format === 'DLC').map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>
                  Códigos de Activación (un código por línea o separados por comas):
                </label>
                <textarea
                  className="pg-textarea"
                  rows="6"
                  placeholder="PXG-GOG-9981-2231-A901&#10;PXG-GOG-4412-8821-B892&#10;PXG-GOG-1123-7761-C102"
                  value={rawLicensesInput}
                  onChange={(e) => setRawLicensesInput(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="pg-btn pg-btn--contrast">
                🔐 Procesar, Cifrar y Almacenar Lote
              </button>

              {batchResult && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
                  ✓ Licencias procesadas exitosamente: <strong>{batchResult.imported}</strong><br />
                  ⚠️ Códigos duplicados omitidos: <strong>{batchResult.duplicates}</strong>
                </div>
              )}
            </form>
          </div>

          {/* DIGITAL KEYS VAULT AUDIT (HU-INV-09) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Bóveda de Licencias Cifradas ({db.digitalKeys.length})
            </h2>

            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {db.digitalKeys.map(key => (
                <div key={key.id} style={{ background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--color-border-line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ color: '#38bdf8', fontWeight: 700 }}>{key.code}</code>
                    <span className="pg-badge" style={{ background: key.status === 'available' ? '#10b981' : '#64748b' }}>
                      {key.status === 'available' ? 'Disponible' : 'Asignada'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    SKU: {key.sku} | Hash: <code>{key.encryptedHash}</code>
                  </div>
                  {key.assignedTo && (
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                      Asignada a: {key.assignedTo} (Orden #{key.orderId})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PHYSICAL RESTOCK (HU-INV-03, 04) */}
      {activeTab === 'ingreso' && (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="pg-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px' }}>
              Reabastecimiento de Existencias Físicas por Sucursal
            </h2>

            <form onSubmit={handleRestockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Videojuego a Ingresar:</label>
                <select
                  className="pg-select"
                  value={restockProduct}
                  onChange={(e) => setRestockProduct(e.target.value)}
                >
                  {db.products.filter(p => p.format === 'Físico').map(p => (
                    <option key={p.id} value={p.id}>{p.title} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Sucursal de Destino:</label>
                <select
                  className="pg-select"
                  value={restockBranch}
                  onChange={(e) => setRestockBranch(e.target.value)}
                >
                  {BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Cantidad de Unidades:</label>
                  <input
                    type="number"
                    min="1"
                    className="pg-input"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Costo Unitario ($ Neto):</label>
                  <input
                    type="number"
                    className="pg-input"
                    value={restockCost}
                    onChange={(e) => setRestockCost(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>N° de Factura de Compra / Guía de Proveedor:</label>
                <input
                  type="text"
                  className="pg-input"
                  placeholder="FAC-SONY-2026-9921"
                  value={restockInvoice}
                  onChange={(e) => setRestockInvoice(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="pg-btn pg-btn--primary">
                + Registrar Ingreso y Actualizar Inventario
              </button>

              {restockFeedback && (
                <p style={{ color: '#10b981', fontSize: '13px', textAlign: 'center' }}>
                  {restockFeedback}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: DISPATCH & LABELS 10x15CM (HU-INV-05, 07, 08) */}
      {activeTab === 'despacho' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {/* ORDERS LIST */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Órdenes de Despacho Físico
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {db.orders.filter(o => o.deliveryType === 'despacho').map(order => (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedDispatchOrder(order);
                    setTrackingInput(order.trackingId || '');
                    setCourierInput(order.courierName || 'Chilexpress');
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: selectedDispatchOrder?.id === order.id ? 'rgba(49, 108, 160, 0.2)' : 'rgba(0,0,0,0.1)',
                    border: `1px solid ${selectedDispatchOrder?.id === order.id ? 'var(--color-identity)' : 'var(--color-border-line)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{order.id}</strong>
                    <span className="pg-badge" style={{ background: order.status === 'Entregado' ? '#10b981' : '#3b82f6' }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                    Cliente: {order.customerName} | Destino: {order.shippingAddress}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DISPATCH ACTION & 10x15CM LABEL (HU-INV-05, 07) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Emisión de Etiqueta Térmica 10x15cm y Picking
            </h2>

            {selectedDispatchOrder ? (
              <div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Tracking ID del Courier:</label>
                    <input
                      type="text"
                      className="pg-input"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                    />
                  </div>
                  <div style={{ width: '150px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Courier:</label>
                    <select
                      className="pg-select"
                      value={courierInput}
                      onChange={(e) => setCourierInput(e.target.value)}
                    >
                      <option value="Chilexpress">Chilexpress</option>
                      <option value="Starken">Starken</option>
                      <option value="Blue Express">Blue Express</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    className="pg-btn pg-btn--primary pg-btn--sm"
                    onClick={() => {
                      updateOrderLogistics(selectedDispatchOrder.id, {
                        trackingId: trackingInput,
                        courierName: courierInput,
                        status: 'Enviado'
                      });
                      alert(`Orden #${selectedDispatchOrder.id} marcada como ENVIADA con tracking ${trackingInput}. Notificación disparada.`);
                    }}
                  >
                    📦 Marcar "Enviado / En camino"
                  </button>

                  <button
                    className="pg-btn pg-btn--secondary pg-btn--sm"
                    onClick={() => {
                      updateOrderLogistics(selectedDispatchOrder.id, { status: 'Entregado' });
                      alert(`Orden #${selectedDispatchOrder.id} marcada como ENTREGADA.`);
                    }}
                  >
                    ✓ Marcar "Entregado"
                  </button>
                </div>

                {/* 10x15 CM THERMAL SHIPPING LABEL PREVIEW (HU-INV-05) */}
                <div style={{ background: '#fff', color: '#000', padding: '15px', borderRadius: '4px', border: '2px solid #000', maxWidth: '320px', margin: '0 auto', fontFamily: 'sans-serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '6px' }}>
                    <strong style={{ fontSize: '16px' }}>PIXEL GAMERS</strong>
                    <strong style={{ fontSize: '16px' }}>{courierInput.toUpperCase()}</strong>
                  </div>

                  <div style={{ margin: '10px 0', fontSize: '12px' }}>
                    <strong>DESTINATARIO:</strong><br />
                    {selectedDispatchOrder.customerName}<br />
                    RUT: {selectedDispatchOrder.customerRut}<br />
                    Tel: {selectedDispatchOrder.customerPhone}<br />
                    {selectedDispatchOrder.shippingAddress}
                  </div>

                  <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '11px' }}>
                    <strong>LISTA DE PICKING / ORDEN #{selectedDispatchOrder.id}:</strong>
                    <ul>
                      {selectedDispatchOrder.items.map((i, idx) => (
                        <li key={idx}>{i.quantity}x {i.title} (SKU: {i.sku})</li>
                      ))}
                    </ul>
                  </div>

                  {/* Simulated barcode */}
                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <div style={{ height: '45px', background: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 7px, #fff 7px, #fff 9px)' }} />
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>
                      {trackingInput || selectedDispatchOrder.trackingId}
                    </div>
                  </div>

                  <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <button
                      className="pg-btn pg-btn--primary pg-btn--sm"
                      onClick={() => window.print()}
                    >
                      🖨️ Imprimir Etiqueta (10x15 cm)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
                Selecciona una orden de despacho para emitir etiquetas o gestionar el Tracking ID.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: TRANSFER APPROVALS (HU-INV-12) */}
      {activeTab === 'traspasos' && (
        <div className="pg-card">
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px' }}>
            Consola Central de Traspasos de Stock entre Sucursales ({db.transfers.length})
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table className="pg-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Videojuego</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Cantidad</th>
                  <th>Solicitado Por</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {db.transfers.map(trf => (
                  <tr key={trf.id}>
                    <td><code>{trf.id}</code></td>
                    <td><strong>{trf.productTitle}</strong></td>
                    <td>{BRANCHES.find(b => b.id === trf.sourceBranchId)?.name}</td>
                    <td>{BRANCHES.find(b => b.id === trf.destBranchId)?.name}</td>
                    <td><strong>{trf.quantity} un.</strong></td>
                    <td>{trf.requestedBy}</td>
                    <td>
                      <span className="pg-badge" style={{ background: trf.status === 'Recibido' ? '#10b981' : trf.status === 'En tránsito' ? '#3b82f6' : '#f59e0b' }}>
                        {trf.status}
                      </span>
                    </td>
                    <td>
                      {trf.status === 'Solicitado' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="pg-btn pg-btn--primary pg-btn--sm"
                            onClick={() => updateTransferStatus(trf.id, 'En tránsito')}
                          >
                            Aprobar y Despachar
                          </button>
                          <button
                            className="pg-btn pg-btn--danger pg-btn--sm"
                            onClick={() => updateTransferStatus(trf.id, 'Rechazado')}
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                      {trf.status === 'En tránsito' && (
                        <button
                          className="pg-btn pg-btn--secondary pg-btn--sm"
                          onClick={() => updateTransferStatus(trf.id, 'Recibido')}
                        >
                          Confirmar Recepción
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SUPPLIERS (HU-INV-14) */}
      {activeTab === 'proveedores' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {/* SUPPLIERS LIST */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Proveedores Registrados ({suppliersList.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suppliersList.map(s => (
                <div key={s.id} style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px', border: '1px solid var(--color-border-line)', fontSize: '13px' }}>
                  <strong>{s.name}</strong>
                  <div style={{ color: '#cbd5e1', marginTop: '2px' }}>
                    RUT: {s.rut} | Contacto: {s.contact}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Tel: {s.phone} | Plazo Pago: {s.paymentTerms}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REGISTER NEW SUPPLIER */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Registrar Nuevo Proveedor
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const sup = { ...newSupplier, id: `sup_${Date.now()}` };
                setSuppliersList(prev => [...prev, sup]);
                setSupplierMsg('Proveedor registrado con éxito.');
                setNewSupplier({ rut: '', name: '', contact: '', phone: '', paymentTerms: '30 días' });
                setTimeout(() => setSupplierMsg(''), 3000);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Razón Social / Proveedor:</label>
                <input
                  type="text"
                  className="pg-input"
                  placeholder="Ej: Capcom Latam SpA"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>RUT:</label>
                <input
                  type="text"
                  className="pg-input"
                  placeholder="76.543.210-9"
                  value={newSupplier.rut}
                  onChange={(e) => setNewSupplier({ ...newSupplier, rut: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Correo de Contacto:</label>
                <input
                  type="email"
                  className="pg-input"
                  placeholder="contacto@proveedor.cl"
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Teléfono:</label>
                <input
                  type="tel"
                  className="pg-input"
                  placeholder="+56 2 2345 6789"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                />
              </div>

              <button type="submit" className="pg-btn pg-btn--primary">
                Guardar Proveedor
              </button>

              {supplierMsg && <p style={{ color: '#10b981', fontSize: '12px' }}>{supplierMsg}</p>}
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL (HU-INV-01) */}
      {(isCreating || editingProduct) && (
        <div className="pg-modal-overlay" onClick={() => { setIsCreating(false); setEditingProduct(null); }}>
          <div className="pg-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px' }}>
              {isCreating ? 'Crear Nuevo Videojuego en Catálogo' : `Editar: ${editingProduct.title}`}
            </h3>

            <form onSubmit={handleSaveProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Título:</label>
                  <input
                    type="text"
                    className="pg-input"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>SKU:</label>
                  <input
                    type="text"
                    className="pg-input"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Plataforma:</label>
                  <select
                    className="pg-select"
                    value={productForm.platform}
                    onChange={(e) => setProductForm({ ...productForm, platform: e.target.value })}
                  >
                    <option value="PS5">PS5</option>
                    <option value="Xbox">Xbox</option>
                    <option value="Switch">Switch</option>
                    <option value="PC">PC</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Formato:</label>
                  <select
                    className="pg-select"
                    value={productForm.format}
                    onChange={(e) => setProductForm({ ...productForm, format: e.target.value })}
                  >
                    <option value="Físico">Físico</option>
                    <option value="Digital">Digital</option>
                    <option value="DLC">DLC</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Estado:</label>
                  <select
                    className="pg-select"
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Oculto">Oculto</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Preventa">Preventa</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Precio Venta ($):</label>
                  <input
                    type="number"
                    className="pg-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Costo ($):</label>
                  <input
                    type="number"
                    className="pg-input"
                    value={productForm.cost}
                    onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Umbral Crítico:</label>
                  <input
                    type="number"
                    className="pg-input"
                    value={productForm.criticalThreshold}
                    onChange={(e) => setProductForm({ ...productForm, criticalThreshold: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Descripción:</label>
                <textarea
                  className="pg-textarea"
                  rows="2"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="pg-btn pg-btn--secondary"
                  onClick={() => { setIsCreating(false); setEditingProduct(null); }}
                >
                  Cancelar
                </button>
                <button type="submit" className="pg-btn pg-btn--primary">
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Loader />
    </div>
  );
};

export default Inventory;
