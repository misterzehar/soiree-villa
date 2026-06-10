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
    from: 'Soirée Villa <onboarding@resend.dev>',
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
    from: 'Soirée Villa <onboarding@resend.dev>',
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
