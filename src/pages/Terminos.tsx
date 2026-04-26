import LegalLayout from "@/components/LegalLayout";

export default function Terminos() {
  return (
    <LegalLayout title="Términos y Condiciones">
      <p>
        Estos Términos y Condiciones ("Términos") regulan el uso de la aplicación
        Control de Cargas ("Servicio"), operada por <strong>VAL IN BLOOM</strong> ("nosotros", "nuestro" o "el Vendedor"). Al usar el Servicio,
        aceptas estos Términos. Si no estás de acuerdo, no utilices el Servicio.
      </p>

      <h2>1. Identidad del Vendedor</h2>
      <p>
        El Servicio es proporcionado por VAL IN BLOOM. Al registrarte y usar el Servicio,
        estás contratando con VAL IN BLOOM.
      </p>

      <h2>2. Descripción del Servicio</h2>
      <p>
        Control de Cargas es una aplicación web de software como servicio (SaaS) que permite a
        conductores y operadores de transporte registrar cargas, gasolina, peajes y gastos del
        vehículo, y generar reportes de rentabilidad.
      </p>

      <h2>3. Aceptación y Capacidad</h2>
      <p>
        Para usar el Servicio debes ser mayor de edad en tu jurisdicción. Si lo usas en nombre
        de una empresa, declaras tener autoridad para vincularla a estos Términos.
      </p>

      <h2>4. Cuenta y Credenciales</h2>
      <p>
        Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de
        toda actividad que ocurra bajo tu cuenta. Debes proporcionar información precisa y
        mantenerla actualizada.
      </p>

      <h2>5. Uso Aceptable</h2>
      <p>No debes:</p>
      <ul>
        <li>Usar el Servicio para actividades ilegales, fraude o spam.</li>
        <li>Infringir derechos de propiedad intelectual de terceros.</li>
        <li>Interferir con la seguridad del Servicio (malware, escaneo, scraping no autorizado).</li>
        <li>Revender, redistribuir o eludir los límites técnicos del Servicio.</li>
        <li>Realizar ingeniería inversa del software.</li>
      </ul>

      <h2>6. Propiedad Intelectual</h2>
      <p>
        VAL IN BLOOM conserva todos los derechos sobre el Servicio, incluyendo software,
        documentación, marcas y diseño. Te otorgamos una licencia limitada, no exclusiva e
        intransferible para usar el Servicio dentro de tu plan contratado.
      </p>

      <h2>7. Contenido del Usuario</h2>
      <p>
        Los datos que ingreses (cargas, gastos, etc.) son tuyos. Nos otorgas una licencia
        limitada para alojarlos y procesarlos con el único fin de proveer el Servicio.
      </p>

      <h2>8. Suscripciones, Pagos y Facturación</h2>
      <p>
        El Servicio se ofrece mediante suscripción mensual ($4.99 USD) o anual ($39.99 USD),
        con un período de prueba gratuito de 7 días. Los pagos son procesados por nuestro
        proveedor Stripe. VAL IN BLOOM es el vendedor y responsable de la facturación. Al
        finalizar la prueba, se cobra automáticamente el plan elegido y se renueva al final
        de cada período hasta que canceles.
      </p>
      <p>
        Puedes cancelar tu suscripción en cualquier momento desde tu cuenta. La cancelación
        toma efecto al final del período de facturación actual; mantienes acceso hasta esa
        fecha. Los impuestos aplicables se añaden según tu jurisdicción.
      </p>

      <h2>9. Reembolsos</h2>
      <p>
        Consulta nuestra <a href="/reembolsos">Política de Reembolsos</a> para conocer los plazos
        y el procedimiento.
      </p>

      <h2>10. Nivel de Servicio</h2>
      <p>
        Hacemos esfuerzos razonables para mantener el Servicio disponible, pero no garantizamos
        un funcionamiento ininterrumpido o libre de errores. Hasta donde lo permita la ley,
        rechazamos toda garantía implícita, incluyendo comerciabilidad e idoneidad para un
        propósito particular.
      </p>

      <h2>11. Limitación de Responsabilidad</h2>
      <p>
        Nuestra responsabilidad agregada por cualquier reclamo relacionado con el Servicio se
        limita al monto que hayas pagado en los 12 meses anteriores al evento que originó el
        reclamo. No seremos responsables por daños indirectos, incidentales, especiales o
        consecuentes, incluyendo pérdida de beneficios, datos o reputación. Estas limitaciones
        no aplican en casos de fraude, dolo o donde la ley lo prohíba.
      </p>

      <h2>12. Indemnización</h2>
      <p>
        Te comprometes a indemnizar a VAL IN BLOOM frente a reclamos de terceros derivados de
        tu contenido, uso ilícito del Servicio o incumplimiento de estos Términos.
      </p>

      <h2>13. Suspensión y Terminación</h2>
      <p>
        Podemos suspender o terminar tu acceso por: incumplimiento material de estos Términos,
        falta de pago, riesgo de seguridad o fraude, o violaciones repetidas. Al terminar tu
        cuenta, podrás exportar tus datos durante un plazo razonable antes de su eliminación.
      </p>

      <h2>14. Modificaciones</h2>
      <p>
        Podemos actualizar estos Términos. Te notificaremos los cambios sustanciales con
        antelación razonable. El uso continuado del Servicio implica aceptación de los Términos
        actualizados.
      </p>

      <h2>15. Cesión</h2>
      <p>
        No puedes ceder tus derechos bajo estos Términos sin nuestro consentimiento escrito.
        Podemos ceder los nuestros en caso de fusión, adquisición o reorganización.
      </p>

      <h2>16. Fuerza Mayor</h2>
      <p>
        No seremos responsables por incumplimientos causados por eventos fuera de nuestro
        control razonable (desastres, fallos de proveedores, acciones gubernamentales, etc.).
      </p>

      <h2>17. Ley Aplicable y Disputas</h2>
      <p>
        Estos Términos se rigen por la legislación aplicable a la sede del Vendedor. Las
        disputas se resolverán ante los tribunales competentes de dicha jurisdicción, salvo
        que la ley imperativa establezca lo contrario.
      </p>

      <h2>18. Contacto</h2>
      <p>
        Para preguntas sobre estos Términos, contáctanos a través de la app o desde el sitio web.
      </p>
    </LegalLayout>
  );
}
