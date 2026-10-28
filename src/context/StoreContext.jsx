import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'PIXEL_GAMERS_DB_V2';

// 3 Physical Stores as specified in locations.jsx and HDUs:
export const BRANCHES = [
  { id: 'sucursal_1', name: 'Mallplaza Tobalaba', address: 'Av. Camilo Henríquez 3692, Local 1010, Puente Alto' },
  { id: 'sucursal_2', name: 'Costanera Center', address: 'Av. Andrés Bello 2447, Local 4009, Providencia' },
  { id: 'sucursal_3', name: 'Arauco Maipú', address: 'Av. Américo Vespucio 399, Local 300, Maipú' },
  { id: 'bodega_web', name: 'Bodega Central Web', address: 'Centro de Distribución Santiago Norte' }
];

const INITIAL_USERS = [
  {
    id: 'usr_1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    passwordHash: 'scrypt_demo_hash_981273918237',
    role: 'comprador',
    rut: '18.234.567-8',
    phone: '+56 9 8765 4321',
    address: 'Av. Providencia 1234, Depto 402, Providencia, RM',
    newsletter: true,
    mfaEnabled: false,
    status: 'activo',
    preferredBranch: 'sucursal_2',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'usr_2',
    name: 'Carlos Ramos (Vendedor)',
    email: 'vendedor@pixelgamers.cl',
    passwordHash: 'scrypt_demo_hash_981273918238',
    role: 'vendedor',
    branchId: 'sucursal_1',
    rut: '16.543.210-K',
    phone: '+56 9 7654 3210',
    address: 'Av. Camilo Henríquez 3692, Puente Alto',
    newsletter: false,
    mfaEnabled: false,
    status: 'activo',
    preferredBranch: 'sucursal_1',
    createdAt: '2026-01-15T09:30:00Z'
  },
  {
    id: 'usr_3',
    name: 'Roberto Soto (Inventario & Logística)',
    email: 'inventario@pixelgamers.cl',
    passwordHash: 'scrypt_demo_hash_981273918239',
    role: 'inventario',
    rut: '14.890.123-4',
    phone: '+56 9 6543 2109',
    address: 'Bodega Central E-Commerce, Quilicura',
    newsletter: false,
    mfaEnabled: true,
    status: 'activo',
    preferredBranch: 'bodega_web',
    createdAt: '2026-01-05T08:00:00Z'
  },
  {
    id: 'usr_4',
    name: 'Diego Morales (Admin TI / Sistemas)',
    email: 'admin@pixelgamers.cl',
    passwordHash: 'scrypt_demo_hash_981273918240',
    role: 'admin',
    rut: '12.345.678-9',
    phone: '+56 9 5432 1098',
    address: 'Oficinas Centrales Pixel Gamers, Las Condes',
    newsletter: false,
    mfaEnabled: true,
    status: 'activo',
    preferredBranch: 'bodega_web',
    createdAt: '2026-01-01T08:00:00Z'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    sku: 'PXG-PS5-ELDEN',
    title: 'Elden Ring: Shadow of the Erdtree Edition',
    platform: 'PS5',
    format: 'Físico', // Físico | Digital | DLC
    category: 'RPG / Acción',
    price: 64990,
    cost: 42000,
    rating: 4.9,
    ratingCount: 42,
    releaseDate: '2024-06-21',
    esrb: 'Mature 17+',
    status: 'Activo', // Activo | Oculto | Inactivo | Preventa
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    description: 'La aclamada aventura de rol y fantasía oscura de FromSoftware y George R.R. Martin. Incluye el juego base y la masiva expansión Shadow of the Erdtree.',
    specs: 'Resolución: 4K dinámico 60fps | Idioma: Voces inglés, subtítulos español | Almacenamiento: 80 GB',
    stock: {
      sucursal_1: 5,
      sucursal_2: 8,
      sucursal_3: 4,
      bodega_web: 25
    },
    criticalThreshold: 3
  },
  {
    id: 'prod_2',
    sku: 'PXG-SWI-ZELDA',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    platform: 'Switch',
    format: 'Físico',
    category: 'Aventura',
    price: 59990,
    cost: 39000,
    rating: 5.0,
    ratingCount: 58,
    releaseDate: '2023-05-12',
    esrb: 'Everyone 10+',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1612287233215-d72b226f97ef?auto=format&fit=crop&w=600&q=80',
    description: 'Una aventura épica a través de la tierra y los cielos de Hyrule en esta secuela aclamada de The Legend of Zelda: Breath of the Wild.',
    specs: 'Modos: TV, Semiportátil, Portátil | Espacio: 16 GB | Jugadores: 1',
    stock: {
      sucursal_1: 4,
      sucursal_2: 6,
      sucursal_3: 2,
      bodega_web: 15
    },
    criticalThreshold: 2
  },
  {
    id: 'prod_3',
    sku: 'PXG-PC-CYBER',
    title: 'Cyberpunk 2077: Phantom Liberty',
    platform: 'PC',
    format: 'Digital',
    category: 'RPG / Shooter',
    price: 29990,
    cost: 18000,
    rating: 4.8,
    ratingCount: 31,
    releaseDate: '2023-09-26',
    esrb: 'Mature 17+',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    description: 'Phantom Liberty es una expansión de suspenso y espionaje para el juego de rol de acción y mundo abierto Cyberpunk 2077. Clave digital canjeable en GOG/Steam.',
    specs: 'Plataforma de activación: GOG / Steam | Requiere GPU Ray Tracing recomendada | Tamaño: 70 GB',
    stock: {
      sucursal_1: 0,
      sucursal_2: 0,
      sucursal_3: 0,
      bodega_web: 45 // pool digital
    },
    criticalThreshold: 10
  },
  {
    id: 'prod_4',
    sku: 'PXG-PS5-FC25',
    title: 'EA SPORTS FC 25',
    platform: 'PS5',
    format: 'Físico',
    category: 'Deportes',
    price: 69990,
    cost: 46000,
    rating: 4.3,
    ratingCount: 22,
    releaseDate: '2024-09-27',
    esrb: 'Everyone',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    description: 'Vive el deporte rey con FC IQ, Rush 5v5 y una renovación táctica profunda impulsada por datos del mundo real del fútbol profesional.',
    specs: 'DualSense Háptico | 4K HDR 60fps | Multijugador online hasta 22 jugadores',
    stock: {
      sucursal_1: 12,
      sucursal_2: 15,
      sucursal_3: 8,
      bodega_web: 40
    },
    criticalThreshold: 5
  },
  {
    id: 'prod_5',
    sku: 'PXG-XBX-HALO',
    title: 'Halo Infinite: Edición Estándar',
    platform: 'Xbox',
    format: 'Físico',
    category: 'Shooter',
    price: 39990,
    cost: 25000,
    rating: 4.5,
    ratingCount: 19,
    releaseDate: '2021-12-08',
    esrb: 'Teen 13+',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    description: 'Cuando se pierde toda esperanza y el destino de la humanidad pende de un hilo, el Jefe Maestro está listo para enfrentarse al enemigo más despiadado.',
    specs: 'Hasta 120 FPS en Xbox Series X | Smart Delivery | Dolby Atmos',
    stock: {
      sucursal_1: 2,
      sucursal_2: 3,
      sucursal_3: 1, // Alerta stock crítico
      bodega_web: 9
    },
    criticalThreshold: 2
  },
  {
    id: 'prod_6',
    sku: 'PXG-SWI-MARIO',
    title: 'Super Mario Bros. Wonder',
    platform: 'Switch',
    format: 'Físico',
    category: 'Plataformas',
    price: 54990,
    cost: 36000,
    rating: 4.9,
    ratingCount: 39,
    releaseDate: '2023-10-20',
    esrb: 'Everyone',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
    description: 'Encuentra lo inesperado con las Flores Maravilla y transforma el mundo que te rodea en una aventura clásica de desplazamiento lateral de Mario.',
    specs: 'Multijugador local hasta 4 jugadores | Compatible con Nintendo Switch Online',
    stock: {
      sucursal_1: 6,
      sucursal_2: 9,
      sucursal_3: 5,
      bodega_web: 20
    },
    criticalThreshold: 3
  },
  {
    id: 'prod_7',
    sku: 'PXG-PS5-GOWR',
    title: 'God of War Ragnarök',
    platform: 'PS5',
    format: 'Digital',
    category: 'Acción / Aventura',
    price: 49990,
    cost: 32000,
    rating: 5.0,
    ratingCount: 65,
    releaseDate: '2022-11-09',
    esrb: 'Mature 17+',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    description: 'Kratos y Atreus deben viajar a cada uno de los Nueve Reinos en busca de respuestas mientras las fuerzas asgardianas se preparan para la batalla profetizada.',
    specs: 'Licencia Digital PSN PlayStation Network Chile/US | Audio 3D Tempest',
    stock: {
      sucursal_1: 0,
      sucursal_2: 0,
      sucursal_3: 0,
      bodega_web: 32
    },
    criticalThreshold: 5
  },
  {
    id: 'prod_8',
    sku: 'PXG-XBX-FORZA',
    title: 'Forza Horizon 5 Premium',
    platform: 'Xbox',
    format: 'Digital',
    category: 'Carreras',
    price: 45990,
    cost: 29000,
    rating: 4.8,
    ratingCount: 28,
    releaseDate: '2021-11-09',
    esrb: 'Everyone',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    description: 'Tu aventura definitiva en Horizon te espera. Explora los paisajes vibrantes y en constante evolución del mundo abierto de México.',
    specs: 'Código digital Xbox / Windows PC | Play Anywhere | 4K Ultra HD',
    stock: {
      sucursal_1: 0,
      sucursal_2: 0,
      sucursal_3: 0,
      bodega_web: 28
    },
    criticalThreshold: 5
  },
  {
    id: 'prod_9',
    sku: 'PXG-PS5-FF7R',
    title: 'Final Fantasy VII Rebirth',
    platform: 'PS5',
    format: 'Físico',
    category: 'RPG',
    price: 69990,
    cost: 45000,
    rating: 4.9,
    ratingCount: 34,
    releaseDate: '2024-02-29',
    esrb: 'Teen 13+',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
    description: 'El viaje a lo desconocido continúa. Cloud y sus amigos escapan de la ciudad distópica de Midgar y se adentran en el vasto planeta.',
    specs: '2 Discos Blu-ray Ultra HD | Audio 3D | Fidelidad 4K o Rendimiento 60FPS',
    stock: {
      sucursal_1: 7,
      sucursal_2: 10,
      sucursal_3: 3,
      bodega_web: 18
    },
    criticalThreshold: 3
  },
  {
    id: 'prod_10',
    sku: 'PXG-SWI-METROID',
    title: 'Metroid Prime 4: Beyond',
    platform: 'Switch',
    format: 'Físico',
    category: 'Acción / Aventura',
    price: 62990,
    cost: 41000,
    rating: 5.0,
    ratingCount: 12,
    releaseDate: '2026-11-30',
    esrb: 'Teen 13+',
    status: 'Preventa', // Preventa
    image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=600&q=80',
    description: '¡Preventa Exclusiva Pixel Gamers! Acompaña a la legendaria cazarrecompensas Samus Aran en una nueva misión galáctica de última generación.',
    specs: 'Lanzamiento confirmado finales 2026 | Reserva con bonificación de póster metálico exclusivo',
    stock: {
      sucursal_1: 0,
      sucursal_2: 0,
      sucursal_3: 0,
      bodega_web: 50 // Cupos de preventa
    },
    criticalThreshold: 5
  },
  {
    id: 'prod_11',
    sku: 'PXG-PC-MHWILDS',
    title: 'Monster Hunter Wilds',
    platform: 'PC',
    format: 'Digital',
    category: 'Acción / RPG',
    price: 59990,
    cost: 38000,
    rating: 4.7,
    ratingCount: 15,
    releaseDate: '2025-02-28',
    esrb: 'Teen 13+',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?auto=format&fit=crop&w=600&q=80',
    description: 'La fuerza desenfrenada de la naturaleza campa a sus anchas. Un ecosistema dinámico y cambiante que pondrá a prueba tu maestría de cazador.',
    specs: 'Clave digital Steam PC | Crossplay completo entre plataformas',
    stock: {
      sucursal_1: 0,
      sucursal_2: 0,
      sucursal_3: 0,
      bodega_web: 25
    },
    criticalThreshold: 5
  },
  {
    id: 'prod_12',
    sku: 'PXG-PC-DESTINY',
    title: 'Destiny 2: The Final Shape DLC',
    platform: 'PC',
    format: 'DLC',
    category: 'Shooter / MMO',
    price: 34990,
    cost: 21000,
    rating: 4.6,
    ratingCount: 17,
    releaseDate: '2024-06-04',
    esrb: 'Teen 13+',
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    description: 'La culminación de la saga de la Luz y la Oscuridad. Entra en el Corazón Pálido del Viajero y derrota al Testigo.',
    specs: 'Requiere el juego base Destiny 2 | Clave para Steam / Epic Games',
    stock: {
      sucursal_1: 0,
      sucursal_2: 0,
      sucursal_3: 0,
      bodega_web: 30
    },
    criticalThreshold: 5
  }
];

