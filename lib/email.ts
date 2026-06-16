import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type OrganizerMessageEmailData = {
  to: string
  firstName: string
  organizerName: string
  experienceTitle: string
  experienceId: string
  messagePreview: string
}

export async function sendOrganizerMessageEmail(data: OrganizerMessageEmailData) {
  const { to, firstName, organizerName, experienceTitle, experienceId, messagePreview } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const chatUrl = `${baseUrl}/chat/${experienceId}`

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `${organizerName} a posté un message — ${experienceTitle}`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Nouveau message de l'organisateur</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${firstName}</strong>,</p>
            <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;">${organizerName} vient de publier un message dans le chat de <strong>${experienceTitle}</strong>&nbsp;:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;font-size:14px;color:#1A1A2E;line-height:1.6;border-left:3px solid #4A6CF7;">${messagePreview}${messagePreview.length >= 200 ? '…' : ''}</td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${chatUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                  Voir le chat →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · Nice, Côte d'Azur · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

// ─── Phase 5 — Appels d'offres ───────────────────────────────

type BriefOpenEmailData = {
  to: string
  firstName: string
  organizerName: string
  briefTitle: string
  briefDescription: string
  city: string
  eventDate: string
  budgetLabel: string | null
  briefId: string
  actorType: 'lieu' | 'fournisseur'
}

export async function sendBriefOpenEmail(data: BriefOpenEmailData) {
  const { to, firstName, organizerName, briefTitle, briefDescription, city, eventDate, budgetLabel, briefId, actorType } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const briefUrl = `${baseUrl}/${actorType}/demandes/${briefId}`
  const dateFmt = new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Nouvelle demande de ${organizerName} — ${briefTitle}`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Nouvelle demande reçue</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${firstName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;"><strong>${organizerName}</strong> recherche un${actorType === 'lieu' ? ' lieu' : ' prestataire'} pour :</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:12px;margin-bottom:20px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1A1A2E;">${briefTitle}</p>
              <p style="margin:0 0 12px;font-size:13px;color:#6B6B7A;line-height:1.6;">${briefDescription.slice(0, 300)}${briefDescription.length > 300 ? '…' : ''}</p>
              <p style="margin:0 0 4px;font-size:12px;color:#6B6B7A;">📅 ${dateFmt} · 📍 ${city}${budgetLabel ? ` · 💰 Budget estimé : ${budgetLabel}` : ''}</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${briefUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Voir la demande et répondre →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

type NewOfferEmailData = {
  to: string
  organizerFirstName: string
  responderName: string
  briefTitle: string
  amountCents: number
  briefId: string
}

export async function sendNewOfferEmail(data: NewOfferEmailData) {
  const { to, organizerFirstName, responderName, briefTitle, amountCents, briefId } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const briefUrl = `${baseUrl}/organisateur/briefs/${briefId}`
  const amountFmt = `${Math.round(amountCents / 100)} €`

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `${responderName} a répondu à votre appel d'offres — ${briefTitle}`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Nouvelle offre reçue</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${organizerFirstName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;"><strong>${responderName}</strong> a répondu à votre appel d'offres <strong>${briefTitle}</strong> avec une offre de <strong style="color:#4A6CF7;">${amountFmt}</strong>.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${briefUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Voir les offres →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

type OfferSelectedEmailData = {
  to: string
  firstName: string
  briefTitle: string
  amountCents: number
  platformFeeCents: number
  briefId: string
  actorType: 'lieu' | 'fournisseur'
}

export async function sendOfferSelectedEmail(data: OfferSelectedEmailData) {
  const { to, firstName, briefTitle, amountCents, platformFeeCents, briefId, actorType } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const briefUrl = `${baseUrl}/${actorType}/demandes/${briefId}`
  const netCents = amountCents - platformFeeCents

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Votre offre a été retenue — ${briefTitle} 🎉`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;">Félicitations, votre offre est retenue ✓</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${firstName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;">L'organisateur a retenu votre offre pour <strong>${briefTitle}</strong>.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B6B7A;text-transform:uppercase;letter-spacing:1px;">Montant de votre offre</p>
              <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#4A6CF7;">${Math.round(amountCents / 100)} €</p>
              <p style="margin:0;font-size:12px;color:#6B6B7A;">Commission Soirée Villa (15%) : ${Math.round(platformFeeCents / 100)} € · Net reversé : ${Math.round(netCents / 100)} €</p>
            </td></tr>
          </table>
          <p style="margin:0 0 20px;font-size:13px;color:#6B6B7A;">L'équipe Soirée Villa vous contactera pour les modalités de paiement et de reversement.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${briefUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Voir la demande →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

type OfferRejectedEmailData = {
  to: string
  firstName: string
  briefTitle: string
}

export async function sendOfferRejectedEmail(data: OfferRejectedEmailData) {
  const { to, firstName, briefTitle } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Résultat de votre offre — ${briefTitle}`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#F5F5FA;padding:24px 32px;text-align:center;border-bottom:1px solid #E5E5F0;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#6B6B7A;letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:18px;font-weight:700;color:#1A1A2E;">Résultat de votre candidature</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${firstName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;line-height:1.6;">L'organisateur a sélectionné une autre offre pour <strong>${briefTitle}</strong>. Votre candidature n'a pas été retenue cette fois-ci.</p>
          <p style="margin:0;font-size:14px;color:#6B6B7A;">D'autres demandes vous attendent — consultez votre espace pour voir les nouvelles opportunités.</p>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

// ─── Phase 6 — Devis combinatoires ───────────────────────────

type QuoteEmailData = {
  to: string
  clientName: string
  organizerName: string
  eventDate: string
  totalCents: number
  shareUrl: string
  pdfBuffer: Buffer
}

export async function sendQuoteEmail(data: QuoteEmailData) {
  const { to, clientName, organizerName, eventDate, totalCents, shareUrl, pdfBuffer } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const dateFmt = new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const totalFmt = `${Math.round(totalCents / 100)} €`

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Votre devis Soirée Villa — ${dateFmt}`,
    attachments: [{ filename: 'Devis_SoireeVilla.pdf', content: pdfBuffer }],
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Votre devis est arrivé</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${clientName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;"><strong>${organizerName}</strong> vous a préparé un devis pour votre événement du <strong>${dateFmt}</strong>.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;color:#6B6B7A;text-transform:uppercase;letter-spacing:1px;">Total TTC</p>
              <p style="margin:0;font-size:28px;font-weight:700;color:#4A6CF7;">${totalFmt}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 20px;font-size:13px;color:#6B6B7A;">Le devis complet est joint en pièce jointe (PDF). Vous pouvez également le consulter et l'accepter en ligne :</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${shareUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Voir et accepter le devis →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

type QuoteAcceptedEmailData = {
  to: string
  organizerName: string
  clientName: string
  eventDate: string
  totalCents: number
  quoteId: string
}

export async function sendQuoteAcceptedEmail(data: QuoteAcceptedEmailData) {
  const { to, organizerName, clientName, eventDate, totalCents, quoteId } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const dateFmt = new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Devis accepté par ${clientName} — ${dateFmt} 🎉`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Devis accepté ✓</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${organizerName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;"><strong>${clientName}</strong> vient d'accepter votre devis de <strong style="color:#4A6CF7;">${Math.round(totalCents / 100)} €</strong> pour le <strong>${dateFmt}</strong>.</p>
          <p style="margin:0 0 20px;font-size:13px;color:#6B6B7A;">Les prestataires concernés ont été notifiés par email.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${baseUrl}/organisateur/devis/${quoteId}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Voir le devis →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

type ContractConfirmedEmailData = {
  to: string
  recipientName: string
  clientName: string
  eventDate: string
  amountCents: number
  platformFeeCents: number
}

export async function sendContractConfirmedEmail(data: ContractConfirmedEmailData) {
  const { to, recipientName, clientName, eventDate, amountCents, platformFeeCents } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const dateFmt = new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const netCents = amountCents - platformFeeCents

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Contrat confirmé — soirée du ${dateFmt} 🎉`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Votre prestation est confirmée ✓</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${recipientName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;"><strong>${clientName}</strong> a accepté le devis vous incluant pour la soirée du <strong>${dateFmt}</strong>.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B6B7A;text-transform:uppercase;letter-spacing:1px;">Montant</p>
              <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#4A6CF7;">${Math.round(amountCents / 100)} €</p>
              <p style="margin:0;font-size:12px;color:#6B6B7A;">Commission Soirée Villa (15%) : ${Math.round(platformFeeCents / 100)} € · Net reversé : ${Math.round(netCents / 100)} €</p>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#6B6B7A;">L'équipe Soirée Villa vous contactera pour les modalités de paiement et de reversement.</p>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

type QuoteRejectedEmailData = {
  to: string
  organizerName: string
  clientName: string
  eventDate: string
  quoteId: string
}

export async function sendQuoteRejectedEmail(data: QuoteRejectedEmailData) {
  const { to, organizerName, clientName, eventDate, quoteId } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const dateFmt = new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Devis refusé par ${clientName} — ${dateFmt}`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#F5F5FA;padding:24px 32px;text-align:center;border-bottom:1px solid #E5E5F0;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#6B6B7A;letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:18px;font-weight:700;color:#1A1A2E;">Devis refusé</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${organizerName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;line-height:1.6;"><strong>${clientName}</strong> a décliné votre devis pour l'événement du ${dateFmt}.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${baseUrl}/organisateur/devis/${quoteId}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Voir le devis →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

// ─── Phase 8 — Marketplace ────────────────────────────────────

type ContactRequestEmailData = {
  to: string
  recipientName: string
  senderName: string
  senderEmail: string
  message: string
  targetName: string
  targetType: 'lieu' | 'fournisseur'
}

export async function sendContactRequestEmail(data: ContactRequestEmailData) {
  const { to, recipientName, senderName, senderEmail, message, targetName, targetType } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const inboxUrl = `${baseUrl}/${targetType}/demandes-contact`

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Nouvelle demande de contact — ${targetName}`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Nouvelle demande de contact</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${recipientName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;"><strong>${senderName}</strong> (${senderEmail}) a envoyé une demande de contact pour <strong>${targetName}</strong>&nbsp;:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;font-size:14px;color:#1A1A2E;line-height:1.6;border-left:3px solid #4A6CF7;">${message.slice(0, 500)}${message.length > 500 ? '…' : ''}</td></tr>
          </table>
          <p style="margin:0 0 20px;font-size:13px;color:#6B6B7A;">Répondez directement à <a href="mailto:${senderEmail}" style="color:#4A6CF7;">${senderEmail}</a> ou via votre espace prestataire.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${inboxUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Voir mes demandes →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

type NewReviewNotificationData = {
  authorName: string
  targetName: string
  targetType: 'lieu' | 'fournisseur'
  rating: number
  comment: string | null
}

export async function sendNewReviewNotification(data: NewReviewNotificationData) {
  const { authorName, targetName, targetType, rating, comment } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const adminUrl = `${baseUrl}/admin/avis`
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to: 'misterzehar@gmail.com',
    subject: `Nouvel avis à modérer — ${targetName} (${stars})`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#F5F5FA;padding:20px 32px;text-align:center;border-bottom:1px solid #E5E5F0;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#6B6B7A;text-transform:uppercase;letter-spacing:2px;">Soirée Villa — Admin</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 12px;font-size:15px;">Nouvel avis soumis par <strong>${authorName}</strong> pour le ${targetType} <strong>${targetName}</strong>.</p>
          <p style="margin:0 0 16px;font-size:20px;color:#4A6CF7;">${stars}</p>
          ${comment ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:12px;margin-bottom:20px;"><tr><td style="padding:14px 18px;font-size:13px;color:#1A1A2E;line-height:1.6;border-left:3px solid #4A6CF7;">${comment}</td></tr></table>` : ''}
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${adminUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Modérer l'avis →
              </a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

// ─── Phase 10 — Rappels + NPS ────────────────────────────────

type ReminderType = 'j7' | 'j1' | 'j0'
type OrganizerReminderType = 'j3' | 'j1'

type ReminderEmailData = {
  to: string
  firstName: string
  experienceTitle: string
  experienceDate: string
  venueName: string
  type: ReminderType
  experienceId: string
}

export async function sendReminderEmail(data: ReminderEmailData) {
  const { to, firstName, experienceTitle, experienceDate, venueName, type, experienceId } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const expUrl = `${baseUrl}/experiences/${experienceId}`
  const dateFmt = formatDate(experienceDate)

  const subjects: Record<ReminderType, string> = {
    j7: `J-7 — Ta soirée arrive bientôt : ${experienceTitle}`,
    j1: `Demain c'est le jour ! — ${experienceTitle}`,
    j0: `C'est aujourd'hui ! — ${experienceTitle}`,
  }
  const intros: Record<ReminderType, string> = {
    j7: `Dans 7 jours, tu vis <strong>${experienceTitle}</strong>. On a hâte de t'y voir !`,
    j1: `Demain, c'est <strong>${experienceTitle}</strong>. Tout est prêt ?`,
    j0: `C'est aujourd'hui ! <strong>${experienceTitle}</strong> t'attend.`,
  }

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: subjects[type],
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Rappel soirée</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${firstName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;">${intros[type]}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 4px;font-size:11px;color:#6B6B7A;text-transform:uppercase;letter-spacing:1px;">Expérience</p>
              <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#1A1A2E;">${experienceTitle}</p>
              <p style="margin:0 0 4px;font-size:12px;color:#6B6B7A;">📅 ${dateFmt}</p>
              <p style="margin:0;font-size:12px;color:#6B6B7A;">📍 ${venueName}</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${expUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Voir les détails →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

type OrganizerReminderEmailData = {
  to: string
  firstName: string
  experienceTitle: string
  experienceDate: string
  type: OrganizerReminderType
  experienceId: string
}

export async function sendOrganizerReminderEmail(data: OrganizerReminderEmailData) {
  const { to, firstName, experienceTitle, experienceDate, type, experienceId } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const expUrl = `${baseUrl}/organisateur/experiences/${experienceId}`
  const dateFmt = formatDate(experienceDate)

  const subjects: Record<OrganizerReminderType, string> = {
    j3: `J-3 — Prépare ta soirée : ${experienceTitle}`,
    j1: `Demain tu animes : ${experienceTitle}`,
  }
  const tips: Record<OrganizerReminderType, string> = {
    j3: 'Dans 3 jours, tu animes ta soirée. C\'est le bon moment pour envoyer un message de bienvenue à tes participants dans le chat !',
    j1: 'Demain c\'est ton jour ! Prépare ta liste d\'inscrits, prévois ton check-in, et assure-toi que le lieu est confirmé.',
  }

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: subjects[type],
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa — Organisateur</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Rappel organisateur</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${firstName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B7A;">${tips[type]}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 4px;font-size:11px;color:#6B6B7A;text-transform:uppercase;letter-spacing:1px;">Ta soirée</p>
              <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1A1A2E;">${experienceTitle}</p>
              <p style="margin:0;font-size:12px;color:#6B6B7A;">📅 ${dateFmt}</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${expUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">
                Gérer ma soirée →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

type NpsEmailData = {
  to: string
  firstName: string
  experienceTitle: string
  registrationId: string
}

export async function sendNpsEmail(data: NpsEmailData) {
  const { to, firstName, experienceTitle, registrationId } = data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const npsUrl = `${baseUrl}/nps/${registrationId}`

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Comment s'est passé ${experienceTitle} ? (30 sec)`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;">Comment c'était ? 💛</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:15px;">Bonjour <strong>${firstName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#6B6B7A;line-height:1.6;">
            J'espère que <strong>${experienceTitle}</strong> était à la hauteur de tes attentes.<br/>
            30 secondes de retour nous aident vraiment à améliorer l'expérience pour tout le monde.
          </p>
          <a href="${npsUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:14px;">
            Donner mon avis →
          </a>
          <p style="margin:20px 0 0;font-size:11px;color:#6B6B7A;">Lien unique, anonyme. Ça prend 30 secondes.</p>
        </td></tr>
        <tr><td style="background:#F5F5FA;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6B7A;">Soirée Villa · <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })
}

// ─────────────────────────────────────────────────────────────

type ConfirmationEmailData = {
  to: string
  firstName: string
  experienceTitle: string
  experienceDate: string
  venueName: string
  tierLabel: string
  amountPaidCents: number
  experienceId: string
  stripeSessionId: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }) + ' à ' + new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  })
}

export async function sendConfirmationEmail(data: ConfirmationEmailData) {
  const {
    to, firstName, experienceTitle, experienceDate,
    venueName, tierLabel, amountPaidCents, experienceId, stripeSessionId,
  } = data

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const confirmationUrl = `${baseUrl}/experiences/${experienceId}/confirmation?session_id=${stripeSessionId}`
  const charteUrl = `${baseUrl}/charte`
  const priceFmt = `${Math.round(amountPaidCents / 100)} €`
  const dateFmt = formatDate(experienceDate)

  await resend.emails.send({
    from: 'Soirée Villa <noreply@soireevilla.fr>',
    to,
    subject: `Ta place est confirmée — ${experienceTitle}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ta place est confirmée</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4A6CF7,#A259FF);padding:32px 32px 24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Soirée Villa</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#FFFFFF;line-height:1.3;">Ta place est confirmée ✓</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
                Bonjour <strong>${firstName}</strong>,<br/>
                Ton inscription est validée. On est ravis de t'avoir avec nous !
              </p>

              <!-- Recap card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5FA;border-radius:16px;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B6B7A;letter-spacing:1.5px;text-transform:uppercase;">Expérience</p>
                    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1A1A2E;">${experienceTitle}</p>

                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B6B7A;letter-spacing:1.5px;text-transform:uppercase;">Date</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#1A1A2E;text-transform:capitalize;">${dateFmt}</p>

                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B6B7A;letter-spacing:1.5px;text-transform:uppercase;">Lieu</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#1A1A2E;">${venueName}</p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B6B7A;letter-spacing:1.5px;text-transform:uppercase;">Tarif</p>
                          <p style="margin:0;font-size:14px;color:#1A1A2E;">${tierLabel}</p>
                        </td>
                        <td align="right">
                          <p style="margin:0;font-size:24px;font-weight:700;color:#4A6CF7;">${priceFmt}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${confirmationUrl}" style="display:inline-block;background:#4A6CF7;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:14px;">
                      Voir ma réservation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <p style="margin:0 0 8px;font-size:12px;color:#6B6B7A;line-height:1.6;">
                En t'inscrivant, tu as accepté la charte de Soirée Villa.
                <a href="${charteUrl}" style="color:#4A6CF7;text-decoration:underline;">La relire ici</a>.
              </p>
              <p style="margin:0;font-size:12px;color:#6B6B7A;line-height:1.6;">
                Annulation possible jusqu'à 48h avant l'expérience — réponds simplement à cet email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F5F5FA;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#6B6B7A;">
                Soirée Villa · Nice, Côte d'Azur<br/>
                <a href="${baseUrl}" style="color:#4A6CF7;text-decoration:none;">soireevilla.fr</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}
