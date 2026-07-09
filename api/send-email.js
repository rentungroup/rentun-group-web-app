import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { client_name, client_email, contract_code, property_address, print_link } = req.body;

  if (!client_email) {
    return res.status(400).json({ error: 'Missing client email' });
  }

  // Configuración de SMTP (Namecheap PrivateEmail)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const mailOptions = {
    from: `"Rentun Group" <${process.env.SMTP_USER}>`,
    to: client_email,
    subject: `📄 Tu Contrato de Mandato ${contract_code} - Rentun Group`,
    html: `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 2rem;">
          <img src="https://rentungroup.com/logos/rentungroupblue.webp" alt="Rentun Group" style="height: 50px; object-fit: contain;" />
        </div>
        
        <h2 style="color: #0f4c81; font-size: 1.5rem; font-weight: 800; margin-top: 0; text-align: center;">¡Hola, ${client_name}!</h2>
        
        <p style="font-size: 0.95rem; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 1.5rem;">
          Te informamos que se ha generado y registrado con éxito tu <strong>Contrato de Mandato de Administración</strong> para el inmueble ubicado en:
          <br /><strong style="color: #0f4c81; display: block; margin-top: 0.5rem;">${property_address}</strong>.
        </p>
        
        <div style="background: rgba(245,124,0,0.03); border: 1.5px dashed #f57c00; border-radius: 12px; padding: 1.2rem; margin: 1.8rem 0; text-align: center;">
          <span style="display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 850; letter-spacing: 0.05em;">Código de Contrato</span>
          <strong style="font-size: 1.5rem; color: #f57c00; font-weight: 900; display: block; margin-top: 0.2rem;">${contract_code}</strong>
        </div>
        
        <p style="font-size: 0.92rem; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 2rem;">
          Puedes visualizar, descargar o imprimir tu contrato digital firmado accediendo al siguiente enlace seguro:
        </p>
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <a href="${print_link}" target="_blank" style="background: linear-gradient(135deg, #0a3560, #0f4c81); color: #ffffff; text-decoration: none; padding: 0.9rem 2.2rem; border-radius: 50px; font-weight: 800; font-size: 0.95rem; display: inline-block; box-shadow: 0 8px 16px rgba(15, 76, 129, 0.25);">
            📄 Ver e Imprimir Mi Contrato
          </a>
        </div>
        
        <div style="background-color: #f8fafc; padding: 1rem; border-radius: 8px; font-size: 0.8rem; color: #64748b; border: 1px solid #cbd5e1; text-align: center;">
          🔒 Este documento digital cuenta con sellos de marca de agua de seguridad y está protegido contra indexación en buscadores.
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
        
        <p style="font-size: 0.72rem; color: #94a3b8; text-align: center; line-height: 1.5; margin: 0;">
          Este es un correo automático enviado por el portal de Rentun Group.<br />
          Si no reconoces esta operación, ponte en contacto con nosotros en <a href="mailto:${process.env.SMTP_USER}" style="color: #0f4c81; text-decoration: none; font-weight: 700;">${process.env.SMTP_USER}</a>.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email via SMTP:', error);
    return res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
}