const INITIAL_DIGITAL_KEYS = [
  { id: 'key_1', productId: 'prod_3', sku: 'PXG-PC-CYBER', code: 'PXG-GOG-9821-4471-A89F', status: 'available', createdAt: '2026-01-10T12:00:00Z', encryptedHash: 'AES256:8f2a1b9c3e4d5f6a' },
  { id: 'key_2', productId: 'prod_3', sku: 'PXG-PC-CYBER', code: 'PXG-GOG-1123-5582-B90C', status: 'available', createdAt: '2026-01-10T12:00:00Z', encryptedHash: 'AES256:7e1f2a3b4c5d6e7f' },
  { id: 'key_3', productId: 'prod_7', sku: 'PXG-PS5-GOWR', code: 'PSN-CL-7712-9904-8831', status: 'available', createdAt: '2026-01-12T14:00:00Z', encryptedHash: 'AES256:1a2b3c4d5e6f7a8b' },
  { id: 'key_4', productId: 'prod_7', sku: 'PXG-PS5-GOWR', code: 'PSN-CL-4419-0021-9982', status: 'assigned', assignedTo: 'juan.perez@email.com', orderId: 'ORD-1001', assignedAt: '2026-01-20T16:30:00Z', encryptedHash: 'AES256:9c8b7a6f5e4d3c2b' },
  { id: 'key_5', productId: 'prod_8', sku: 'PXG-XBX-FORZA', code: 'XBX-WL-3310-8842-1094', status: 'available', createdAt: '2026-01-15T10:00:00Z', encryptedHash: 'AES256:4d5e6f7a8b9c0d1e' },
  { id: 'key_6', productId: 'prod_11', sku: 'PXG-PC-MHWILDS', code: 'STM-PC-5561-2290-7714', status: 'available', createdAt: '2026-01-18T11:00:00Z', encryptedHash: 'AES256:2b3c4d5e6f7a8b9c' },
  { id: 'key_7', productId: 'prod_12', sku: 'PXG-PC-DESTINY', code: 'STM-DLC-9981-6632-1105', status: 'available', createdAt: '2026-01-18T11:00:00Z', encryptedHash: 'AES256:3c4d5e6f7a8b9c0d' }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-1001',
    customerEmail: 'juan.perez@email.com',
    customerName: 'Juan Pérez',
    customerRut: '18.234.567-8',
    customerPhone: '+56 9 8765 4321',
    deliveryType: 'despacho', // despacho | retiro
    shippingAddress: 'Av. Providencia 1234, Depto 402, Providencia, RM',
    pickupBranchId: null,
    paymentMethod: 'Webpay Plus (Crédito)',
    paymentGateway: 'Webpay',
    status: 'Enviado', // Pagada | En preparación | Enviado | Entregado | Cancelada
    trackingId: 'CHILEXPRESS-992819382',
    courierName: 'Chilexpress',
    items: [
      { productId: 'prod_1', title: 'Elden Ring: Shadow of the Erdtree Edition', format: 'Físico', quantity: 1, price: 64990 },
      { productId: 'prod_7', title: 'God of War Ragnarök', format: 'Digital', quantity: 1, price: 49990, digitalKey: 'PSN-CL-4419-0021-9982' }
    ],
    subtotal: 96622,
    tax: 18358,
    shippingCost: 3990,
    total: 118970,
    invoiceFolio: 'FEL-2026-00481',
    date: '2026-01-20T16:30:00Z',
    notes: 'Despachado por bodega central el 2026-01-21'
  },
  {
    id: 'ORD-1002',
    customerEmail: 'juan.perez@email.com',
    customerName: 'Juan Pérez',
    customerRut: '18.234.567-8',
    customerPhone: '+56 9 8765 4321',
    deliveryType: 'retiro',
    shippingAddress: null,
    pickupBranchId: 'sucursal_2', // Costanera Center
    paymentMethod: 'MercadoPago (Débito)',
    paymentGateway: 'MercadoPago',
    status: 'Listo para retiro',
    trackingId: 'PICKUP-COSTANERA-1002',
    courierName: 'Retiro en Tienda',
    items: [
      { productId: 'prod_2', title: 'The Legend of Zelda: Tears of the Kingdom', format: 'Físico', quantity: 1, price: 59990 }
    ],
    subtotal: 50412,
    tax: 9578,
    shippingCost: 0,
    total: 59990,
    invoiceFolio: 'FEL-2026-00482',
    date: '2026-01-22T11:15:00Z',
    notes: 'Esperando retiro del cliente en Costanera Center'
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev_1',
    productId: 'prod_1',
    userName: 'Juan Pérez',
    userEmail: 'juan.perez@email.com',
    rating: 5,
    comment: '¡Obra maestra total! La expansión Shadow of the Erdtree supera todas las expectativas. La entrega física llegó impecable y súper rápido.',
    verifiedPurchase: true,
    date: '2026-01-22T18:00:00Z'
  },
  {
    id: 'rev_2',
    productId: 'prod_7',
    userName: 'Juan Pérez',
    userEmail: 'juan.perez@email.com',
    rating: 5,
    comment: 'El código digital me llegó en segundos por correo y lo canjeé en mi PS5 sin ningún problema. 100% recomendado.',
    verifiedPurchase: true,
    date: '2026-01-21T10:30:00Z'
  }
];

