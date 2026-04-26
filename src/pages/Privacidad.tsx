import LegalLayout from "@/components/LegalLayout";

export default function Privacidad() {
  return (
    <LegalLayout title="Aviso de Privacidad">
      <p>
        Este Aviso de Privacidad describe cómo <strong>VAL IN BLOOM</strong> ("nosotros") recopila,
        utiliza y comparte tu información personal cuando usas la aplicación Control de Cargas
        ("Servicio").
      </p>

      <h2>1. Responsable del Tratamiento</h2>
      <p>
        VAL IN BLOOM actúa como responsable del tratamiento (data controller) de los datos
        personales que recopilamos a través del Servicio.
      </p>

      <h2>2. Datos que Recopilamos</h2>
      <ul>
        <li><strong>Datos de cuenta:</strong> nombre, correo electrónico y contraseña (cifrada).</li>
        <li><strong>Datos del Servicio:</strong> registros de cargas, gasolina, peajes, gastos del vehículo y metas que ingresas.</li>
        <li><strong>Datos de soporte:</strong> mensajes y consultas que nos envías.</li>
        <li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo, navegador, identificadores de sesión y datos de uso.</li>
        <li><strong>Datos de pago:</strong> procesados directamente por Stripe; nosotros no almacenamos números de tarjeta.</li>
      </ul>

      <h2>3. Finalidades del Tratamiento</h2>
      <ul>
        <li>Crear y gestionar tu cuenta.</li>
        <li>Proveer las funcionalidades del Servicio.</li>
        <li>Procesar suscripciones y facturación.</li>
        <li>Brindar soporte al cliente.</li>
        <li>Mejorar y proteger el Servicio (seguridad, prevención de fraude).</li>
        <li>Enviarte comunicaciones operativas relacionadas con tu cuenta.</li>
      </ul>

      <h2>4. Bases Legales</h2>
      <ul>
        <li><strong>Ejecución del contrato:</strong> para proveerte el Servicio que contrataste.</li>
        <li><strong>Interés legítimo:</strong> para seguridad, prevención de fraude y mejora del producto.</li>
        <li><strong>Consentimiento:</strong> cuando aplique (por ejemplo, comunicaciones de marketing).</li>
        <li><strong>Obligación legal:</strong> para cumplir requisitos fiscales y normativos.</li>
      </ul>

      <h2>5. Compartir Datos</h2>
      <p>Compartimos datos únicamente con:</p>
      <ul>
        <li><strong>Proveedores de servicios (subprocesadores):</strong> hosting, base de datos y autenticación (Supabase / Lovable Cloud).</li>
        <li><strong>Procesador de pagos:</strong> Stripe, para gestionar suscripciones, pagos, facturación y cumplimiento fiscal.</li>
        <li><strong>Asesores profesionales:</strong> legales y contables, cuando sea necesario.</li>
        <li><strong>Autoridades:</strong> cuando lo exija la ley o un proceso legal válido.</li>
      </ul>
      <p>No vendemos tus datos personales a terceros.</p>

      <h2>6. Retención de Datos</h2>
      <p>
        Conservamos tus datos mientras tu cuenta esté activa y por el período necesario para
        cumplir las finalidades descritas, obligaciones legales y resolver disputas. Cuando ya
        no sean necesarios, los eliminaremos o anonimizaremos.
      </p>

      <h2>7. Tus Derechos</h2>
      <p>Según la ley aplicable, puedes tener derecho a:</p>
      <ul>
        <li>Acceder a tus datos personales.</li>
        <li>Rectificar datos inexactos.</li>
        <li>Solicitar la eliminación ("derecho al olvido").</li>
        <li>Restringir u oponerte a ciertos tratamientos.</li>
        <li>Solicitar la portabilidad de tus datos.</li>
        <li>Retirar tu consentimiento cuando este sea la base legal.</li>
        <li>Presentar una queja ante la autoridad de protección de datos competente.</li>
      </ul>
      <p>Para ejercer estos derechos, contáctanos desde el Servicio. Responderemos dentro del plazo legal aplicable (generalmente 30 días).</p>

      <h2>8. Transferencias Internacionales</h2>
      <p>
        Tus datos pueden ser tratados en servidores ubicados fuera de tu país. Cuando esto
        ocurra, aplicamos salvaguardas adecuadas, como cláusulas contractuales tipo o
        decisiones de adecuación.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus datos:
        cifrado en tránsito, controles de acceso, autenticación segura y backups regulares.
        Ningún sistema es 100% seguro, pero trabajamos para minimizar los riesgos.
      </p>

      <h2>10. Cookies</h2>
      <p>
        Usamos cookies y tecnologías similares estrictamente necesarias para el funcionamiento
        del Servicio (sesión, autenticación). No utilizamos cookies de marketing de terceros.
        Puedes gestionar las cookies desde la configuración de tu navegador.
      </p>

      <h2>11. Menores</h2>
      <p>
        El Servicio no está dirigido a menores de edad. No recopilamos conscientemente datos
        de menores. Si crees que un menor nos ha proporcionado datos, contáctanos para
        eliminarlos.
      </p>

      <h2>12. Cambios a este Aviso</h2>
      <p>
        Podemos actualizar este Aviso. Publicaremos la versión vigente con la fecha de
        actualización al inicio de este documento.
      </p>

      <h2>13. Contacto</h2>
      <p>
        Para consultas sobre este Aviso o sobre tus datos personales, contáctanos desde la
        aplicación o el sitio web.
      </p>
    </LegalLayout>
  );
}
