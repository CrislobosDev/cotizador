# Cotizador Pro VillaWeb

Aplicación web para generar cotizaciones instantáneas de proyectos web con folio único, 3 paquetes (Básico/Pro/Premium), add-ons, generación de PDF con branding, y panel de administración.

## Características

- 📊 **Wizard multi-step** para recoger datos del cliente
- 💰 **Motor de precios** con cálculo automático de 3 paquetes
- 📄 **Generación de PDF** con branding completo
- 📨 **Integración WhatsApp** para envío de cotizaciones
- 🔒 **Panel de administración** protegido
- 📱 **Diseño responsive** mobile-first

## Stack Tecnológico

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Supabase (Auth + Postgres)
- Framer Motion

## Configuración

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXTAUTH_SECRET=tu_secret_key
NEXTAUTH_URL=http://localhost:3000
ABACUSAI_API_KEY=tu_api_key
```

### Configuración de Supabase

1. Crea un proyecto en Supabase
2. Ejecuta el script SQL ubicado en `scripts/supabase-schema.sql` en el SQL Editor de Supabase
3. Configura las políticas RLS según tus necesidades de seguridad

## Desarrollo

```bash
# Instalar dependencias
yarn install

# Iniciar servidor de desarrollo
yarn dev
```

## Estructura del Proyecto

```
app/
├── page.tsx                    # Landing pública
├── cotizar/
│   ├── page.tsx               # Wizard de cotización
│   └── resultados/[token]/    # Página de resultados
├── admin/
│   ├── login/                 # Login admin
│   └── cotizaciones/          # Lista y detalle de cotizaciones
└── api/
    ├── quotes/                # CRUD de cotizaciones
    ├── admin/                 # Endpoints admin
    └── auth/                  # NextAuth
```

## Motor de Precios

### Precios Base (CLP)
- Landing: $250.000
- Corporativa: $500.000
- E-commerce: $900.000
- Intranet: $2.500.000

### Multiplicadores
- Urgencia 7-10 días: x1.4
- Urgencia 2-3 semanas: x1.2
- Multi-idioma: +20%

### Add-ons
- SEO inicial: $120.000
- Copywriting: $80.000
- Integración pagos: $180.000
- Mantenimiento mensual: $49.000/mes
- Dominio + correos: $50.000
- Google Analytics: $30.000

## Contacto

- Email: cristianvillalobosvv@gmail.com
- WhatsApp: +56 9 7328 3737
# cotizador