const INITIAL_PHONE_RESERVATIONS = [
  {
    id: 'RES-901',
    customerName: 'Matías González',
    customerRut: '19.876.543-2',
    customerPhone: '+56 9 9123 4567',
    productId: 'prod_5',
    productTitle: 'Halo Infinite: Edición Estándar',
    branchId: 'sucursal_1',
    quantity: 1,
    reservedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    status: 'activa', // activa | cobrada | anulada | expirada
    sellerId: 'usr_2'
  }
];

const INITIAL_TRANSFERS = [
  {
    id: 'TRF-501',
    productId: 'prod_5',
    productTitle: 'Halo Infinite: Edición Estándar',
    sku: 'PXG-XBX-HALO',
    sourceBranchId: 'sucursal_2',
    destBranchId: 'sucursal_3',
    quantity: 2,
    requestedBy: 'Carlos Ramos (Vendedor)',
    status: 'En tránsito', // Solicitado | En tránsito | Recibido | Rechazado
    requestDate: '2026-01-25T14:20:00Z',
    approvalDate: '2026-01-26T09:00:00Z'
  }
];

const INITIAL_SUPPLIERS = [
  { id: 'sup_1', rut: '76.123.456-7', name: 'Sony Interactive Entertainment Chile SpA', contact: 'distribucion@playstation.cl', phone: '+56 2 2345 6789', paymentTerms: '30 días' },
  { id: 'sup_2', rut: '77.234.567-8', name: 'Nintendo Latam Distribution', contact: 'ventas@nintendo.cl', phone: '+56 2 2876 5432', paymentTerms: '45 días' },
  { id: 'sup_3', rut: '78.345.678-9', name: 'Microsoft Xbox Gaming Chile', contact: 'partners@xbox.cl', phone: '+56 2 2987 6543', paymentTerms: '30 días' },
  { id: 'sup_4', rut: '79.456.789-0', name: 'Bandai Namco Entertainment Latam', contact: 'contacto@bandainamco.cl', phone: '+56 2 2654 3210', paymentTerms: '60 días' }
];

