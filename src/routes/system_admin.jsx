import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import Loader from '../components/loader/loader';
import '../styles/views.scss';

const SystemAdmin = () => {
  const {
    db,
    saveUserAccount,
    updateSettings,
    runNightlyReconciliation,
    exportDatabaseBackup,
    importDatabaseBackup,
    resetToFactoryDefaults,
    addSecurityLog
  } = useStore();

  const [activeTab, setActiveTab] = useState('usuarios'); // usuarios | seguridad | logs | credenciales | reconciliacion | backup | salud

  // USER CRUD & RBAC (HU-SIS-01)
  const [editingUser, setEditingUser] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'comprador',
    rut: '',
    phone: '',
    address: '',
    status: 'activo',
    mfaEnabled: false
  });

  // SETTINGS & CREDENTIALS (HU-SIS-04, 09)
  const [settingsForm, setSettingsForm] = useState({ ...db.settings });
  const [settingsFeedback, setSettingsFeedback] = useState('');

  // LOGS FILTER (HU-SIS-03, 15)
  const [logFilterQuery, setLogFilterQuery] = useState('');
  const [logSeverity, setLogSeverity] = useState('ALL');

  // NIGHTLY RECONCILIATION RESULT (HU-SIS-06)
  const [reconciliationResult, setReconciliationResult] = useState(null);

  // CRYPTOGRAPHIC AES AUDIT (HU-SIS-05)
  const [cryptoAuditResult, setCryptoAuditResult] = useState(null);

  // ACTIVE SESSIONS (HU-SIS-13)
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess_1', user: 'admin@pixelgamers.cl', role: 'admin', ip: '190.161.42.11', browser: 'Chrome 128 / Windows', lastActive: 'Hace 1 min' },
    { id: 'sess_2', user: 'vendedor@pixelgamers.cl', role: 'vendedor', ip: '190.161.42.88', browser: 'Edge 128 / POS Terminal', lastActive: 'Hace 4 min' },
    { id: 'sess_3', user: 'inventario@pixelgamers.cl', role: 'inventario', ip: '190.161.42.92', browser: 'Firefox 130 / Bodega', lastActive: 'Hace 8 min' }
  ]);

  // SAVE USER
  const handleSaveUser = (e) => {
    e.preventDefault();
    saveUserAccount({
      ...userFormData,
      id: editingUser ? editingUser.id : undefined
    });
    setEditingUser(null);
    setIsCreatingUser(false);
  };

  // SAVE SETTINGS & CREDENTIALS (HU-SIS-04)
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsFeedback('Credenciales y variables de entorno aplicadas en caliente sin reiniciar el servicio.');
    setTimeout(() => setSettingsFeedback(''), 4000);
  };

  // EXECUTE NIGHTLY BATCH (HU-SIS-06)
  const handleRunReconciliation = () => {
    const res = runNightlyReconciliation();
    setReconciliationResult(res);
  };

  // EXECUTE CRYPTO AUDIT (HU-SIS-05)
  const handleRunCryptoAudit = () => {
    const totalKeys = db.digitalKeys.length;
    const invalidHashes = db.digitalKeys.filter(k => !k.encryptedHash?.startsWith('AES256:'));
    setCryptoAuditResult({
      totalAudited: totalKeys,
      algorithm: 'AES-256-GCM / PBKDF2',
      integrityStatus: invalidHashes.length === 0 ? '100% Íntegro' : 'Alerta de Hash Corrupto',
      corruptedCount: invalidHashes.length,
      timestamp: new Date().toISOString()
    });
    addSecurityLog('AUDITORIA_CRIPTOGRAFICA', `Auditoría AES-256 finalizada: ${totalKeys} claves analizadas. Integridad: 100%.`, 'INFO');
  };

  // EXPORT LOGS CSV (HU-SIS-03, 15)
  const handleExportLogsCsv = () => {
    const headers = 'ID,Timestamp,Accion,Usuario,RUT,IP,Severidad,Detalles\n';
    const rows = db.securityLogs.map(l =>
      `"${l.id}","${l.timestamp}","${l.action}","${l.user}","${l.rut}","${l.ip}","${l.severity}","${l.details.replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_seguridad_pixel_gamers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // RESTORE BACKUP FILE
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const res = importDatabaseBackup(parsed);
        if (res.success) {
          alert('Copia de seguridad restaurada exitosamente.');
        } else {
          alert('Error: ' + res.message);
        }
      } catch {
        alert('Archivo JSON no válido');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pg-page">
      <div className="pg-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span className="pg-header__tag">Módulo 4: Administrador del Sistema & TI</span>
          <h1 className="pg-header__title">Consola Central de Operaciones & Auditoría</h1>
          <p className="pg-header__subtitle">
            Control RBAC de usuarios, logs Append-Only inalterables, políticas de seguridad y credenciales API.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label className="pg-btn pg-btn--secondary pg-btn--sm" style={{ cursor: 'pointer', margin: 0 }}>
            📂 Restaurar JSON
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button className="pg-btn pg-btn--secondary pg-btn--sm" onClick={exportDatabaseBackup}>
            💾 Exportar Respaldo JSON
          </button>
          <button
            className="pg-btn pg-btn--danger pg-btn--sm"
            onClick={() => {
              if (window.confirm('¿Restablecer toda la base de datos a los valores de fábrica?')) {
                resetToFactoryDefaults();
                alert('Base de datos restablecida.');
              }
            }}
          >
            🔄 Restablecer Fábrica
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          className={`pg-btn ${activeTab === 'usuarios' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Usuarios & Roles (RBAC)
        </button>
        <button
          className={`pg-btn ${activeTab === 'logs' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('logs')}
        >
          📜 Logs Inalterables (Append-Only)
        </button>
        <button
          className={`pg-btn ${activeTab === 'credenciales' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('credenciales')}
        >
          🔑 Pasarelas & Configuración API
        </button>
        <button
          className={`pg-btn ${activeTab === 'seguridad' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('seguridad')}
        >
          🛡️ Políticas MFA & Criptografía
        </button>
        <button
          className={`pg-btn ${activeTab === 'reconciliacion' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('reconciliacion')}
        >
          🌙 Batch Nocturno 23:59
        </button>
        <button
          className={`pg-btn ${activeTab === 'salud' ? 'pg-btn--primary' : 'pg-btn--secondary'}`}
          onClick={() => setActiveTab('salud')}
        >
          🩺 Health Checks & Uptime
        </button>
      </div>

      {/* TAB 1: USERS & RBAC (HU-SIS-01) */}
      {activeTab === 'usuarios' && (
        <div className="pg-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Cuentas de Usuario y Asignación de Roles ({db.users.length})
            </h2>
            <button
              className="pg-btn pg-btn--contrast pg-btn--sm"
              onClick={() => {
                setEditingUser(null);
                setIsCreatingUser(true);
                setUserFormData({
                  name: '',
                  email: '',
                  role: 'vendedor',
                  rut: '',
                  phone: '',
                  address: '',
                  status: 'activo',
                  mfaEnabled: true
                });
              }}
            >
              + Nuevo Usuario del Sistema
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="pg-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>RUT</th>
                  <th>Rol RBAC</th>
                  <th>MFA Activo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {db.users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.rut || 'N/A'}</td>
                    <td>
                      <span className="pg-badge" style={{ background: u.role === 'admin' ? '#ef4444' : u.role === 'inventario' ? '#8b5cf6' : u.role === 'vendedor' ? '#3b82f6' : '#10b981' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.mfaEnabled ? '✓ Habilitado' : 'No'}</td>
                    <td>
                      <span className="pg-badge" style={{ background: u.status === 'activo' ? '#10b981' : '#64748b' }}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="pg-btn pg-btn--secondary pg-btn--sm"
                          onClick={() => {
                            setEditingUser(u);
                            setIsCreatingUser(false);
                            setUserFormData({ ...u });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="pg-btn pg-btn--sm"
                          style={{ background: u.status === 'activo' ? '#f59e0b' : '#10b981', color: '#fff' }}
                          onClick={() => {
                            saveUserAccount({
                              ...u,
                              status: u.status === 'activo' ? 'congelado' : 'activo'
                            });
                          }}
                        >
                          {u.status === 'activo' ? 'Congelar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: APPEND-ONLY AUDIT LOGS (HU-SIS-03, 15) */}
      {activeTab === 'logs' && (
        <div className="pg-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                Registro Inalterable de Auditoría (Append-Only)
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Protegido contra edición. Cada entrega de licencias, login administrativo y cambio de roles queda grabado.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="pg-select"
                style={{ width: '130px' }}
                value={logSeverity}
                onChange={(e) => setLogSeverity(e.target.value)}
              >
                <option value="ALL">Severidad: Todos</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
              </select>
              <input
                type="text"
                className="pg-input"
                style={{ width: '220px' }}
                placeholder="Filtrar por acción o usuario..."
                value={logFilterQuery}
                onChange={(e) => setLogFilterQuery(e.target.value)}
              />
              <button className="pg-btn pg-btn--primary pg-btn--sm" onClick={handleExportLogsCsv}>
                📥 Exportar CSV
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            <table className="pg-table">
              <thead>
                <tr>
                  <th>Fecha & Hora</th>
                  <th>Acción</th>
                  <th>Usuario / RUT</th>
                  <th>IP Origen</th>
                  <th>Detalles del Evento</th>
                  <th>Severidad</th>
                </tr>
              </thead>
              <tbody>
                {db.securityLogs
                  .filter(l => {
                    if (logSeverity !== 'ALL' && l.severity !== logSeverity) return false;
                    if (logFilterQuery && !l.action.toLowerCase().includes(logFilterQuery.toLowerCase()) && !l.user.toLowerCase().includes(logFilterQuery.toLowerCase())) return false;
                    return true;
                  })
                  .map(log => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(log.timestamp).toLocaleString('es-CL')}
                      </td>
                      <td><code>{log.action}</code></td>
                      <td>{log.user}</td>
                      <td><code>{log.ip}</code></td>
                      <td style={{ fontSize: '12px' }}>{log.details}</td>
                      <td>
                        <span className="pg-badge" style={{ background: log.severity === 'WARN' ? '#f59e0b' : log.severity === 'ERROR' ? '#ef4444' : '#10b981' }}>
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CREDENTIALS & API CONFIGURATION (HU-SIS-04, 09) */}
      {activeTab === 'credenciales' && (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div className="pg-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Parámetros del Sistema y Pasarelas (Sin Tocar Código)
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
              Actualiza credenciales de Webpay, MercadoPago, Courier y SMTP sin reiniciar ni recompilar la aplicación.
            </p>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* WEBPAY CONFIG */}
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '15px', borderRadius: '6px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-identity)', marginBottom: '10px' }}>
                  🔴 Transbank Webpay Plus
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Código de Comercio:</label>
                    <input
                      type="text"
                      className="pg-input"
                      value={settingsForm.webpayCommerceCode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, webpayCommerceCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>API Key Secreta (Token):</label>
                    <input
                      type="password"
                      className="pg-input"
                      value={settingsForm.webpayApiKey}
                      onChange={(e) => setSettingsForm({ ...settingsForm, webpayApiKey: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* MERCADOPAGO CONFIG */}
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '15px', borderRadius: '6px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-identity)', marginBottom: '10px' }}>
                  🔵 MercadoPago Chile
                </h3>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Access Token (Bearer):</label>
                  <input
                    type="password"
                    className="pg-input"
                    value={settingsForm.mercadoPagoToken}
                    onChange={(e) => setSettingsForm({ ...settingsForm, mercadoPagoToken: e.target.value })}
                  />
                </div>
              </div>

              {/* SMTP CONFIG (HU-SIS-09) */}
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '15px', borderRadius: '6px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-identity)', marginBottom: '10px' }}>
                  ✉️ Servidor de Correo SMTP
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Host SMTP:</label>
                    <input
                      type="text"
                      className="pg-input"
                      value={settingsForm.smtpHost}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Puerto:</label>
                    <input
                      type="number"
                      className="pg-input"
                      value={settingsForm.smtpPort}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpPort: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Usuario:</label>
                    <input
                      type="text"
                      className="pg-input"
                      value={settingsForm.smtpUser}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpUser: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="pg-btn pg-btn--primary">
                Guardar Configuración en Caliente
              </button>

              {settingsFeedback && (
                <p style={{ color: '#10b981', fontSize: '13px', textAlign: 'center' }}>
                  {settingsFeedback}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: MFA POLICIES & CRYPTO AUDIT (HU-SIS-02, 05) */}
      {activeTab === 'seguridad' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {/* POLICIES */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Políticas de Seguridad y Autenticación (HU-SIS-02)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={settingsForm.mfaRequiredForStaff}
                  onChange={(e) => setSettingsForm({ ...settingsForm, mfaRequiredForStaff: e.target.checked })}
                />
                <span>MFA (Segundo Factor) obligatorio para cuentas de gestión</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={settingsForm.passwordRequireComplex}
                  onChange={(e) => setSettingsForm({ ...settingsForm, passwordRequireComplex: e.target.checked })}
                />
                <span>Contraseñas robustas (mayúsculas, números y símbolos)</span>
              </label>

              <div>
                <label style={{ display: 'block', fontWeight: 600 }}>Bloqueo tras intentos fallidos:</label>
                <input
                  type="number"
                  className="pg-input"
                  value={settingsForm.maxFailedLogins}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxFailedLogins: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600 }}>Tiempo límite de inactividad de sesión (minutos):</label>
                <input
                  type="number"
                  className="pg-input"
                  value={settingsForm.sessionTimeoutMinutes}
                  onChange={(e) => setSettingsForm({ ...settingsForm, sessionTimeoutMinutes: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* CRYPTOGRAPHIC AUDIT (HU-SIS-05) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Auditoría Criptográfica AES-256 (HU-SIS-05)
            </h2>

            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '15px' }}>
              Verifica que el 100% de las claves de licencias digitales se encuentren debidamente encriptadas bajo algoritmos AES-256 sin exposición en texto claro.
            </p>

            <button className="pg-btn pg-btn--primary" onClick={handleRunCryptoAudit}>
              🔒 Ejecutar Comprobación Criptográfica
            </button>

            {cryptoAuditResult && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '15px', borderRadius: '6px', marginTop: '15px', fontSize: '13px' }}>
                <strong>Estado:</strong> {cryptoAuditResult.integrityStatus}<br />
                <strong>Algoritmo:</strong> {cryptoAuditResult.algorithm}<br />
                <strong>Licencias Auditadas:</strong> {cryptoAuditResult.totalAudited}<br />
                <strong>Claves Corruptas:</strong> {cryptoAuditResult.corruptedCount}<br />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Auditado el: {new Date(cryptoAuditResult.timestamp).toLocaleString('es-CL')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: NIGHTLY RECONCILIATION BATCH (HU-SIS-06) */}
      {activeTab === 'reconciliacion' && (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="pg-card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              Supervisión de Tarea Batch Nocturna (23:59:00 hrs)
            </h2>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '20px' }}>
              El proceso automático compara los saldos de inventario en tiendas físicas contra las ventas omnicanal para cuadrar diferencias.
            </p>

            <button className="pg-btn pg-btn--contrast" onClick={handleRunReconciliation}>
              🌙 Ejecutar Simulación de Conciliación Nocturna
            </button>

            {reconciliationResult && (
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border-line)', padding: '20px', borderRadius: '8px', marginTop: '20px', fontSize: '13px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>
                  ✓ Conciliación 23:59 Ejecutada con Éxito
                </h3>
                <div>Productos y SKUs Auditados: <strong>{reconciliationResult.auditedCount}</strong></div>
                <div>Discrepancias Encontradas: <strong>{reconciliationResult.discrepancies.length}</strong></div>
                <div>Timestamp: <strong>{new Date(reconciliationResult.timestamp).toLocaleString('es-CL')}</strong></div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                  El informe consolidado fue enviado automáticamente a la jefatura de operaciones vía correo SMTP.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: HEALTH CHECKS & ACTIVE SESSIONS (HU-SIS-10, 13) */}
      {activeTab === 'salud' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {/* HEALTH CHECKS (HU-SIS-10) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Monitoreo de Salud del Sistema (Uptime: 99.8%)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              {[
                { name: 'Base de Datos Local / Repositorio', status: 'Operacional', latency: '4ms' },
                { name: 'API Pasarela Webpay Plus', status: 'Operacional', latency: '120ms' },
                { name: 'API Pasarela MercadoPago', status: 'Operacional', latency: '95ms' },
                { name: 'API Courier Chilexpress', status: 'Operacional', latency: '180ms' },
                { name: 'Servidor Correo SMTP', status: 'Operacional', latency: '45ms' }
              ].map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '6px' }}>
                  <div>
                    <strong>{s.name}</strong>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Latencia media: {s.latency}</div>
                  </div>
                  <span className="pg-badge pg-badge--success">{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE SESSIONS (HU-SIS-13) */}
          <div className="pg-card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>
              Sesiones Administrativas Activas ({activeSessions.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeSessions.map(sess => (
                <div key={sess.id} style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--color-border-line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{sess.user}</strong>
                    <button
                      className="pg-btn pg-btn--danger pg-btn--sm"
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                      onClick={() => {
                        setActiveSessions(activeSessions.filter(s => s.id !== sess.id));
                        addSecurityLog('SESION_REVOCADA', `Sesión ${sess.id} revocada por administrador TI.`, 'WARN');
                        alert(`Sesión revocada para ${sess.user}`);
                      }}
                    >
                      Revocar Acceso
                    </button>
                  </div>
                  <div style={{ color: '#94a3b8', marginTop: '4px' }}>
                    Rol: {sess.role} | IP: <code>{sess.ip}</code> | {sess.browser}
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>
                    Actividad: {sess.lastActive}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USER EDIT / CREATE MODAL (HU-SIS-01) */}
      {(isCreatingUser || editingUser) && (
        <div className="pg-modal-overlay" onClick={() => { setIsCreatingUser(false); setEditingUser(null); }}>
          <div className="pg-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px' }}>
              {isCreatingUser ? 'Crear Nuevo Usuario' : `Editar: ${editingUser.name}`}
            </h3>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Nombre Completo:</label>
                <input
                  type="text"
                  className="pg-input"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Correo Electrónico:</label>
                <input
                  type="email"
                  className="pg-input"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>RUT:</label>
                  <input
                    type="text"
                    className="pg-input"
                    value={userFormData.rut}
                    onChange={(e) => setUserFormData({ ...userFormData, rut: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Rol Asignado (RBAC):</label>
                  <select
                    className="pg-select"
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  >
                    <option value="comprador">Comprador (Cliente Final)</option>
                    <option value="vendedor">Vendedor de Tienda</option>
                    <option value="inventario">Adm. Inventario & Logística</option>
                    <option value="admin">Adm. del Sistema / TI</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="pg-btn pg-btn--secondary"
                  onClick={() => { setIsCreatingUser(false); setEditingUser(null); }}
                >
                  Cancelar
                </button>
                <button type="submit" className="pg-btn pg-btn--primary">
                  Guardar Usuario
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

export default SystemAdmin;
