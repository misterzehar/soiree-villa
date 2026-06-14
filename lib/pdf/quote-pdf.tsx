import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const BLUE   = '#4A6CF7'
const DARK   = '#1A1A2E'
const MUTED  = '#6B6B7A'
const LIGHT  = '#F5F5FA'
const BORDER = '#E5E5F0'

const s = StyleSheet.create({
  page:         { padding: 48, fontFamily: 'Helvetica', color: DARK, fontSize: 10 },
  logo:         { fontSize: 8, color: MUTED, letterSpacing: 2, marginBottom: 6 },
  title:        { fontSize: 26, color: DARK, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle:     { fontSize: 10, color: MUTED, marginBottom: 36 },
  infoRow:      { flexDirection: 'row', marginBottom: 28 },
  infoCol:      { flex: 1, marginRight: 16 },
  infoLabel:    { fontSize: 8, color: MUTED, marginBottom: 3 },
  infoValue:    { fontSize: 11, color: DARK, fontFamily: 'Helvetica-Bold' },
  divider:      { borderTopWidth: 1, borderTopColor: BORDER, marginBottom: 16 },
  tableHead:    { flexDirection: 'row', backgroundColor: LIGHT, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 2 },
  tableHeadTxt: { fontSize: 8, color: MUTED, fontFamily: 'Helvetica-Bold' },
  lineRow:      { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  lineLabel:    { flex: 1, fontSize: 10, color: DARK },
  lineAmount:   { fontSize: 10, color: DARK, fontFamily: 'Helvetica-Bold', textAlign: 'right', minWidth: 72 },
  totalBlock:   { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 20, paddingHorizontal: 12 },
  totalLabel:   { fontSize: 12, color: DARK, fontFamily: 'Helvetica-Bold', marginRight: 24 },
  totalValue:   { fontSize: 20, color: BLUE, fontFamily: 'Helvetica-Bold' },
  footer:       { marginTop: 40, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 12 },
  footerText:   { fontSize: 8, color: MUTED, textAlign: 'center' },
  descBlock:    { backgroundColor: LIGHT, borderRadius: 4, padding: 12, marginBottom: 28 },
  descText:     { fontSize: 10, color: DARK, lineHeight: 1.6 },
})

type QuoteLinePDF = {
  id: string
  label: string
  amount_cents: number
  sort_order: number
}

type Props = {
  quoteId: string
  clientName: string
  clientEmail: string
  eventDate: string
  description: string
  organizerName: string
  lines: QuoteLinePDF[]
  totalCents: number
}

function fmt(cents: number) {
  return `${Math.round(cents / 100).toLocaleString('fr-FR')} €`
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function QuotePDF({ quoteId, clientName, clientEmail, eventDate, description, organizerName, lines, totalCents }: Props) {
  const sorted = [...lines].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <Document title={`Devis — ${clientName}`} author="Soirée Villa">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <Text style={s.logo}>SOIRÉE VILLA</Text>
        <Text style={s.title}>Devis</Text>
        <Text style={s.subtitle}>Réf. {quoteId.slice(0, 8).toUpperCase()}</Text>

        {/* Client + Organizer + Date */}
        <View style={s.infoRow}>
          <View style={s.infoCol}>
            <Text style={s.infoLabel}>CLIENT</Text>
            <Text style={s.infoValue}>{clientName}</Text>
            <Text style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{clientEmail}</Text>
          </View>
          <View style={s.infoCol}>
            <Text style={s.infoLabel}>ORGANISATEUR</Text>
            <Text style={s.infoValue}>{organizerName}</Text>
          </View>
          <View style={[s.infoCol, { marginRight: 0 }]}>
            <Text style={s.infoLabel}>DATE DE L'ÉVÉNEMENT</Text>
            <Text style={s.infoValue}>{fmtDate(eventDate)}</Text>
          </View>
        </View>

        {/* Description */}
        {description && description.length > 0 && (
          <View style={s.descBlock}>
            <Text style={s.descText}>{description}</Text>
          </View>
        )}

        <View style={s.divider} />

        {/* Lines table */}
        <View style={s.tableHead}>
          <Text style={[s.tableHeadTxt, { flex: 1 }]}>PRESTATION</Text>
          <Text style={[s.tableHeadTxt, { textAlign: 'right', minWidth: 72 }]}>MONTANT TTC</Text>
        </View>

        {sorted.map((line) => (
          <View key={line.id} style={s.lineRow}>
            <Text style={s.lineLabel}>{line.label}</Text>
            <Text style={s.lineAmount}>{fmt(line.amount_cents)}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={s.totalBlock}>
          <Text style={s.totalLabel}>Total TTC</Text>
          <Text style={s.totalValue}>{fmt(totalCents)}</Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Soirée Villa · Nice, Côte d'Azur · soireevilla.fr · contact@soireevilla.fr
          </Text>
          <Text style={[s.footerText, { marginTop: 4 }]}>
            Devis valable 30 jours · TVA non applicable (auto-entrepreneur)
          </Text>
        </View>

      </Page>
    </Document>
  )
}
