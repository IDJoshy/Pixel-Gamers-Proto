import React from 'react';
import { useLocation } from 'wouter';
import { useStore } from '../../context/StoreContext';
import '../../styles/role_bar.scss';

const RoleBar = () => {
  const [, setLocation] = useLocation();
  const { currentUser, activeRole, switchUserByRole, resetToFactoryDefaults } = useStore();

  const handleRoleClick = (role, defaultRoute) => {
    switchUserByRole(role);
    if (defaultRoute) {
      setLocation(defaultRoute);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Reiniciar todos los datos locales a los valores de demostración iniciales?')) {
      resetToFactoryDefaults();
      alert('Base de datos local reiniciada con éxito.');
      setLocation('/');
    }
  };

  return (
    <div className="role-bar">
      <div className="role-bar__container">
        <div className="role-bar__left">
          <span className="role-bar__badge">Prototipo 60 HUs</span>
          <span className="role-bar__title">Modo de Rol:</span>
          <div className="role-bar__roles">
            <button
              className={`role-bar__btn ${activeRole === 'comprador' ? 'role-bar__btn--active' : ''}`}
              onClick={() => handleRoleClick('comprador', '/')}
              title="Módulo 1: HU-COM-01 a HU-COM-15"
            >
              🛒 Comprador
            </button>
            <button
              className={`role-bar__btn ${activeRole === 'vendedor' ? 'role-bar__btn--active' : ''}`}
              onClick={() => handleRoleClick('vendedor', '/pos')}
              title="Módulo 2: HU-VEN-01 a HU-VEN-15"
            >
              🏪 Vendedor POS
            </button>
            <button
              className={`role-bar__btn ${activeRole === 'inventario' ? 'role-bar__btn--active' : ''}`}
              onClick={() => handleRoleClick('inventario', '/admin-inventario')}
              title="Módulo 3: HU-INV-01 a HU-INV-15"
            >
              📦 Inventario & Logística
            </button>
            <button
              className={`role-bar__btn ${activeRole === 'admin' ? 'role-bar__btn--active' : ''}`}
              onClick={() => handleRoleClick('admin', '/admin-ti')}
              title="Módulo 4: HU-SIS-01 a HU-SIS-15"
            >
              🛡️ Adm. TI / Sistemas
            </button>
          </div>
        </div>

        <div className="role-bar__right">
          <div className="role-bar__user-info">
            <span>Usuario: <strong>{currentUser?.name}</strong> ({currentUser?.role})</span>
          </div>
          <button className="role-bar__action-btn" onClick={handleReset} title="Restaurar datos de prueba">
            🔄 Reiniciar Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleBar;
