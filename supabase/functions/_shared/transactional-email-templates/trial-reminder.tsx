import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Control de Cargas'
const PRICING_URL = 'https://controldecargas.com/precios'

interface TrialReminderProps {
  name?: string
  daysLeft?: number
}

const TrialReminderEmail = ({ name, daysLeft = 2 }: TrialReminderProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu prueba gratuita termina pronto — elige un plan para seguir usando {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Hola ${name},` : 'Hola,'}
        </Heading>
        <Text style={text}>
          Tu prueba gratuita de <strong>{SITE_NAME}</strong> termina en{' '}
          <strong>{daysLeft} {daysLeft === 1 ? 'día' : 'días'}</strong>.
        </Text>
        <Text style={text}>
          Para seguir registrando cargas, gasolina y peajes sin interrupciones,
          elige uno de nuestros planes:
        </Text>
        <Section style={planBox}>
          <Text style={planText}><strong>Pro Mensual</strong> — $4.99/mes</Text>
          <Text style={planText}><strong>Pro Anual</strong> — $39.99/año</Text>
        </Section>
        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
          <Button href={PRICING_URL} style={button}>
            Elegir mi plan
          </Button>
        </Section>
        <Text style={footer}>
          Si no eliges un plan antes de que termine tu prueba, perderás el acceso a la app.
        </Text>
        <Text style={footer}>— El equipo de {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TrialReminderEmail,
  subject: (data: Record<string, any>) =>
    `Tu prueba gratuita termina en ${data.daysLeft ?? 2} ${(data.daysLeft ?? 2) === 1 ? 'día' : 'días'}`,
  displayName: 'Recordatorio de prueba',
  previewData: { name: 'Carlos', daysLeft: 2 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 16px' }
const planBox = { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px 20px', margin: '20px 0' }
const planText = { fontSize: '15px', color: '#0f172a', margin: '4px 0' }
const button = { backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }
const footer = { fontSize: '13px', color: '#64748b', margin: '20px 0 0', lineHeight: '1.5' }