const INITIAL_SECURITY_LOGS = [
  { id: 'log_1', timestamp: '2026-01-20T16:30:05Z', action: 'ENTREGA_LICENCIA_DIGITAL', user: 'juan.perez@email.com', rut: '18.234.567-8', ip: '190.161.42.11', details: 'Asignada clave digital PSN-CL-4419-0021-9982 para God of War Ragnarök (Orden ORD-1001). Hash AES256 verificado.', severity: 'INFO' },
  { id: 'log_2', timestamp: '2026-01-22T08:00:12Z', action: 'RECONCILIACION_NOCTURNA', user: 'SYSTEM_CRON', rut: 'SYSTEM', ip: '127.0.0.1', details: 'Conciliación omnicanal 23:59 ejecutada con éxito. 12 SKUs auditados. Sin discrepancias.', severity: 'INFO' },
  { id: 'log_3', timestamp: '2026-01-25T11:10:00Z', action: 'AUDITORIA_ROLES', user: 'admin@pixelgamers.cl', rut: '12.345.678-9', ip: '200.54.12.98', details: 'Políticas MFA verificadas para personal administrativo.', severity: 'INFO' }
];

const INITIAL_SETTINGS = {
  webpayCommerceCode: '597055555532',
  webpayApiKey: 'TEST_KEY_579a32c2-8b3d-4c3e-8f1a-9821a7c3e1b4',
  webpaySandbox: true,
  mercadoPagoToken: 'TEST-829103829102-092819-abcdef0123456789-TEST',
  courierApiKey: 'CR-CHL-99812-API-KEY-ACTIVE',
  courierDefaultRate: 3990,
  freeShippingThreshold: 50000,
  smtpHost: 'smtp.pixelgamers.cl',
  smtpPort: 587,
  smtpUser: 'notificaciones@pixelgamers.cl',
  smtpSecurity: 'TLS',
  smtpRatePerHour: 500,
  mfaRequiredForStaff: true,
  passwordMinLength: 8,
  passwordRequireComplex: true,
  sessionTimeoutMinutes: 15,
  maxFailedLogins: 3,
  environment: 'Producción Simulado', // Dev | Staging | Producción
  blockedIps: ['198.51.100.4', '203.0.113.19']
};

