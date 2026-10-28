import { Suspense, lazy, useEffect } from 'react';
import { Route, Router, Switch, useLocation } from 'wouter';
import { StoreProvider } from './context/StoreContext';

// Components
import Menus from './components/menus/menus';
import RoleBar from './components/role_bar/RoleBar';
import FixedFooter from './components/fixed_footer/fixed_footer';
const Footer = lazy(() => import('./components/footer/footer'));

// Routes
import NotFound from './routes/notfound';
import About from './routes/about';
import Locations from './routes/locations';
import Contact from './routes/contact';
import Catalog from './routes/catalog';
import Cart from './routes/cart';
import Checkout from './routes/checkout';
import Orders from './routes/orders';
import Tracking from './routes/tracking';
import RedemptionGuide from './routes/redemption_guide';
import Pos from './routes/pos';
import Inventory from './routes/inventory';
import SystemAdmin from './routes/system_admin';
import Login from './routes/login';
import Signup from './routes/signup';
import Policy from './routes/policy';

const ScrollToTop = () => {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [location]);

  return null;
};

function App() {
  return (
    <StoreProvider>
      <Router hook={undefined}>
        <RoleBar />
        <Menus />
        <FixedFooter />
        <ScrollToTop />

        <Switch>
          {/* Módulo 1: Comprador */}
          <Route path="/" component={Catalog} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/orders" component={Orders} />
          <Route path="/account" component={Orders} />
          <Route path="/favorites" component={Catalog} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/guia-canje" component={RedemptionGuide} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />

          {/* Módulo 2: Vendedor de Tienda POS */}
          <Route path="/pos" component={Pos} />

          {/* Módulo 3: Administrador de Inventario y Logística */}
          <Route path="/admin-inventario" component={Inventory} />

          {/* Módulo 4: Administrador del Sistema / TI */}
          <Route path="/admin-ti" component={SystemAdmin} />

          {/* Información Institucional */}
          <Route path="/locations" component={Locations} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />

          {/* Políticas */}
          <Route path="/policy/:type" component={Policy} />

          {/* 404 */}
          <Route component={NotFound} />
        </Switch>

        <Suspense fallback={<></>}>
          <Footer />
        </Suspense>
      </Router>
    </StoreProvider>
  );
}

export default App;
