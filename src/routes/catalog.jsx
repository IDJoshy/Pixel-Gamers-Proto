import React, { useState, useMemo } from 'react';
import { useStore, BRANCHES } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const Catalog = () => {
  const { db, addToCart, subscribeToStockAlert, addReview } = useStore();

  // Search & Filters state (HU-COM-02)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(80000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('relevance'); // relevance | price_asc | price_desc | release

  // Product Detail Modal state (HU-COM-03)
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Review form state (HU-COM-15)
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Stock alert email state (HU-COM-12)
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');

  // Auto-suggestions computation (HU-COM-02 CA-01: suggestions from 3 chars)
  const suggestions = useMemo(() => {
    if (searchQuery.trim().length < 3) return [];
    return db.products
      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [searchQuery, db.products]);

  // Filtered and sorted products (HU-COM-02)
  const filteredProducts = useMemo(() => {
    return db.products.filter(p => {
      // Exclude hidden products
      if (p.status === 'Oculto' || p.status === 'Inactivo') return false;

      // Search match
      if (searchQuery.trim().length >= 2) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSku && !matchesCat) return false;
      }

      // Platform filter
      if (selectedPlatform !== 'ALL' && p.platform !== selectedPlatform) return false;

      // Format filter
      if (selectedFormat !== 'ALL' && p.format !== selectedFormat) return false;

      // Genre filter
      if (selectedGenre !== 'ALL' && !p.category.includes(selectedGenre)) return false;

      // Price filter
      if (p.price > maxPrice) return false;

      // Stock filter
      if (onlyInStock) {
        const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
        if (totalStock <= 0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'release') return new Date(b.releaseDate) - new Date(a.releaseDate);
      return b.rating - a.rating; // default: relevance/rating
    });
  }, [db.products, searchQuery, selectedPlatform, selectedFormat, selectedGenre, maxPrice, onlyInStock, sortBy]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const res = addReview({
      productId: selectedProduct.id,
      rating: reviewRating,
      comment: reviewComment
    });
    setReviewFeedback(res.message);
    if (res.success) {
      setReviewComment('');
    }
  };

  const handleStockAlertSubmit = (e, productId) => {
    e.preventDefault();
    if (!alertEmail) return;
    const res = subscribeToStockAlert(productId, alertEmail);
    setAlertSuccess(res.message);
    setAlertEmail('');
    setTimeout(() => setAlertSuccess(''), 4000);
  };

  return (
    <div className="pg-page">
      <div className="pg-header">
        <span className="pg-header__tag">Pixel Gamers Store</span>
        <h1 className="pg-header__title">Catálogo Oficial de Videojuegos</h1>
        <p className="pg-header__subtitle">
          Encuentra juegos físicos de colección, licencias digitales con entrega en 1 minuto y preventas exclusivas.
        </p>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR (HU-COM-02) */}
      <div className="pg-card" style={{ marginBottom: '25px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {/* Search bar with instant suggestions */}
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              🔍 Buscar por título o SKU:
            </label>
            <input
              type="text"
              className="pg-input"
              placeholder="Ej: Elden Ring, Zelda, FC 25..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Auto suggestions dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--color-primary)',
                border: '1px solid var(--color-border-line-hover)',
                borderRadius: '6px',
                zIndex: 50,
                marginTop: '4px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
              }}>
                {suggestions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSearchQuery(s.title);
                      setSelectedProduct(s);
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--color-border-line)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px'
                    }}
                  >
                    <span><strong>{s.title}</strong> ({s.platform})</span>
                    <span style={{ color: 'var(--color-contrast)' }}>${s.price.toLocaleString('es-CL')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              🎮 Plataforma:
            </label>
            <select
              className="pg-select"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <option value="ALL">Todas las Consolas</option>
              <option value="PS5">PlayStation 5</option>
              <option value="Xbox">Xbox Series X|S</option>
              <option value="Switch">Nintendo Switch</option>
              <option value="PC">PC Gaming</option>
            </select>
          </div>

          {/* Format filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              💿 Formato:
            </label>
            <select
              className="pg-select"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="ALL">Todos los Formatos</option>
              <option value="Físico">Disco / Cartucho Físico</option>
              <option value="Digital">Licencia Digital Inmediata</option>
              <option value="DLC">DLC / Expansión</option>
            </select>
          </div>

          {/* Genre filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              🏷️ Género:
            </label>
            <select
              className="pg-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="ALL">Todos los Géneros</option>
              <option value="RPG">RPG</option>
              <option value="Acción">Acción</option>
              <option value="Aventura">Aventura</option>
              <option value="Shooter">Shooter</option>
              <option value="Deportes">Deportes</option>
            </select>
          </div>

          {/* Price Range & Sort */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              💰 Precio Máximo: ${maxPrice.toLocaleString('es-CL')}
            </label>
            <input
              type="range"
              min="20000"
              max="80000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Order by */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              ↕️ Ordenar por:
            </label>
            <select
              className="pg-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Mayor Relevancia / Valoración</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="release">Fecha de Lanzamiento</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
            />
            <span>Mostrar únicamente con stock disponible</span>
          </label>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Mostrando <strong>{filteredProducts.length}</strong> de {db.products.length} videojuegos
          </span>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      {filteredProducts.length === 0 ? (
        <div className="pg-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            No se encontraron videojuegos con los filtros seleccionados
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '15px' }}>
            Prueba ajustando los criterios de búsqueda o el rango de precio.
          </p>
          <button
            className="pg-btn pg-btn--primary"
            onClick={() => {
              setSearchQuery('');
              setSelectedPlatform('ALL');
              setSelectedFormat('ALL');
              setSelectedGenre('ALL');
              setMaxPrice(80000);
              setOnlyInStock(false);
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="pg-grid">
          {filteredProducts.map(product => {
            const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);
            const isOutOfStock = totalStock === 0 && product.status !== 'Preventa';
            const isPreorder = product.status === 'Preventa';

            return (
              <div
                key={product.id}
                className="pg-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Header Image & Badges */}
                <div>
                  <div style={{ position: 'relative', height: '180px', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                      <span className={`pg-badge pg-badge--${product.format.toLowerCase()}`}>
                        {product.format === 'Físico' ? '💿 Físico' : product.format === 'Digital' ? '⚡ Clave Digital' : '🧩 DLC'}
                      </span>
                      {isPreorder && <span className="pg-badge pg-badge--preventa">⏳ Preventa</span>}
                    </div>

                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <span style={{
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fbbf24',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        ★ {product.rating}
                      </span>
                    </div>
                  </div>

                  {/* Platform & Title */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-identity)', textTransform: 'uppercase' }}>
                      {product.platform} • {product.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>SKU: {product.sku}</span>
                  </div>

                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '1.3',
                      marginBottom: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.title}
                  </h3>

                  <p style={{ fontSize: '12px', color: '#8892b0', marginBottom: '12px', lineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.description}
                  </p>
                </div>

                {/* Stock Status indicator */}
                <div style={{ borderTop: '1px solid var(--color-border-line)', paddingTop: '10px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px' }}>
                      {isPreorder ? (
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>Cupos de reserva disponibles</span>
                      ) : isOutOfStock ? (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>Sin stock disponible</span>
                      ) : (
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          ✓ Stock total: {totalStock} un.
                        </span>
                      )}
                    </div>
                    <button
                      className="pg-btn pg-btn--secondary pg-btn--sm"
                      onClick={() => setSelectedProduct(product)}
                      title="Ver ficha técnica completa"
                    >
                      Ficha
                    </button>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-contrast)' }}>
                        ${product.price.toLocaleString('es-CL')}
                      </span>
                      <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>
                        IVA Incluido
                      </span>
                    </div>

                    {isOutOfStock ? (
                      <button
                        className="pg-btn pg-btn--secondary pg-btn--sm"
                        onClick={() => setSelectedProduct(product)}
                      >
                        🔔 Avisarme
                      </button>
                    ) : (
                      <button
                        className="pg-btn pg-btn--contrast pg-btn--sm"
                        onClick={() => addToCart(product, 1)}
                      >
                        + Carrito
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED PRODUCT MODAL (HU-COM-03, 12, 15) */}
      {selectedProduct && (
        <div className="pg-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="pg-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <span className={`pg-badge pg-badge--${selectedProduct.format.toLowerCase()}`} style={{ marginRight: '8px' }}>
                  {selectedProduct.format === 'Físico' ? '💿 Juego Físico' : selectedProduct.format === 'Digital' ? '⚡ Licencia Digital Inmediata' : '🧩 DLC Expansión'}
                </span>
                <span className="pg-badge" style={{ background: '#334155', color: '#fff' }}>
                  {selectedProduct.platform}
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '8px' }}>
                  {selectedProduct.title}
                </h2>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>SKU: {selectedProduct.sku} | Clasificación: {selectedProduct.esrb}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '22px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Gallery & Quick Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>

              <div>
                {/* Price Breakdown (HU-COM-03 CA-03) */}
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>Precio Neto:</span>
                    <span>${Math.round(selectedProduct.price / 1.19).toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>IVA (19%):</span>
                    <span>${Math.round(selectedProduct.price - (selectedProduct.price / 1.19)).toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 800, color: 'var(--color-contrast)', marginTop: '4px', borderTop: '1px solid var(--color-border-line)', paddingTop: '4px' }}>
                    <span>Total Final:</span>
                    <span>${selectedProduct.price.toLocaleString('es-CL')}</span>
                  </div>
                </div>

                {/* Stock per physical branch and web (HU-COM-03 CA-03) */}
                <div style={{ fontSize: '12px', marginBottom: '15px' }}>
                  <strong>Disponibilidad por Sucursal:</strong>
                  <ul style={{ listStyle: 'none', padding: '6px 0' }}>
                    {BRANCHES.map(branch => {
                      const count = selectedProduct.stock[branch.id] || 0;
                      return (
                        <li key={branch.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                          <span>• {branch.name}:</span>
                          <span style={{ fontWeight: 700, color: count > 0 ? '#10b981' : '#ef4444' }}>
                            {count > 0 ? `${count} unidades` : 'Agotado'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Action button */}
                {Object.values(selectedProduct.stock).reduce((a, b) => a + b, 0) > 0 || selectedProduct.status === 'Preventa' ? (
                  <button
                    className="pg-btn pg-btn--contrast"
                    style={{ width: '100%' }}
                    onClick={() => {
                      addToCart(selectedProduct, 1);
                      setSelectedProduct(null);
                    }}
                  >
                    🛒 Agregar al Carrito
                  </button>
                ) : (
                  <div>
                    <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Producto actualmente sin stock
                    </p>
                    <form onSubmit={(e) => handleStockAlertSubmit(e, selectedProduct.id)} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="email"
                        className="pg-input"
                        placeholder="Ingresa tu correo..."
                        required
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                      />
                      <button type="submit" className="pg-btn pg-btn--primary pg-btn--sm">
                        Avisarme
                      </button>
                    </form>
                    {alertSuccess && <p style={{ color: '#10b981', fontSize: '11px', marginTop: '4px' }}>{alertSuccess}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Description & Technical Specs */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Descripción</h4>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#cbd5e1', marginBottom: '12px' }}>
                {selectedProduct.description}
              </p>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Ficha Técnica</h4>
              <p style={{ fontSize: '12px', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px', color: '#94a3b8' }}>
                {selectedProduct.specs}
              </p>
            </div>

            {/* Accepted payment methods & Delivery info (HU-COM-03 CA-04) */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '12px' }}>
              <strong>💳 Medios de Pago Aceptados:</strong> Webpay Plus (Crédito / Débito), MercadoPago, Transferencia Bancaria electrónica.<br />
              <strong>🚚 Tiempos de Entrega:</strong> Retiro en tienda presencial inmediato ($0) | Despacho a domicilio 24 a 48 hrs en RM | Códigos digitales: entrega automática en &lt; 1 min por correo.
            </div>

            {/* Verified Reviews Section (HU-COM-15) */}
            <div style={{ borderTop: '1px solid var(--color-border-line)', paddingTop: '15px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>
                Opiniones de Clientes ({db.reviews.filter(r => r.productId === selectedProduct.id).length})
              </h4>

              {/* Existing Reviews */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '15px' }}>
                {db.reviews.filter(r => r.productId === selectedProduct.id).length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>Aún no hay opiniones para este videojuego. ¡Sé el primero!</p>
                ) : (
                  db.reviews.filter(r => r.productId === selectedProduct.id).map(rev => (
                    <div key={rev.id} style={{ borderBottom: '1px solid var(--color-border-line)', padding: '8px 0', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{rev.userName}</strong>
                          {rev.verifiedPurchase && (
                            <span style={{ marginLeft: '8px', color: '#10b981', fontSize: '11px', fontWeight: 700 }}>
                              ✓ Compra Verificada
                            </span>
                          )}
                        </div>
                        <span style={{ color: '#fbbf24' }}>{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p style={{ color: '#cbd5e1', marginTop: '4px' }}>{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add review form for verified purchases */}
              <form onSubmit={handleReviewSubmit} style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '6px' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Dejar calificación (Usuarios con compra verificada)
                </h5>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px' }}>Puntuación:</label>
                  <select
                    className="pg-select"
                    style={{ width: '120px' }}
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                  >
                    <option value="5">★★★★★ (5)</option>
                    <option value="4">★★★★☆ (4)</option>
                    <option value="3">★★★☆☆ (3)</option>
                    <option value="2">★★☆☆☆ (2)</option>
                    <option value="1">★☆☆☆☆ (1)</option>
                  </select>
                </div>
                <textarea
                  className="pg-textarea"
                  rows="2"
                  placeholder="Escribe tu opinión sobre el videojuego (máximo 500 caracteres)..."
                  maxLength={500}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {500 - reviewComment.length} caracteres restantes
                  </span>
                  <button type="submit" className="pg-btn pg-btn--primary pg-btn--sm">
                    Publicar Opinión
                  </button>
                </div>
                {reviewFeedback && (
                  <p style={{ fontSize: '12px', marginTop: '6px', color: reviewFeedback.includes('éxito') ? '#10b981' : '#ef4444' }}>
                    {reviewFeedback}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      <Loader />
    </div>
  );
};

export default Catalog;
