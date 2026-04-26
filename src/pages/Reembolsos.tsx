import LegalLayout from "@/components/LegalLayout";

export default function Reembolsos() {
  return (
    <LegalLayout title="Política de Reembolsos">
      <p>
        En <strong>VAL IN BLOOM</strong> queremos que estés satisfecho con Control de Cargas. Por eso ofrecemos
        una <strong>garantía de devolución de 30 días</strong>.
      </p>

      <h2>1. Período de Reembolso</h2>
      <p>
        Si no estás satisfecho con tu suscripción, puedes solicitar un reembolso completo
        dentro de los <strong>30 días</strong> posteriores a la fecha de tu primer cobro.
      </p>

      <h2>2. Prueba Gratuita de 7 Días</h2>
      <p>
        Todas las suscripciones nuevas incluyen 7 días de prueba gratuita. No se realiza
        ningún cobro durante la prueba; puedes cancelar antes de que termine y no se te
        cobrará. El período de 30 días para solicitar reembolso comienza a partir del primer
        cobro real, una vez finalizada la prueba.
      </p>

      <h2>3. Cómo Solicitar un Reembolso</h2>
      <p>Para pedir un reembolso:</p>
      <ul>
        <li>Contáctanos desde la aplicación o el sitio web indicando el correo de tu cuenta y la fecha de la compra.</li>
        <li>O contacta directamente a nuestro procesador de pagos Stripe a través del recibo que recibiste por correo.</li>
      </ul>
      <p>
        Procesaremos los reembolsos aprobados al método de pago original dentro de 5 a 10 días
        hábiles, dependiendo de tu banco.
      </p>

      <h2>4. Cancelación de Suscripción</h2>
      <p>
        Puedes cancelar tu suscripción en cualquier momento desde la sección "Gestionar
        suscripción" en tu cuenta. La cancelación detiene futuras renovaciones; mantienes
        acceso hasta el final del período ya pagado.
      </p>

      <h2>5. Renovaciones</h2>
      <p>
        Después del período de 30 días, las renovaciones de la suscripción no son reembolsables
        en general. Si crees que se realizó un cobro por error, contáctanos y revisaremos cada
        caso individualmente.
      </p>

      <h2>6. Contacto</h2>
      <p>
        Para preguntas sobre esta política, contáctanos desde la aplicación.
      </p>
    </LegalLayout>
  );
}
