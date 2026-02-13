import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/pricing-engine';

export const dynamic = 'force-dynamic';

function generatePdfHtml(quote: Record<string, unknown>, items: Record<string, unknown>[], answers: Record<string, unknown>[]): string {
  const folio = String(quote?.folio ?? 'N/A');
  const clientName = String(quote?.client_name ?? 'N/A');
  const clientEmail = String(quote?.client_email ?? 'N/A');
  const clientWhatsapp = String(quote?.client_whatsapp ?? 'N/A');
  const projectType = String(quote?.project_type ?? 'N/A');
  const industry = quote?.industry ? String(quote.industry) : null;
  const timeline = String(quote?.timeline ?? 'N/A');
  const createdAt = quote?.created_at ? new Date(String(quote.created_at)).toLocaleDateString('es-CL') : 'N/A';
  const validUntil = quote?.created_at
    ? new Date(new Date(String(quote.created_at)).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL')
    : 'N/A';

  const projectTypeLabels: Record<string, string> = {
    LANDING: 'Landing Page',
    CORPORATIVA: 'Sitio Corporativo',
    ECOMMERCE: 'E-commerce',
    INTRANET: 'Intranet/Sistema',
  };

  const timelineLabels: Record<string, string> = {
    '7-10_DAYS': 'Prioridad máxima',
    '2-3_WEEKS': 'Lo necesito pronto',
    '4+_WEEKS': 'Tengo tiempo para planificar',
  };

  const sectionLabels: Record<string, string> = {
    hero: 'Hero / Portada principal',
    quienes_somos: 'Quiénes somos / Empresa',
    servicios: 'Servicios o soluciones',
    productos: 'Productos o catálogo',
    casos_exito: 'Casos de éxito / Portafolio',
    testimonios: 'Testimonios',
    faq: 'Preguntas frecuentes',
    blog_noticias: 'Blog o noticias',
    contacto: 'Contacto / formulario',
    agenda: 'Agenda / reservas',
  };

  // Group items by package
  const basicoItems = (items ?? []).filter(i => String(i?.name ?? '').startsWith('[Básico]'));
  const proItems = (items ?? []).filter(i => String(i?.name ?? '').startsWith('[Pro]'));
  const premiumItems = (items ?? []).filter(i => String(i?.name ?? '').startsWith('[Premium]'));

  const calculateTotal = (pkgItems: Record<string, unknown>[]) =>
    (pkgItems ?? []).reduce((sum, i) => sum + Number(i?.amount ?? 0), 0);

  // Parse answers
  const answerMap: Record<string, string> = {};
  (answers ?? []).forEach(a => {
    answerMap[String(a?.key ?? '')] = String(a?.value ?? '');
  });

  const features: string[] = [];
  if (answerMap.needsBlog === 'true') features.push('Blog integrado');
  if (answerMap.multiLanguage === 'true') features.push('Multi-idioma');
  if (answerMap.needsLogin === 'true') features.push('Sistema de login');
  if (answerMap.externalIntegrations === 'true') features.push('Integraciones externas');
  if (answerMap.needsPaymentGateway === 'true') features.push('Pasarela de pagos');

  const addons: string[] = [];
  if (answerMap.addon_seoInicial === 'true') addons.push('SEO inicial');
  if (answerMap.addon_copywriting === 'true') addons.push('Copywriting profesional');
  if (answerMap.addon_integracionPagos === 'true') addons.push('Integración de pagos');
  if (answerMap.addon_mantenimientoMensual === 'true') addons.push('Mantenimiento mensual');
  if (answerMap.addon_dominioCorreos === 'true') addons.push('Dominio + correos');
  if (answerMap.addon_googleAnalytics === 'true') addons.push('Google Analytics');

  let sections: string[] = [];
  try {
    const rawSections = answerMap.siteSections;
    if (rawSections) {
      const parsed = JSON.parse(rawSections);
      if (Array.isArray(parsed)) {
        sections = parsed.map((s: string) => sectionLabels[s] ?? s);
      }
    }
  } catch {
    sections = [];
  }

  if (!sections.length) {
    const legacyPages = parseInt(answerMap.numPages ?? '1', 10) || 1;
    sections = [`${legacyPages} sección(es) registradas`];
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.5; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #10b981; }
    .logo-section { display: flex; align-items: center; gap: 12px; }
    .logo { width: 60px; height: 60px; }
    .company-name { font-size: 24px; font-weight: bold; color: #059669; }
    .company-tagline { font-size: 12px; color: #6b7280; }
    .folio-section { text-align: right; }
    .folio { font-size: 20px; font-weight: bold; color: #059669; }
    .date { font-size: 12px; color: #6b7280; }
    
    .section { margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: bold; color: #059669; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
    
    .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item { font-size: 14px; }
    .info-label { color: #6b7280; }
    .info-value { font-weight: 500; }
    
    .packages { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .package { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
    .package.recommended { border-color: #10b981; background: #f0fdf4; }
    .package-name { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
    .package-price { font-size: 20px; font-weight: bold; color: #059669; margin-bottom: 12px; }
    .package-items { font-size: 12px; }
    .package-item { padding: 4px 0; border-bottom: 1px solid #f3f4f6; }
    .package-total { margin-top: 12px; padding-top: 8px; border-top: 2px solid #e5e7eb; font-weight: bold; }
    
    .features { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .feature-tag { background: #f0fdf4; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
    
    .terms { background: #f9fafb; padding: 20px; border-radius: 8px; font-size: 12px; color: #6b7280; }
    .terms-title { font-weight: bold; color: #374151; margin-bottom: 8px; }
    .terms-list { margin-left: 16px; }
    
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
    .contact-info { margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <div class="logo-text">
        <div class="company-name">VillaWeb</div>
        <div class="company-tagline">Desarrollo de Software</div>
      </div>
    </div>
    <div class="folio-section">
      <div class="folio">${folio}</div>
      <div class="date">Fecha: ${createdAt}</div>
      <div class="date">Válido hasta: ${validUntil}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Datos del Cliente</div>
    <div class="client-info">
      <div class="info-item"><span class="info-label">Nombre:</span> <span class="info-value">${clientName}</span></div>
      <div class="info-item"><span class="info-label">Email:</span> <span class="info-value">${clientEmail}</span></div>
      <div class="info-item"><span class="info-label">WhatsApp:</span> <span class="info-value">${clientWhatsapp}</span></div>
      <div class="info-item"><span class="info-label">Tipo:</span> <span class="info-value">${projectTypeLabels[projectType] ?? projectType}${industry ? ` (${industry})` : ''}</span></div>
      <div class="info-item"><span class="info-label">Plazo:</span> <span class="info-value">${timelineLabels[timeline] ?? timeline}</span></div>
      <div class="info-item"><span class="info-label">Secciones:</span> <span class="info-value">${sections.join(', ')}</span></div>
    </div>
  </div>

  ${features.length > 0 || addons.length > 0 ? `
  <div class="section">
    <div class="section-title">Funcionalidades y Extras</div>
    <div class="features">
      ${features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
      ${addons.map(a => `<span class="feature-tag">${a}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Opciones de Paquetes</div>
    <div class="packages">
      <div class="package">
        <div class="package-name">Básico</div>
        <div class="package-price">${formatPrice(calculateTotal(basicoItems))}</div>
        <div class="package-items">
          ${basicoItems.map(i => `<div class="package-item">${String(i?.name ?? '').replace('[Básico] ', '')}: ${formatPrice(Number(i?.amount ?? 0))}</div>`).join('')}
        </div>
      </div>
      <div class="package recommended">
        <div class="package-name">Pro ⭐</div>
        <div class="package-price">${formatPrice(calculateTotal(proItems))}</div>
        <div class="package-items">
          ${proItems.map(i => `<div class="package-item">${String(i?.name ?? '').replace('[Pro] ', '')}: ${formatPrice(Number(i?.amount ?? 0))}</div>`).join('')}
        </div>
      </div>
      <div class="package">
        <div class="package-name">Premium</div>
        <div class="package-price">${formatPrice(calculateTotal(premiumItems))}</div>
        <div class="package-items">
          ${premiumItems.map(i => `<div class="package-item">${String(i?.name ?? '').replace('[Premium] ', '')}: ${formatPrice(Number(i?.amount ?? 0))}</div>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="terms">
      <div class="terms-title">Términos y Condiciones</div>
      <ul class="terms-list">
        <li>Esta cotización tiene una validez de 7 días desde su emisión.</li>
        <li>Los precios están expresados en pesos chilenos (CLP) e incluyen IVA.</li>
        <li>Forma de pago sugerida: 50% al inicio del proyecto, 50% a la entrega.</li>
        <li>Los tiempos de entrega comienzan a contar desde la recepción del primer pago y el material necesario.</li>
        <li>Incluye hasta 2 rondas de revisiones. Cambios adicionales pueden generar costos extra.</li>
      </ul>
    </div>
  </div>

  <div class="footer">
    <strong>VillaWeb - Desarrollo de Software</strong>
    <div class="contact-info">
      Email: cristianvillalobosvv@gmail.com | WhatsApp: +56 9 7328 3737
    </div>
  </div>
</body>
</html>
  `;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id ?? '';
    const supabase = getSupabaseClient();

    // public_token is also UUID, so always try both fields.
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .or(`id.eq.${id},public_token.eq.${id}`)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }

    // Get items and answers
    const { data: items } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quote.id);

    const { data: answers } = await supabase
      .from('quote_answers')
      .select('*')
      .eq('quote_id', quote.id);

    const htmlContent = generatePdfHtml(quote, items ?? [], answers ?? []);

    // Create PDF request
    const createResponse = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: htmlContent,
        pdf_options: {
          format: 'A4',
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
          print_background: true,
        },
        base_url: process.env.NEXTAUTH_URL || '',
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({}));
      console.error('PDF creation error:', error);
      return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 });
    }

    const { request_id } = await createResponse.json();
    if (!request_id) {
      return NextResponse.json({ error: 'No se pudo iniciar la generación del PDF' }, { status: 500 });
    }

    // Poll for status
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusResponse = await fetch('https://apps.abacus.ai/api/getConvertHtmlToPdfStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id, deployment_token: process.env.ABACUSAI_API_KEY }),
      });

      const statusResult = await statusResponse.json();
      const status = statusResult?.status ?? 'FAILED';
      const result = statusResult?.result ?? null;

      if (status === 'SUCCESS' && result?.result) {
        // Log event
        await supabase.from('quote_events').insert({
          quote_id: quote.id,
          event: 'PDF_DOWNLOADED',
          metadata: { source: 'public' },
        });

        const pdfBuffer = Buffer.from(result.result, 'base64');
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Cotizacion-${quote.folio}.pdf"`,
          },
        });
      } else if (status === 'FAILED') {
        return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 });
      }

      attempts++;
    }

    return NextResponse.json({ error: 'Tiempo de espera agotado' }, { status: 500 });
  } catch (error) {
    console.error('Error in GET /api/quotes/[id]/pdf:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