export const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  // Load or initialize DB from localStorage
  const [db, setDb] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading DB from localStorage:', e);
    }
    return {
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      digitalKeys: INITIAL_DIGITAL_KEYS,
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      phoneReservations: INITIAL_PHONE_RESERVATIONS,
      transfers: INITIAL_TRANSFERS,
      suppliers: INITIAL_SUPPLIERS,
      securityLogs: INITIAL_SECURITY_LOGS,
      settings: INITIAL_SETTINGS,
      stockAlertSubscriptions: [
        { email: 'juan.perez@email.com', productId: 'prod_10' }
      ]
    };
  });

  // Current active user / session (defaults to Comprador Juan Pérez for seamless UX)
  const [currentUser, setCurrentUser] = useState(() => {
    return db.users.find(u => u.role === 'comprador') || db.users[0];
  });

  // Active role mode ('comprador' | 'vendedor' | 'inventario' | 'admin')
  const [activeRole, setActiveRole] = useState(() => currentUser?.role || 'comprador');

  // Active cashier branch for vendedor
  const [selectedBranch, setSelectedBranch] = useState('sucursal_1');

  // Offline mode simulation flag for POS
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);

  // Shopping Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('PIXEL_GAMERS_CART');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cart reservation timer (15 minutes = 900 seconds)
  const [cartTimer, setCartTimer] = useState(900);

  // Sync DB to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Error saving DB to localStorage:', e);
    }
  }, [db]);

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('PIXEL_GAMERS_CART', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  // Cart timer countdown
  useEffect(() => {
    if (cart.length === 0) {
      setCartTimer(900);
      return;
    }
    const interval = setInterval(() => {
      setCartTimer(prev => {
        if (prev <= 1) {
          // Timer expired, clear expired reservation
          return 900;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cart.length]);

  // Helper to switch user & role quickly
  const switchUserByRole = (role) => {
    const target = db.users.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
      setActiveRole(role);
      if (target.branchId) {
        setSelectedBranch(target.branchId);
      }
    }
  };

  // Append-only security log helper
  const addSecurityLog = (action, details, severity = 'INFO', userEmail = null, rut = null) => {
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      user: userEmail || currentUser?.email || 'ANONYMOUS',
      rut: rut || currentUser?.rut || 'N/A',
      ip: '190.161.42.' + Math.floor(Math.random() * 200 + 10),
      details,
      severity
    };
    setDb(prev => ({
      ...prev,
      securityLogs: [newLog, ...prev.securityLogs]
    }));
  };

  // CART ACTIONS
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setCartTimer(900); // reset 15m timer
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCartTimer(900);
  };

  // CHECKOUT & PURCHASE (HU-COM-04, 05, 06, 07, 08)
  const processCheckout = ({
    deliveryType,
    shippingAddress,
    pickupBranchId,
    paymentMethod,
    customerData
  }) => {
    // 1. Calculate totals
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.19 / 1.19); // 19% IVA included
    const net = subtotal - tax;
    const shippingCost = deliveryType === 'retiro' ? 0 : (subtotal >= (db.settings.freeShippingThreshold || 50000) ? 0 : (db.settings.courierDefaultRate || 3990));
    const total = subtotal + shippingCost;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceFolio = `FEL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingId = deliveryType === 'retiro'
      ? `PICKUP-${pickupBranchId?.toUpperCase() || 'LOCAL'}-${orderId}`
      : `CHILEX-${Math.floor(100000000 + Math.random() * 900000000)}`;

    // 2. Assign digital keys if order contains digital products
    const updatedDigitalKeys = [...db.digitalKeys];
    const orderItems = [];

    cart.forEach(item => {
      let assignedCode = null;
      if (item.product.format === 'Digital' || item.product.format === 'DLC') {
        const availableKeyIndex = updatedDigitalKeys.findIndex(
          k => k.productId === item.product.id && k.status === 'available'
        );
        if (availableKeyIndex !== -1) {
          assignedCode = updatedDigitalKeys[availableKeyIndex].code;
          updatedDigitalKeys[availableKeyIndex] = {
            ...updatedDigitalKeys[availableKeyIndex],
            status: 'assigned',
            assignedTo: customerData.email,
            orderId,
            assignedAt: new Date().toISOString()
          };
        } else {
          // Generate an instantaneous emergency key
          assignedCode = `PXG-DIGITAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
          updatedDigitalKeys.push({
            id: `key_${Date.now()}_${Math.random()}`,
            productId: item.product.id,
            sku: item.product.sku,
            code: assignedCode,
            status: 'assigned',
            assignedTo: customerData.email,
            orderId,
            assignedAt: new Date().toISOString(),
            encryptedHash: 'AES256:' + Math.random().toString(36).substring(2, 18)
          });
        }
      }

      orderItems.push({
        productId: item.product.id,
        title: item.product.title,
        sku: item.product.sku,
        format: item.product.format,
        quantity: item.quantity,
        price: item.product.price,
        digitalKey: assignedCode
      });
    });

    // 3. Deduct stock omnicanal
    const updatedProducts = db.products.map(p => {
      const cartItem = cart.find(ci => ci.product.id === p.id);
      if (!cartItem) return p;

      const newStock = { ...p.stock };
      if (p.format === 'Físico') {
        if (deliveryType === 'retiro' && pickupBranchId && newStock[pickupBranchId] !== undefined) {
          newStock[pickupBranchId] = Math.max(0, newStock[pickupBranchId] - cartItem.quantity);
        } else {
          newStock.bodega_web = Math.max(0, newStock.bodega_web - cartItem.quantity);
        }
      } else {
        // Digital
        newStock.bodega_web = Math.max(0, newStock.bodega_web - cartItem.quantity);
      }
      return { ...p, stock: newStock };
    });

    // 4. Create Order
    const newOrder = {
      id: orderId,
      customerEmail: customerData.email,
      customerName: customerData.name,
      customerRut: customerData.rut,
      customerPhone: customerData.phone,
      deliveryType,
      shippingAddress: deliveryType === 'despacho' ? shippingAddress : null,
      pickupBranchId: deliveryType === 'retiro' ? pickupBranchId : null,
      paymentMethod,
      paymentGateway: paymentMethod.includes('Webpay') ? 'Webpay Plus' : 'MercadoPago',
      status: 'Pagada',
      trackingId,
      courierName: deliveryType === 'retiro' ? 'Retiro en Tienda' : 'Chilexpress',
      items: orderItems,
      subtotal: net,
      tax,
      shippingCost,
      total,
      invoiceFolio,
      date: new Date().toISOString(),
      notes: deliveryType === 'retiro' ? `Retiro presencial en ${BRANCHES.find(b => b.id === pickupBranchId)?.name}` : `Despacho a ${shippingAddress}`
    };

    // 5. Update DB
    setDb(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      products: updatedProducts,
      digitalKeys: updatedDigitalKeys
    }));

    // 6. Security log
    addSecurityLog(
      'ORDEN_CREADA_Y_PAGADA',
      `Orden ${orderId} creada exitosamente. Total: $${total.toLocaleString('es-CL')}. Folio: ${invoiceFolio}. Items: ${orderItems.length}`,
      'INFO',
      customerData.email,
      customerData.rut
    );

    // If digital keys assigned, log tamper-proof record (HU-COM-08, HU-SIS-03)
    orderItems.filter(i => i.digitalKey).forEach(item => {
      addSecurityLog(
        'ENTREGA_LICENCIA_DIGITAL',
        `Licencia asignada: ${item.digitalKey} para ${item.title}. Orden: ${orderId}. Hash AES256 verificado.`,
        'INFO',
        customerData.email,
        customerData.rut
      );
    });

    clearCart();
    return newOrder;
  };

  // ORDER CANCELLATION (HU-COM-14)
  const cancelOrder = (orderId, reason = 'Solicitud de cliente') => {
    const order = db.orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Orden no encontrada' };

    if (order.status !== 'Pagada' && order.status !== 'En proceso') {
      return { success: false, message: `No se puede cancelar en estado "${order.status}". Sólo órdenes "Pagada" o "En proceso".` };
    }

    // Reintegrate physical units to stock
    const updatedProducts = db.products.map(p => {
      const orderItem = order.items.find(oi => oi.productId === p.id);
      if (!orderItem || orderItem.format !== 'Físico') return p;

      const newStock = { ...p.stock };
      if (order.deliveryType === 'retiro' && order.pickupBranchId && newStock[order.pickupBranchId] !== undefined) {
        newStock[order.pickupBranchId] += orderItem.quantity;
      } else {
        newStock.bodega_web += orderItem.quantity;
      }
      return { ...p, stock: newStock };
    });

    // Update order status
    const updatedOrders = db.orders.map(o =>
      o.id === orderId
        ? { ...o, status: 'Cancelada', cancellationReason: reason, cancelledAt: new Date().toISOString() }
        : o
    );

    setDb(prev => ({
      ...prev,
      orders: updatedOrders,
      products: updatedProducts
    }));

    addSecurityLog(
      'ORDEN_CANCELADA',
      `Orden ${orderId} cancelada. Motivo: ${reason}. Se reintegró el inventario a la base de datos. Reembolso procesado.`,
      'WARN',
      order.customerEmail,
      order.customerRut
    );

    return { success: true, message: 'Orden cancelada con éxito y stock reintegrado.' };
  };

  // REVIEWS & RATINGS (HU-COM-15)
  const addReview = ({ productId, rating, comment }) => {
    if (!currentUser) return { success: false, message: 'Debes iniciar sesión' };

    // Check verified purchase
    const hasPurchased = db.orders.some(
      o => o.customerEmail === currentUser.email &&
           o.status !== 'Cancelada' &&
           o.items.some(i => i.productId === productId)
    );

    if (!hasPurchased) {
      return { success: false, message: 'Sólo los usuarios con compra verificada pueden calificar este producto.' };
    }

    // Content moderation filter (HU-COM-15 CA-04)
    const bannedWords = ['estafa', 'fraude', 'malditos', 'mierda', 'basura'];
    const hasOffensive = bannedWords.some(w => comment.toLowerCase().includes(w));
    if (hasOffensive) {
      return { success: false, message: 'El comentario contiene términos que no cumplen con nuestras normas de moderación.' };
    }

    const newReview = {
      id: `rev_${Date.now()}`,
      productId,
      userName: currentUser.name,
      userEmail: currentUser.email,
      rating: Number(rating),
      comment: comment.slice(0, 500),
      verifiedPurchase: true,
      date: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...db.reviews];

    // Recalculate average rating for product
    const productReviews = updatedReviews.filter(r => r.productId === productId);
    const avgRating = Number((productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1));

    const updatedProducts = db.products.map(p =>
      p.id === productId ? { ...p, rating: avgRating, ratingCount: productReviews.length } : p
    );

    setDb(prev => ({
      ...prev,
      reviews: updatedReviews,
      products: updatedProducts
    }));

    return { success: true, message: 'Reseña publicada con éxito.' };
  };

  // NOTIFY WHEN STOCK RESTOCKED (HU-COM-12)
  const subscribeToStockAlert = (productId, email) => {
    setDb(prev => {
      const exists = prev.stockAlertSubscriptions?.some(s => s.productId === productId && s.email === email);
      if (exists) return prev;
      return {
        ...prev,
        stockAlertSubscriptions: [...(prev.stockAlertSubscriptions || []), { productId, email, subscribedAt: new Date().toISOString() }]
      };
    });
    return { success: true, message: 'Te avisaremos por correo apenas haya stock disponible.' };
  };

  // POS VENDEDOR ACTIONS (HU-VEN-01 - 15)
  const processPosSale = ({
    items,
    branchId,
    customerRut,
    customerName,
    paymentMethod,
    discountAmount = 0
  }) => {
    const orderId = `POS-${branchId.slice(-1)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceFolio = `BOL-POS-${Math.floor(10000 + Math.random() * 90000)}`;

    // Offline mode handling (HU-VEN-14)
    if (isOfflineMode) {
      const offlineSale = {
        orderId,
        invoiceFolio,
        items,
        branchId,
        customerRut,
        customerName,
        paymentMethod,
        discountAmount,
        date: new Date().toISOString(),
        offline: true
      };
      setOfflineQueue(prev => [...prev, offlineSale]);
      return {
        success: true,
        orderId,
        invoiceFolio,
        offline: true,
        message: 'Venta registrada en caché offline de contingencia. Se sincronizará automáticamente al restablecer conexión.'
      };
    }

    // Deduct stock from local branch
    const updatedProducts = db.products.map(p => {
      const soldItem = items.find(i => i.productId === p.id);
      if (!soldItem) return p;

      const newStock = { ...p.stock };
      if (newStock[branchId] !== undefined) {
        newStock[branchId] = Math.max(0, newStock[branchId] - soldItem.quantity);
      }
      return { ...p, stock: newStock };
    });

    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0) - discountAmount;
    const tax = Math.round(subtotal * 0.19 / 1.19);

    const newOrder = {
      id: orderId,
      customerEmail: 'pos.cliente@tienda.cl',
      customerName: customerName || 'Cliente Presencial',
      customerRut: customerRut || '6.666.666-6',
      customerPhone: 'N/A',
      deliveryType: 'retiro',
      shippingAddress: null,
      pickupBranchId: branchId,
      paymentMethod,
      paymentGateway: 'POS Presencial',
      status: 'Entregada en tienda',
      trackingId: `POS-TICKET-${orderId}`,
      courierName: 'Entrega Mostrador',
      items,
      subtotal: subtotal - tax,
      tax,
      shippingCost: 0,
      total: subtotal,
      invoiceFolio,
      date: new Date().toISOString(),
      sellerId: currentUser?.id || 'usr_2',
      notes: `Venta presencial en ${BRANCHES.find(b => b.id === branchId)?.name}`
    };

    setDb(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      products: updatedProducts
    }));

    addSecurityLog(
      'POS_VENTA_PROCESADA',
      `Venta en caja ${orderId} (${BRANCHES.find(b => b.id === branchId)?.name}). Total: $${subtotal.toLocaleString('es-CL')}. Folio: ${invoiceFolio}.`,
      'INFO'
    );

    return { success: true, orderId, invoiceFolio, order: newOrder };
  };

  // Sync offline sales queue when coming back online (HU-VEN-14 CA-04)
  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return { count: 0 };
    const count = offlineQueue.length;
    offlineQueue.forEach(sale => {
      // Process offline sale
      setDb(prev => {
        const updatedProducts = prev.products.map(p => {
          const soldItem = sale.items.find(i => i.productId === p.id);
          if (!soldItem) return p;
          const newStock = { ...p.stock };
          if (newStock[sale.branchId] !== undefined) {
            newStock[sale.branchId] = Math.max(0, newStock[sale.branchId] - soldItem.quantity);
          }
          return { ...p, stock: newStock };
        });

        const newOrder = {
          id: sale.orderId,
          customerEmail: 'pos.offline@tienda.cl',
          customerName: sale.customerName || 'Cliente Offline',
          customerRut: sale.customerRut || '6.666.666-6',
          deliveryType: 'retiro',
          pickupBranchId: sale.branchId,
          paymentMethod: sale.paymentMethod,
          status: 'Entregada en tienda',
          items: sale.items,
          total: sale.items.reduce((acc, i) => acc + i.price * i.quantity, 0) - sale.discountAmount,
          invoiceFolio: sale.invoiceFolio,
          date: sale.date,
          notes: 'Venta originada en modo offline sincronizada con éxito.'
        };

        return {
          ...prev,
          products: updatedProducts,
          orders: [newOrder, ...prev.orders]
        };
      });
    });

    setOfflineQueue([]);
    setIsOfflineMode(false);
    addSecurityLog('POS_SYNC_OFFLINE', `Se sincronizaron ${count} transacciones locales con la base de datos central.`, 'INFO');
    return { count };
  };

  // PHONE RESERVATION (HU-VEN-03, 08)
  const createPhoneReservation = ({ customerName, customerRut, customerPhone, productId, branchId, quantity = 1 }) => {
    const product = db.products.find(p => p.id === productId);
    if (!product || (product.stock[branchId] || 0) < quantity) {
      return { success: false, message: 'Stock insuficiente en la sucursal seleccionada.' };
    }

    const resId = `RES-${Math.floor(100 + Math.random() * 900)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins

    // Hold stock
    const updatedProducts = db.products.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        stock: {
          ...p.stock,
          [branchId]: p.stock[branchId] - quantity
        }
      };
    });

    const newReservation = {
      id: resId,
      customerName,
      customerRut,
      customerPhone,
      productId,
      productTitle: product.title,
      branchId,
      quantity,
      reservedAt: new Date().toISOString(),
      expiresAt,
      status: 'activa',
      sellerId: currentUser?.id
    };

    setDb(prev => ({
      ...prev,
      products: updatedProducts,
      phoneReservations: [newReservation, ...prev.phoneReservations]
    }));

    addSecurityLog('RESERVA_TELEFONICA_CREADA', `Reserva ${resId} para ${customerName} (${product.title}). Stock bloqueado por 30 mins.`, 'INFO');
    return { success: true, reservation: newReservation };
  };

  const cancelPhoneReservation = (reservationId, reason = 'No se presentó a pagar') => {
    const res = db.phoneReservations.find(r => r.id === reservationId);
    if (!res || res.status !== 'activa') return { success: false, message: 'Reserva no encontrada o ya inactiva' };

    // Release stock
    const updatedProducts = db.products.map(p => {
      if (p.id !== res.productId) return p;
      return {
        ...p,
        stock: {
          ...p.stock,
          [res.branchId]: (p.stock[res.branchId] || 0) + res.quantity
        }
      };
    });

    const updatedReservations = db.phoneReservations.map(r =>
      r.id === reservationId ? { ...r, status: 'anulada', cancelReason: reason } : r
    );

    setDb(prev => ({
      ...prev,
      products: updatedProducts,
      phoneReservations: updatedReservations
    }));

    addSecurityLog('RESERVA_TELEFONICA_ANULADA', `Reserva ${reservationId} anulada. Motivo: ${reason}. Stock reintegrado al catálogo.`, 'WARN');
    return { success: true, message: 'Reserva anulada y stock devuelto al catálogo.' };
  };

  // IN-STORE PICKUP DELIVERY (HU-VEN-07)
  const deliverPickupOrder = (orderId, cashierVerification) => {
    const order = db.orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Pedido no encontrado' };

    const updatedOrders = db.orders.map(o =>
      o.id === orderId
        ? {
            ...o,
            status: 'Entregada en tienda',
            deliveredAt: new Date().toISOString(),
            deliveredBy: currentUser?.name,
            verifiedRut: cashierVerification.rut,
            signatureReceived: true
          }
        : o
    );

    setDb(prev => ({
      ...prev,
      orders: updatedOrders
    }));

    addSecurityLog('ENTREGA_MOSTRADOR', `Pedido ${orderId} entregado presencialmente a cliente con RUT ${cashierVerification.rut}.`, 'INFO');
    return { success: true, message: 'Pedido entregado y validado exitosamente.' };
  };

  // INTER-BRANCH STOCK TRANSFER (HU-VEN-12, HU-INV-12)
  const requestStockTransfer = ({ productId, sourceBranchId, destBranchId, quantity }) => {
    const product = db.products.find(p => p.id === productId);
    if (!product || (product.stock[sourceBranchId] || 0) < quantity) {
      return { success: false, message: 'La sucursal de origen no tiene existencias suficientes.' };
    }

    const transferId = `TRF-${Math.floor(100 + Math.random() * 900)}`;
    const newTransfer = {
      id: transferId,
      productId,
      productTitle: product.title,
      sku: product.sku,
      sourceBranchId,
      destBranchId,
      quantity,
      requestedBy: currentUser?.name || 'Vendedor en caja',
      status: 'Solicitado',
      requestDate: new Date().toISOString()
    };

    setDb(prev => ({
      ...prev,
      transfers: [newTransfer, ...prev.transfers]
    }));

    addSecurityLog('TRASPASO_SOLICITADO', `Solicitud de traspaso ${transferId} de ${quantity} un. de ${product.title} desde ${BRANCHES.find(b=>b.id===sourceBranchId)?.name} hacia ${BRANCHES.find(b=>b.id===destBranchId)?.name}.`, 'INFO');
    return { success: true, transfer: newTransfer };
  };

  const updateTransferStatus = (transferId, newStatus) => {
    const trf = db.transfers.find(t => t.id === transferId);
    if (!trf) return { success: false };

    // When status changes to "En tránsito", deduct from source
    // When status changes to "Recibido", add to dest
    let updatedProducts = [...db.products];

    if (newStatus === 'En tránsito' && trf.status === 'Solicitado') {
      updatedProducts = updatedProducts.map(p => {
        if (p.id !== trf.productId) return p;
        return {
          ...p,
          stock: {
            ...p.stock,
            [trf.sourceBranchId]: Math.max(0, (p.stock[trf.sourceBranchId] || 0) - trf.quantity)
          }
        };
      });
    } else if (newStatus === 'Recibido' && trf.status === 'En tránsito') {
      updatedProducts = updatedProducts.map(p => {
        if (p.id !== trf.productId) return p;
        return {
          ...p,
          stock: {
            ...p.stock,
            [trf.destBranchId]: (p.stock[trf.destBranchId] || 0) + trf.quantity
          }
        };
      });
    }

    const updatedTransfers = db.transfers.map(t =>
      t.id === transferId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );

    setDb(prev => ({
      ...prev,
      transfers: updatedTransfers,
      products: updatedProducts
    }));

    addSecurityLog('TRASPASO_ACTUALIZADO', `Traspaso ${transferId} actualizado a "${newStatus}".`, 'INFO');
    return { success: true };
  };

  // INVENTORY ADMIN ACTIONS (HU-INV-01 to 15)
  const saveProduct = (productData) => {
    if (productData.id) {
      // Edit
      setDb(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === productData.id ? { ...p, ...productData } : p)
      }));
      addSecurityLog('CATALOGO_EDITADO', `Producto ${productData.title} (SKU: ${productData.sku}) actualizado.`, 'INFO');
    } else {
      // Create
      const newProd = {
        ...productData,
        id: `prod_${Date.now()}`,
        rating: 5.0,
        ratingCount: 0,
        stock: productData.stock || { sucursal_1: 0, sucursal_2: 0, sucursal_3: 0, bodega_web: 0 }
      };
      setDb(prev => ({
        ...prev,
        products: [newProd, ...prev.products]
      }));
      addSecurityLog('CATALOGO_CREADO', `Nuevo producto creado: ${newProd.title} (SKU: ${newProd.sku}).`, 'INFO');
    }
    return { success: true };
  };

  const deleteProduct = (productId) => {
    const prod = db.products.find(p => p.id === productId);
    setDb(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
    addSecurityLog('CATALOGO_ELIMINADO', `Producto eliminado del catálogo: ${prod?.title || productId}.`, 'WARN');
    return { success: true };
  };

  // BATCH DIGITAL LICENSE IMPORT (HU-INV-02)
  const importDigitalLicensesBatch = (productId, rawKeysText) => {
    const product = db.products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Producto no encontrado' };

    const lines = rawKeysText.split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);
    const existingCodes = new Set(db.digitalKeys.map(k => k.code));
    const newKeys = [];
    let duplicates = 0;

    lines.forEach(code => {
      if (existingCodes.has(code)) {
        duplicates++;
      } else {
        existingCodes.add(code);
        newKeys.push({
          id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId,
          sku: product.sku,
          code,
          status: 'available',
          createdAt: new Date().toISOString(),
          encryptedHash: 'AES256:' + Math.random().toString(36).substring(2, 18)
        });
      }
    });

    // Update stock in bodega_web
    const updatedProducts = db.products.map(p =>
      p.id === productId
        ? {
            ...p,
            stock: {
              ...p.stock,
              bodega_web: (p.stock.bodega_web || 0) + newKeys.length
            }
          }
        : p
    );

    setDb(prev => ({
      ...prev,
      digitalKeys: [...prev.digitalKeys, ...newKeys],
      products: updatedProducts
    }));

    addSecurityLog(
      'IMPORTACION_LICENCIAS',
      `Importadas ${newKeys.length} licencias digitales cifradas AES-256 para ${product.title}. (${duplicates} duplicadas omitidas).`,
      'INFO'
    );

    return { success: true, imported: newKeys.length, duplicates };
  };

  // RESTOCK PHYSICAL INVENTORY (HU-INV-03)
  const restockPhysicalProduct = ({ productId, branchId, quantity, unitCost, invoiceRef }) => {
    const product = db.products.find(p => p.id === productId);
    if (!product) return { success: false };

    const updatedProducts = db.products.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        cost: unitCost ? Number(unitCost) : p.cost,
        stock: {
          ...p.stock,
          [branchId]: (p.stock[branchId] || 0) + Number(quantity)
        }
      };
    });

    setDb(prev => ({
      ...prev,
      products: updatedProducts
    }));

    addSecurityLog(
      'REABASTECIMIENTO_STOCK',
      `Ingresadas ${quantity} unidades de ${product.title} en ${BRANCHES.find(b=>b.id===branchId)?.name}. Factura: ${invoiceRef || 'N/A'}. Costo: $${unitCost || product.cost}.`,
      'INFO'
    );

    return { success: true };
  };

  // ASSIGN TRACKING ID & UPDATE ORDER STATUS (HU-INV-07, 08)
  const updateOrderLogistics = (orderId, { trackingId, courierName, status }) => {
    const updatedOrders = db.orders.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        trackingId: trackingId || o.trackingId,
        courierName: courierName || o.courierName,
        status: status || o.status,
        lastStatusUpdate: new Date().toISOString()
      };
    });

    setDb(prev => ({
      ...prev,
      orders: updatedOrders
    }));

    addSecurityLog('DESPACHO_ACTUALIZADO', `Orden ${orderId} actualizada a "${status}". Tracking: ${trackingId || 'N/A'}. Courier: ${courierName || 'Chilexpress'}. Disparo automático de notificación SMTP generado.`, 'INFO');
    return { success: true };
  };

  // SYSTEM / IT ADMIN ACTIONS (HU-SIS-01 to 15)
  const saveUserAccount = (userData) => {
    if (userData.id) {
      setDb(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userData.id ? { ...u, ...userData } : u)
      }));
      addSecurityLog('USUARIO_MODIFICADO', `Usuario ${userData.email} actualizado. Rol: ${userData.role}. Estado: ${userData.status}.`, 'WARN');
    } else {
      const newUser = {
        ...userData,
        id: `usr_${Date.now()}`,
        passwordHash: 'bcrypt_hash_simulated_' + Math.random().toString(36).substring(2, 10),
        createdAt: new Date().toISOString()
      };
      setDb(prev => ({
        ...prev,
        users: [...prev.users, newUser]
      }));
      addSecurityLog('USUARIO_CREADO', `Nuevo usuario creado: ${newUser.email} con rol ${newUser.role}.`, 'WARN');
    }
    return { success: true };
  };

  const updateSettings = (newSettings) => {
    setDb(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
    addSecurityLog('PARAMETROS_SISTEMA_ACTUALIZADOS', 'Parámetros del sistema y credenciales de pasarelas actualizados sin reinicio.', 'WARN');
    return { success: true };
  };

  // NIGHTLY RECONCILIATION BATCH (HU-SIS-06)
  const runNightlyReconciliation = () => {
    const discrepancies = [];
    db.products.forEach(p => {
      const totalPhysical = (p.stock.sucursal_1 || 0) + (p.stock.sucursal_2 || 0) + (p.stock.sucursal_3 || 0) + (p.stock.bodega_web || 0);
      if (totalPhysical < 0) {
        discrepancies.push(`Discrepancia en ${p.title} (SKU: ${p.sku}): stock negativo detectado.`);
      }
    });

    addSecurityLog(
      'CONCILIACION_NOCTURNA',
      `Proceso batch nocturno (23:59) ejecutado. ${db.products.length} productos verificados. Discrepancias encontradas: ${discrepancies.length}.`,
      discrepancies.length > 0 ? 'WARN' : 'INFO'
    );

    return {
      success: true,
      auditedCount: db.products.length,
      discrepancies,
      timestamp: new Date().toISOString()
    };
  };

  // FACTORY RESET & BACKUP (HU-SIS-07)
  const exportDatabaseBackup = () => {
    const jsonStr = JSON.stringify(db, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pixel_gamers_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addSecurityLog('RESPALDO_EXPORTADO', 'Copia de seguridad local exportada en formato JSON encriptado.', 'INFO');
  };

  const importDatabaseBackup = (importedDb) => {
    try {
      if (!importedDb.users || !importedDb.products) {
        return { success: false, message: 'Archivo de respaldo inválido o corrupto.' };
      }
      setDb(importedDb);
      addSecurityLog('RESPALDO_RESTAURADO', 'Base de datos restaurada exitosamente desde archivo JSON.', 'WARN');
      return { success: true };
    } catch {
      return { success: false, message: 'Error procesando el archivo JSON.' };
    }
  };

  const resetToFactoryDefaults = () => {
    const initialDb = {
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      digitalKeys: INITIAL_DIGITAL_KEYS,
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      phoneReservations: INITIAL_PHONE_RESERVATIONS,
      transfers: INITIAL_TRANSFERS,
      suppliers: INITIAL_SUPPLIERS,
      securityLogs: INITIAL_SECURITY_LOGS,
      settings: INITIAL_SETTINGS,
      stockAlertSubscriptions: [
        { email: 'juan.perez@email.com', productId: 'prod_10' }
      ]
    };
    setDb(initialDb);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
    setCurrentUser(initialDb.users[0]);
    setActiveRole('comprador');
    clearCart();
    return { success: true };
  };

  return (
    <StoreContext.Provider
      value={{
        db,
        currentUser,
        setCurrentUser,
        activeRole,
        setActiveRole,
        switchUserByRole,
        selectedBranch,
        setSelectedBranch,
        isOfflineMode,
        setIsOfflineMode,
        offlineQueue,
        syncOfflineQueue,
        cart,
        cartTimer,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        processCheckout,
        cancelOrder,
        addReview,
        subscribeToStockAlert,
        processPosSale,
        createPhoneReservation,
        cancelPhoneReservation,
        deliverPickupOrder,
        requestStockTransfer,
        updateTransferStatus,
        saveProduct,
        deleteProduct,
        importDigitalLicensesBatch,
        restockPhysicalProduct,
        updateOrderLogistics,
        saveUserAccount,
        updateSettings,
        runNightlyReconciliation,
        exportDatabaseBackup,
        importDatabaseBackup,
        resetToFactoryDefaults,
        addSecurityLog
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
