import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, User, Home, DollarSign, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../supabase';

export default function PrintContract() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState(null);

  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Inject robots meta tag to prevent search engines from indexing the contract
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    const loadData = async () => {
      try {
        // Check active session
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        setSession(activeSession);
        
        if (!activeSession) {
          setLoading(false);
          setAuthChecking(false);
          return;
        }

        // 1. Fetch contract (support both UUID and RENTUN-XXXX sequential code)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let query = supabase.from('mandate_contracts').select('*');
        if (isUUID) {
          query = query.eq('id', id);
        } else {
          query = query.eq('code', id);
        }
        const { data: contractData, error: contractErr } = await query.single();

        if (contractErr) throw contractErr;
        
        // 2. If advisor, restrict access to their own contracts only
        const { data: agentDataCheck } = await supabase
          .from('external_agents')
          .select('*')
          .eq('email', activeSession.user.email)
          .single();

        if (agentDataCheck) {
          if (!agentDataCheck.active) {
            throw new Error("Tu perfil de asesor está inactivo.");
          }
          if (contractData.agent_id !== agentDataCheck.id) {
            throw new Error("No tienes permisos para ver este contrato.");
          }
        }

        setContract(contractData);

        // 3. Fetch agent if present
        if (contractData.agent_id) {
          const { data: agentData } = await supabase
            .from('external_agents')
            .select('*')
            .eq('id', contractData.agent_id)
            .single();
          setAgent(agentData);
        }

        // 4. Fetch contract settings
        const { data: settingsData } = await supabase
          .from('contract_settings')
          .select('*')
          .eq('id', 1)
          .single();
        setSettings(settingsData);
      } catch (err) {
        console.error('Error loading contract for print:', err);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    loadData();

    return () => {
      document.head.removeChild(meta);
    };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || authChecking) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F5F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
        <p style={{ color: '#0F4C81', fontWeight: 'bold' }}>Cargando contrato de arrendamiento...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F5F8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', gap: '1rem', padding:'2rem', textAlign:'center' }}>
        <p style={{ color: '#FF385C', fontWeight: 'bold', fontSize:'1.2rem' }}>⚠️ Acceso Denegado</p>
        <p style={{ color: '#5c6d80', fontSize:'0.9rem', maxWidth:450 }}>Debes iniciar sesión en el panel de administrador o asesor para poder visualizar y descargar este documento.</p>
        <Link to="/admin" style={{ color: '#0F4C81', fontWeight: 700, textDecoration: 'none', background:'white', padding:'0.6rem 1.5rem', borderRadius:50, border:'1px solid #E6E7E8', marginTop:'1rem' }}>Ir al Login</Link>
      </div>
    );
  }

  if (!contract) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F5F8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', gap: '1rem', padding:'2rem', textAlign:'center' }}>
        <p style={{ color: '#FF385C', fontWeight: 'bold' }}>El contrato no pudo ser encontrado o no tienes permisos para visualizarlo.</p>
        <Link to="/admin" style={{ color: '#0F4C81', fontWeight: 700, textDecoration: 'none', background:'white', padding:'0.6rem 1.5rem', borderRadius:50, border:'1px solid #E6E7E8', marginTop:'1rem' }}>← Volver al Panel Admin</Link>
      </div>
    );
  }

  const data = contract.contract_data || {};
  const logo = settings?.logo_url || '/logos/rentungroupblue.webp';
  const clauses = settings?.contract_text || '';

  // Auxiliares para formatear checkboxes o vacíos
  const renderCheck = (val) => (val ? '✔️ Sí' : '❌ No');
  const formatField = (val) => val || '___________________________';

  return (
    <div style={{ minHeight: '100vh', background: '#F3F5F8', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Outfit, sans-serif' }} className="print-contract-container">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-contract-container {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }
          .printable-page {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 2.2rem !important;
            width: 100% !important;
            min-height: 100vh !important;
            page-break-after: always;
            box-sizing: border-box;
            background: white !important;
          }
          .printable-page:last-child {
            page-break-after: avoid;
          }
        }
        
        .printable-page {
          width: 800px;
          min-height: 1050px;
          background: white;
          border: 1px solid #E6E7E8;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          padding: 3rem;
          margin-bottom: 2rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .pdf-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
          font-size: 0.72rem;
          line-height: 1.4;
        }
        .pdf-table td {
          border: 1px solid #c8d1db;
          padding: 0.35rem 0.5rem;
          vertical-align: middle;
        }
        .pdf-table th {
          border: 1px solid #c8d1db;
          padding: 0.35rem 0.5rem;
          background: #f1f5f9;
          font-weight: 800;
          text-align: left;
          color: #0F4C81;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .section-header {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0F4C81;
          border-bottom: 1.5px solid #0F4C81;
          padding-bottom: 0.2rem;
          margin: 0.8rem 0 0.4rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .bold-label {
          font-weight: 700;
          color: #334155;
        }
      `}</style>

      {/* Control panel — hidden on print */}
      <div className="no-print" style={{ width: '100%', maxWidth: 800, background: 'white', borderRadius: 20, border: '1px solid #E6E7E8', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', color: '#5c6d80', fontSize: '0.8rem', fontWeight: 700 }}>
          <ArrowLeft size={16} />
          Volver al Panel Admin
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#0F4C81,#1a6db5)', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,76,129,0.25)' }}>
            <Printer size={16} />
            Imprimir Contrato
          </button>
        </div>
      </div>

      {/* ========================================================
          PÁGINA 1: INFORMACIÓN MANDANTES 1 Y 2
          ======================================================== */}
      <div className="printable-page">
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0F4C81', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={logo} alt="Logo" style={{ height: 48, objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f2942', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>CONTRATO DE ADMINISTRACIÓN DE</h1>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F4C81', margin: 0, textTransform: 'uppercase' }}>INMUEBLES EN ARRENDAMIENTO</h2>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: '#5c6d80', fontWeight: 700 }}>V. RENTUN 2026</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#F57C00', marginTop: '0.2rem' }}>CÓDIGO No. {contract.code}</div>
            </div>
          </div>

          {/* Mandante 1 */}
          <div className="section-header">Información Mandante 1</div>
          <table className="pdf-table">
            <tbody>
              <tr>
                <td className="bold-label" style={{ width: '25%' }}>Razón Social:</td>
                <td colspan="3">{formatField(data.mandante1?.razonSocial)} <span style={{fontSize: '0.65rem', color: '#888'}}>(Solo pers. jurídicas)</span></td>
              </tr>
              <tr>
                <td className="bold-label">Nombres y Apellidos:</td>
                <td colspan="3" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{formatField(data.mandante1?.nombre)}</td>
              </tr>
              <tr>
                <td className="bold-label">Identificación:</td>
                <td style={{ width: '25%' }}>{formatField(data.mandante1?.documento)}</td>
                <td className="bold-label" style={{ width: '20%' }}>Tipo Doc:</td>
                <td>{formatField(data.mandante1?.tipoDoc)}</td>
              </tr>
              <tr>
                <td className="bold-label">Expedido en:</td>
                <td>{formatField(data.mandante1?.expedido)}</td>
                <td className="bold-label">Fecha Nacimiento:</td>
                <td>{formatField(data.mandante1?.fechaNacimiento)}</td>
              </tr>
              <tr>
                <td className="bold-label">Teléfono:</td>
                <td>{formatField(data.mandante1?.telefono)}</td>
                <td className="bold-label">Celular:</td>
                <td>{formatField(data.mandante1?.celular)}</td>
              </tr>
              <tr>
                <td className="bold-label">Dirección Residencia:</td>
                <td colspan="3">{formatField(data.mandante1?.direccion)}</td>
              </tr>
              <tr>
                <td className="bold-label">Casa o Apto / Torre:</td>
                <td>{formatField(data.mandante1?.casaApto)} {data.mandante1?.torre ? `/ Torre ${data.mandante1.torre}` : ''}</td>
                <td className="bold-label">Barrio / Conjunto:</td>
                <td>{formatField(data.mandante1?.barrio)} {data.mandante1?.conjunto ? `/ ${data.mandante1.conjunto}` : ''}</td>
              </tr>
              <tr>
                <td className="bold-label">Ciudad:</td>
                <td>{formatField(data.mandante1?.ciudad)}</td>
                <td className="bold-label">Email:</td>
                <td>{formatField(data.mandante1?.email)}</td>
              </tr>
              <tr>
                <td className="bold-label">Dirección Oficina:</td>
                <td colspan="3">{formatField(data.mandante1?.direccionOficina)} ({formatField(data.mandante1?.barrioOficina)}, {formatField(data.mandante1?.ciudadOficina)})</td>
              </tr>
              <tr>
                <td className="bold-label">Régimen IVA:</td>
                <td>{formatField(data.mandante1?.regimen)}</td>
                <td className="bold-label">Agente Retenedor:</td>
                <td>{formatField(data.mandante1?.agenteRetenedor)}</td>
              </tr>
              <tr>
                <td className="bold-label">Persona PEP:</td>
                <td>{formatField(data.mandante1?.pep)}</td>
                <td className="bold-label">PEP Tipo:</td>
                <td>{formatField(data.mandante1?.pepTipo)}</td>
              </tr>
            </tbody>
          </table>

          {/* Mandante 2 */}
          <div className="section-header">Información Mandante 2 (Co-propietario)</div>
          {data.mandante2?.nombre ? (
            <table className="pdf-table">
              <tbody>
                <tr>
                  <td className="bold-label" style={{ width: '25%' }}>Razón Social:</td>
                  <td colspan="3">{formatField(data.mandante2?.razonSocial)}</td>
                </tr>
                <tr>
                  <td className="bold-label">Nombres y Apellidos:</td>
                  <td colspan="3" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{formatField(data.mandante2?.nombre)}</td>
                </tr>
                <tr>
                  <td className="bold-label">Identificación:</td>
                  <td style={{ width: '25%' }}>{formatField(data.mandante2?.documento)}</td>
                  <td className="bold-label" style={{ width: '20%' }}>Tipo Doc:</td>
                  <td>{formatField(data.mandante2?.tipoDoc)}</td>
                </tr>
                <tr>
                  <td className="bold-label">Expedido en:</td>
                  <td>{formatField(data.mandante2?.expedido)}</td>
                  <td className="bold-label">Fecha Nacimiento:</td>
                  <td>{formatField(data.mandante2?.fechaNacimiento)}</td>
                </tr>
                <tr>
                  <td className="bold-label">Teléfono:</td>
                  <td>{formatField(data.mandante2?.telefono)}</td>
                  <td className="bold-label">Celular:</td>
                  <td>{formatField(data.mandante2?.celular)}</td>
                </tr>
                <tr>
                  <td className="bold-label">Dirección Residencia:</td>
                  <td colspan="3">{formatField(data.mandante2?.direccion)}</td>
                </tr>
                <tr>
                  <td className="bold-label">Ciudad:</td>
                  <td>{formatField(data.mandante2?.ciudad)}</td>
                  <td className="bold-label">Email:</td>
                  <td>{formatField(data.mandante2?.email)}</td>
                </tr>
                <tr>
                  <td className="bold-label">Persona PEP:</td>
                  <td>{formatField(data.mandante2?.pep)}</td>
                  <td className="bold-label">PEP Tipo:</td>
                  <td>{formatField(data.mandante2?.pepTipo)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: '0.72rem', color: '#5c6d80', fontStyle: 'italic', padding: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: '1rem' }}>
              No se registró segundo mandante en este contrato.
            </div>
          )}
        </div>

        {/* Page footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8' }}>
          <span>Rentun Group SAS · Portal de Contratos de Mandato</span>
          <span>Página 1</span>
        </div>
      </div>

      {/* ========================================================
          PÁGINA 2: PAGO DE RENTA, EMERGENCIAS E INMUEBLE GENERAL
          ======================================================== */}
      <div className="printable-page">
        <div>
          {/* Brand header small */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0F4C81', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C81' }}>CONTRATO DE ADMINISTRACIÓN DE INMUEBLES EN ARRENDAMIENTO</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F57C00' }}>CÓDIGO: {contract.code}</span>
          </div>

          {/* Pago de Renta */}
          <div className="section-header">Información para Pago de Renta</div>
          <table className="pdf-table">
            <tbody>
              <tr>
                <td className="bold-label" style={{ width: '25%' }}>Forma de Pago:</td>
                <td style={{ width: '25%' }}>{formatField(data.pagoRenta?.formaPago)}</td>
                <td className="bold-label" style={{ width: '20%' }}>Número Cuenta:</td>
                <td>{formatField(data.pagoRenta?.cuentaNumero)}</td>
              </tr>
              <tr>
                <td className="bold-label">Entidad Bancaria:</td>
                <td>{formatField(data.pagoRenta?.banco)}</td>
                <td className="bold-label">Tipo Cuenta:</td>
                <td>{formatField(data.pagoRenta?.tipoCuenta)}</td>
              </tr>
              <tr>
                <td className="bold-label">Ciudad Apertura:</td>
                <td>{formatField(data.pagoRenta?.ciudadApertura)}</td>
                <td className="bold-label">Titular Cuenta:</td>
                <td>{formatField(data.pagoRenta?.titularCuenta)}</td>
              </tr>
              <tr>
                <td className="bold-label">Identificación Titular:</td>
                <td colspan="3">{formatField(data.pagoRenta?.titularDocumento)} ({formatField(data.pagoRenta?.titularDocTipo)})</td>
              </tr>
            </tbody>
          </table>

          {/* Contacto de Emergencia */}
          <div className="section-header">Contacto de Emergencia Autorizado</div>
          <table className="pdf-table">
            <tbody>
              <tr>
                <td className="bold-label" style={{ width: '25%' }}>Nombres y Apellidos:</td>
                <td colspan="3" style={{ fontWeight: 700 }}>{formatField(data.emergencia?.nombre)}</td>
              </tr>
              <tr>
                <td className="bold-label">Identificación:</td>
                <td style={{ width: '25%' }}>{formatField(data.emergencia?.documento)} ({formatField(data.emergencia?.tipoDoc)})</td>
                <td className="bold-label" style={{ width: '20%' }}>Expedido en:</td>
                <td>{formatField(data.emergencia?.expedido)}</td>
              </tr>
              <tr>
                <td className="bold-label">Dirección Residencia:</td>
                <td colspan="3">{formatField(data.emergencia?.direccion)}</td>
              </tr>
              <tr>
                <td className="bold-label">Barrio / Ciudad:</td>
                <td>{formatField(data.emergencia?.barrio)} / {formatField(data.emergencia?.ciudad)}</td>
                <td className="bold-label">Celular / Parentesco:</td>
                <td>{formatField(data.emergencia?.celular)} / {formatField(data.emergencia?.parentesco)}</td>
              </tr>
              <tr>
                <td className="bold-label">Correo Electrónico:</td>
                <td colspan="3">{formatField(data.emergencia?.email)}</td>
              </tr>
            </tbody>
          </table>

          {/* Información del Inmueble */}
          <div className="section-header">Información General del Inmueble</div>
          <table className="pdf-table">
            <tbody>
              <tr>
                <td className="bold-label" style={{ width: '25%' }}>Consignación:</td>
                <td style={{ width: '25%' }}>{formatField(data.inmueble?.consignacion)}</td>
                <td className="bold-label" style={{ width: '20%' }}>Código Inmueble:</td>
                <td style={{ fontWeight: 700 }}>{formatField(data.inmueble?.codigoInmueble)}</td>
              </tr>
              <tr>
                <td className="bold-label">Destinación:</td>
                <td style={{ fontWeight: 800, color: '#0F4C81' }}>{formatField(data.inmueble?.destinacion)}</td>
                <td className="bold-label">Predio Mayor Extensión:</td>
                <td>{formatField(data.inmueble?.predioMayor)}</td>
              </tr>
              <tr>
                <td className="bold-label">Dirección Física:</td>
                <td colspan="3" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{formatField(data.inmueble?.direccion)}</td>
              </tr>
              <tr>
                <td className="bold-label">Barrio / Ciudad:</td>
                <td>{formatField(data.inmueble?.barrio)} / {formatField(data.inmueble?.ciudad)}</td>
                <td className="bold-label">Estrato / Área Const:</td>
                <td>{formatField(data.inmueble?.estrato)} / {formatField(data.inmueble?.areaConstruida)} m²</td>
              </tr>
              <tr>
                <td className="bold-label">Matrícula Inmobiliaria:</td>
                <td>{formatField(data.inmueble?.matricula)}</td>
                <td className="bold-label">Cédula Catastral:</td>
                <td>{formatField(data.inmueble?.catastro)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Page footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8' }}>
          <span>Rentun Group SAS · Portal de Contratos de Mandato</span>
          <span>Página 2</span>
        </div>
      </div>

      {/* ========================================================
          PÁGINA 3: CARACTERÍSTICAS DEL INMUEBLE Y ZONA SOCIAL
          ======================================================== */}
      <div className="printable-page">
        <div>
          {/* Brand header small */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0F4C81', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C81' }}>CONTRATO DE ADMINISTRACIÓN DE INMUEBLES EN ARRENDAMIENTO</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F57C00' }}>CÓDIGO: {contract.code}</span>
          </div>

          {/* Características Inmueble (VIVIENDA) */}
          {data.inmueble?.destinacion === 'Vivienda' && (
            <>
              <div className="section-header">Detalles de Destinación: Vivienda</div>
              <table className="pdf-table">
                <tbody>
                  <tr>
                    <td className="bold-label" style={{ width: '25%' }}>Tipo de Inmueble:</td>
                    <td style={{ width: '25%' }}>{formatField(data.inmueble?.tipoInmuebleVivienda)}</td>
                    <td className="bold-label" style={{ width: '20%' }}>Tipo de Cocina:</td>
                    <td>{formatField(data.inmueble?.tipoCocina)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Tipo de Pisos:</td>
                    <td>{formatField(data.inmueble?.tipoPisosVivienda)}</td>
                    <td className="bold-label">Número Niveles:</td>
                    <td>{formatField(data.inmueble?.nivelesVivienda)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Número Baños:</td>
                    <td>{formatField(data.inmueble?.banosVivienda)}</td>
                    <td className="bold-label">Comedor Independiente:</td>
                    <td>{renderCheck(data.inmueble?.salaComedorInd)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Ventiladores:</td>
                    <td>{renderCheck(data.inmueble?.ventilador)}</td>
                    <td className="bold-label">Aire Acondicionado:</td>
                    <td>{renderCheck(data.inmueble?.aireAcondicionado)} {data.inmueble?.aireCant ? `(Cant: ${data.inmueble.aireCant})` : ''}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Alcoba con Baño:</td>
                    <td>{renderCheck(data.inmueble?.alcobaConBano)}</td>
                    <td className="bold-label">Alcoba sin Baño:</td>
                    <td>{renderCheck(data.inmueble?.alcobaSinBano)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Balcón / Terraza:</td>
                    <td>{renderCheck(data.inmueble?.balcon)} / {renderCheck(data.inmueble?.terraza)}</td>
                    <td className="bold-label">Estudio / Hall TV:</td>
                    <td>{renderCheck(data.inmueble?.estudio)} / {renderCheck(data.inmueble?.hallTv)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Patio / Zona Ropas:</td>
                    <td>{renderCheck(data.inmueble?.patio)} / {renderCheck(data.inmueble?.zonaRopas)}</td>
                    <td className="bold-label">Calentador / Lavadero:</td>
                    <td>{renderCheck(data.inmueble?.calentador)} / {renderCheck(data.inmueble?.lavadero)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Closets / Empotrados:</td>
                    <td>{renderCheck(data.inmueble?.closets)} / {renderCheck(data.inmueble?.empotrados)}</td>
                    <td className="bold-label">Rejas de Seguridad:</td>
                    <td>{renderCheck(data.inmueble?.rejasVivienda)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Cantidad Llaves:</td>
                    <td>{formatField(data.inmueble?.cantLlaves)}</td>
                    <td className="bold-label">Código Llaves:</td>
                    <td>{formatField(data.inmueble?.codigoLlaves)}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* Características Inmueble (COMERCIO) */}
          {data.inmueble?.destinacion === 'Comercio' && (
            <>
              <div className="section-header">Detalles de Destinación: Comercio</div>
              <table className="pdf-table">
                <tbody>
                  <tr>
                    <td className="bold-label" style={{ width: '25%' }}>Tipo de Inmueble:</td>
                    <td style={{ width: '25%' }}>{formatField(data.inmueble?.tipoInmuebleComercio)}</td>
                    <td className="bold-label" style={{ width: '20%' }}>Tipo de Pisos:</td>
                    <td>{formatField(data.inmueble?.tipoPisosComercio)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Tipo de Cubierta:</td>
                    <td>{formatField(data.inmueble?.tipoCubierta)}</td>
                    <td className="bold-label">Tipo de Estructura:</td>
                    <td>{formatField(data.inmueble?.tipoEstructura)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Número Niveles:</td>
                    <td>{formatField(data.inmueble?.nivelesComercio)}</td>
                    <td className="bold-label">Zona de Oficinas:</td>
                    <td>{renderCheck(data.inmueble?.zonaOficinas)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Salones / Celaduría:</td>
                    <td>{formatField(data.inmueble?.salones)} / {renderCheck(data.inmueble?.celaduriaComercio)}</td>
                    <td className="bold-label">Altura Entrepiso:</td>
                    <td>{formatField(data.inmueble?.alturaEntrepiso)} m</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Baños:</td>
                    <td>{formatField(data.inmueble?.banosComercio)}</td>
                    <td className="bold-label">Cableado Estructurado:</td>
                    <td>{renderCheck(data.inmueble?.cableadoEstructurado)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Zona de Descargue:</td>
                    <td>{renderCheck(data.inmueble?.zonaDescargue)}</td>
                    <td className="bold-label">Servicios (Agua/Luz):</td>
                    <td>{renderCheck(data.inmueble?.aguaComercio)} / {renderCheck(data.inmueble?.luzComercio)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Gas Industrial:</td>
                    <td>{renderCheck(data.inmueble?.gasIndustrial)}</td>
                    <td className="bold-label">Subestación Eléctrica:</td>
                    <td>{renderCheck(data.inmueble?.subestacionElectrica)}</td>
                  </tr>
                  <tr>
                    <td className="bold-label">Mezanine / Capacidad:</td>
                    <td>{renderCheck(data.inmueble?.mezanine)} {data.inmueble?.capacidadPesoMezanine ? `(${data.inmueble.capacidadPesoMezanine} kg)` : ''}</td>
                    <td className="bold-label">Aire Acondicionado:</td>
                    <td>{formatField(data.inmueble?.aireComercio)}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* Parqueadero y Locker */}
          <div className="section-header">Parqueadero e Información de Depósito</div>
          <table className="pdf-table">
            <tbody>
              <tr>
                <td className="bold-label" style={{ width: '25%' }}>¿Tiene Parqueadero?:</td>
                <td style={{ width: '25%' }}>{renderCheck(data.parqueadero?.tieneParqueadero)}</td>
                <td className="bold-label" style={{ width: '20%' }}>Número de Parqueadero:</td>
                <td>{formatField(data.parqueadero?.numeroParqueadero)}</td>
              </tr>
              <tr>
                <td className="bold-label">Parqueadero Comunal:</td>
                <td>{renderCheck(data.parqueadero?.comunal)}</td>
                <td className="bold-label">Tipo Parqueadero:</td>
                <td>{formatField(data.parqueadero?.tipoParqueadero)}</td>
              </tr>
              <tr>
                <td className="bold-label">Control Remoto / Tarjeta:</td>
                <td>{renderCheck(data.parqueadero?.controlRemoto)} / {renderCheck(data.parqueadero?.tarjeta)}</td>
                <td className="bold-label">Locker / Depósito:</td>
                <td>{renderCheck(data.parqueadero?.tieneLocker)} {data.parqueadero?.numeroLocker ? `(No. ${data.parqueadero.numeroLocker})` : ''}</td>
              </tr>
            </tbody>
          </table>

          {/* Zona Social */}
          <div className="section-header">Zona Social y Amenidades del Edificio/Conjunto</div>
          <table className="pdf-table">
            <tbody>
              <tr>
                <td className="bold-label" style={{ width: '25%' }}>Conjunto Cerrado:</td>
                <td style={{ width: '25%' }}>{renderCheck(data.zonaSocial?.conjuntoCerrado)}</td>
                <td className="bold-label" style={{ width: '20%' }}>Zona de Juegos:</td>
                <td>{renderCheck(data.zonaSocial?.zonaJuegos)}</td>
              </tr>
              <tr>
                <td className="bold-label">Ascensor:</td>
                <td>{renderCheck(data.zonaSocial?.ascensor)}</td>
                <td className="bold-label">Piscina:</td>
                <td>{renderCheck(data.zonaSocial?.piscina)}</td>
              </tr>
              <tr>
                <td className="bold-label">Salón Social:</td>
                <td>{renderCheck(data.zonaSocial?.salonSocial)}</td>
                <td className="bold-label">Citófono / Gimnasio:</td>
                <td>{renderCheck(data.zonaSocial?.citofono)} / {renderCheck(data.zonaSocial?.gimnasio)}</td>
              </tr>
              <tr>
                <td className="bold-label">Zona BBQ / Asadores:</td>
                <td>{renderCheck(data.zonaSocial?.bbq)}</td>
                <td className="bold-label">Caldera Comunal:</td>
                <td>{renderCheck(data.zonaSocial?.caldera)}</td>
              </tr>
              <tr>
                <td className="bold-label">Tipo de Celaduría:</td>
                <td colspan="3">{formatField(data.zonaSocial?.celaduría)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Page footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8' }}>
          <span>Rentun Group SAS · Portal de Contratos de Mandato</span>
          <span>Página 3</span>
        </div>
      </div>

      {/* ========================================================
          PÁGINA 4: CANON, ADMINISTRACIÓN, CONDICIONES Y CHECKLIST
          ======================================================== */}
      <div className="printable-page">
        <div>
          {/* Brand header small */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0F4C81', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C81' }}>CONTRATO DE ADMINISTRACIÓN DE INMUEBLES EN ARRENDAMIENTO</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F57C00' }}>CÓDIGO: {contract.code}</span>
          </div>

          {/* Canon de Arrendamiento */}
          <div className="section-header">Condiciones del Canon de Arrendamiento</div>
          <table className="pdf-table">
            <tbody>
              <tr>
                <td className="bold-label" style={{ width: '25%' }}>Valor del Canon:</td>
                <td style={{ width: '25%', fontWeight: 700, fontSize: '0.8rem', color: '#0F4C81' }}>{formatField(data.canon?.valorCanon)}</td>
                <td className="bold-label" style={{ width: '20%' }}>¿Canon Integral?:</td>
                <td>{formatField(data.canon?.canonIntegral)}</td>
              </tr>
              <tr>
                <td className="bold-label">Cuota de Sostenimiento:</td>
                <td colspan="3">
                  Incluida en Canon: {renderCheck(data.canon?.sostenimientoIncluido)} | 
                  Pagar Cuota: {renderCheck(data.canon?.pagarSostenimiento)} | 
                  Encargado: {formatField(data.canon?.sostenimientoEncargado)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Datos de Administración */}
          <div className="section-header">Gastos e Información de la Administración</div>
          <table className="pdf-table">
            <tbody>
              <tr>
                <td className="bold-label" style={{ width: '25%' }}>Admin con Descuento:</td>
                <td style={{ width: '25%' }}>{formatField(data.canon?.adminConDesc)}</td>
                <td className="bold-label" style={{ width: '20%' }}>Admin sin Descuento:</td>
                <td>{formatField(data.canon?.adminSinDesc)}</td>
              </tr>
              <tr>
                <td className="bold-label">Administración Incluida:</td>
                <td>{renderCheck(data.canon?.adminIncluidaContrato)}</td>
                <td className="bold-label">Nombre Copropiedad:</td>
                <td>{formatField(data.canon?.copropiedadNombre)}</td>
              </tr>
              <tr>
                <td className="bold-label">NIT Copropiedad:</td>
                <td>{formatField(data.canon?.copropiedadNit)}</td>
                <td className="bold-label">Contacto Admin (Tel/Email):</td>
                <td>{formatField(data.canon?.copropiedadContacto)}</td>
              </tr>
              <tr>
                <td className="bold-label">Nombre Administrador:</td>
                <td>{formatField(data.canon?.administradorNombre)}</td>
                <td className="bold-label">Horario Trasteos:</td>
                <td>{formatField(data.canon?.horarioTrasteos)}</td>
              </tr>
              <tr>
                <td className="bold-label">¿Recolección Servicios?:</td>
                <td>{renderCheck(data.canon?.recoleccionServicios)} | Encargado: {formatField(data.canon?.recoleccionEncargado)}</td>
                <td className="bold-label">¿Pago Administración?:</td>
                <td>{renderCheck(data.canon?.pagoAdmin)} | Encargado: {formatField(data.canon?.pagoAdminEncargado)}</td>
              </tr>
              <tr>
                <td className="bold-label">Provisión Fondos Servicios:</td>
                <td>{renderCheck(data.canon?.provisionServicios)}</td>
                <td className="bold-label">¿Tiene más inmuebles?:</td>
                <td>{renderCheck(data.canon?.tieneMasInmuebles)}</td>
              </tr>
              <tr>
                <td className="bold-label">Pago Publicidad / Valor:</td>
                <td>{renderCheck(data.canon?.pagaPublicidad)} {data.canon?.valorPublicidad ? `($${data.canon.valorPublicidad})` : ''}</td>
                <td className="bold-label">Póliza Servicios / Asegurado:</td>
                <td>${formatField(data.canon?.valorPolizaServicios)} / ${formatField(data.canon?.valorAsegurado)}</td>
              </tr>
              <tr>
                <td className="bold-label">Inmueble Libre Pleitos:</td>
                <td>{renderCheck(data.canon?.librePleitos)}</td>
                <td className="bold-label">Compartido Inmobiliaria:</td>
                <td>{renderCheck(data.canon?.compartidoInmobiliaria)}</td>
              </tr>
              <tr>
                <td className="bold-label">Geo-referenciación:</td>
                <td colspan="3">{formatField(data.canon?.geoReferenciacion)}</td>
              </tr>
              <tr>
                <td className="bold-label">Observaciones Adicionales:</td>
                <td colspan="3" style={{ fontSize: '0.7rem' }}>{formatField(data.canon?.observaciones)}</td>
              </tr>
            </tbody>
          </table>

          {/* Checklist de Documentos Entregados */}
          <div className="section-header">Documentación Soporte Entregada por el Mandante</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', background: '#f8fafc', border: '1px solid #c8d1db', borderRadius: 12, padding: '0.8rem', fontSize: '0.65rem' }}>
            <div>{renderCheck(data.documentos?.cedulas)} Copias de documento de identidad</div>
            <div>{renderCheck(data.documentos?.tradicionLibertad)} Certificado de tradición y libertad (&lt;30 días)</div>
            <div>{renderCheck(data.documentos?.rut)} Copia del RUT</div>
            <div>{renderCheck(data.documentos?.recibosPublicos)} Copia de recibos públicos domiciliaros</div>
            <div>{renderCheck(data.documentos?.reciboAdmin)} Copia de recibo de administración</div>
            <div>{renderCheck(data.documentos?.impuestoPredial)} Copia de impuesto predial (último)</div>
            <div>{renderCheck(data.documentos?.escrituras)} Copia de escrituras del inmueble</div>
            <div>{renderCheck(data.documentos?.propiedadHorizontal)} Reglamento de Propiedad Horizontal</div>
            <div>{renderCheck(data.documentos?.normasConvivencia)} Manual de convivencia / Normatividad</div>
            <div>{renderCheck(data.documentos?.nomenclatura)} Boletín de Nomenclatura</div>
            <div>{renderCheck(data.documentos?.licenciaConstruccion)} Licencia de construcción</div>
            <div>{renderCheck(data.documentos?.planos)} Planos del inmueble</div>
          </div>
        </div>

        {/* Page footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8' }}>
          <span>Rentun Group SAS · Portal de Contratos de Mandato</span>
          <span>Página 4</span>
        </div>
      </div>

      {/* ========================================================
          PÁGINA 5: EVIDENCIAS ADJUNTAS CON MARCA DE AGUA
          ======================================================== */}
      {(data.cedula_frontal_url || data.cedula_reversa_url || data.rut_url || data.camara_comercio_url || (data.evidence_images && data.evidence_images.length > 0)) && (
        <div className="printable-page">
          <div>
            {/* Brand header small */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0F4C81', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C81' }}>CONTRATO DE ADMINISTRACIÓN DE INMUEBLES EN ARRENDAMIENTO</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F57C00' }}>CÓDIGO: {contract.code}</span>
            </div>

            <div className="section-header">Evidencias y Soporte Documental (Con Marca de Agua de Seguridad)</div>
            <p style={{ fontSize: '0.65rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
              Los siguientes documentos y fotos del inmueble han sido procesados por seguridad de las partes, agregando una marca de agua indeleble antes de su almacenamiento en la base de datos de Rentun Group.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {data.cedula_frontal_url && (
                <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '0.4rem', textAlign: 'center', background: '#f8fafc' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0F4C81', display: 'block', marginBottom: '0.3rem' }}>Cédula Frontal</span>
                  <img src={data.cedula_frontal_url} alt="Cédula Frontal" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 4 }} />
                </div>
              )}
              {data.cedula_reversa_url && (
                <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '0.4rem', textAlign: 'center', background: '#f8fafc' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0F4C81', display: 'block', marginBottom: '0.3rem' }}>Cédula Reverso</span>
                  <img src={data.cedula_reversa_url} alt="Cédula Reverso" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 4 }} />
                </div>
              )}
              {data.rut_url && (
                <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '0.4rem', textAlign: 'center', background: '#f8fafc' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0F4C81', display: 'block', marginBottom: '0.3rem' }}>RUT / NIT</span>
                  <img src={data.rut_url} alt="RUT" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 4 }} />
                </div>
              )}
              {data.camara_comercio_url && (
                <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '0.4rem', textAlign: 'center', background: '#f8fafc' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0F4C81', display: 'block', marginBottom: '0.3rem' }}>Cámara de Comercio</span>
                  <img src={data.camara_comercio_url} alt="Cámara de Comercio" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 4 }} />
                </div>
              )}
            </div>

            {/* Evidencias del Apartamento */}
            {data.evidence_images && data.evidence_images.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F4C81', display: 'block', marginBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.2rem' }}>Evidencias del Apartamento en Recepción:</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                  {data.evidence_images.map((imgUrl, i) => (
                    <div key={i} style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '0.3rem', textAlign: 'center', background: '#f8fafc' }}>
                      <img src={imgUrl} alt={`Evidencia ${i + 1}`} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 4 }} />
                      <span style={{ fontSize: '0.55rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>Foto {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Page footer */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8' }}>
            <span>Rentun Group SAS · Portal de Contratos de Mandato</span>
            <span>Página de Evidencias</span>
          </div>
        </div>
      )}

      {/* ========================================================
          PÁGINA 6+: CLÁUSULAS LEGALES DINÁMICAS Y FIRMAS
          ======================================================== */}
      <div className="printable-page">
        <div>
          {/* Brand header small */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0F4C81', paddingBottom: '0.4rem', marginBottom: '1.2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C81' }}>CONTRATO DE ADMINISTRACIÓN DE INMUEBLES EN ARRENDAMIENTO</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F57C00' }}>CÓDIGO: {contract.code}</span>
          </div>

          <div className="section-header">Cláusulas del Contrato de Mandato</div>
          
          <div style={{ 
            fontSize: '0.65rem', 
            color: '#334155', 
            lineHeight: 1.6, 
            textAlign: 'justify', 
            whiteSpace: 'pre-line',
            maxHeight: '750px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            {clauses}
          </div>
        </div>

        {/* Page footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8' }}>
          <span>Rentun Group SAS · Portal de Contratos de Mandato</span>
          <span>Página 5</span>
        </div>
      </div>

      {/* ========================================================
          ÚLTIMA PÁGINA: FIRMAS Y CIERRE
          ======================================================== */}
      <div className="printable-page" style={{ minHeight: '800px', justifyContent: 'space-between' }}>
        <div>
          {/* Brand header small */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0F4C81', paddingBottom: '0.4rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C81' }}>CONTRATO DE ADMINISTRACIÓN DE INMUEBLES EN ARRENDAMIENTO</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F57C00' }}>CÓDIGO: {contract.code}</span>
          </div>

          <p style={{ fontSize: '0.72rem', color: '#334155', lineHeight: 1.6, textAlign: 'justify', marginBottom: '3rem' }}>
            En constancia de estar expresamente aceptado en todas sus partes, el presente contrato se firma en la ciudad de <strong>{formatField(data.firma?.ciudadFirma || 'Bogotá')}</strong>, por los obligados en él, el día <strong>{formatField(data.firma?.fechaFirma || new Date(contract.created_at).toLocaleDateString('es-CO'))}</strong>.
          </p>

          {/* Firmas Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem' }}>
            
            {/* Firma Mandante 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ height: '70px', borderBottom: '1px solid #475569', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', color: '#cbd5e1', fontSize: '0.7rem', fontStyle: 'italic' }}>
                Firma Digital / Electrónica
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f2942' }}>EL MANDANTE 1</span>
              <span style={{ fontSize: '0.7rem', color: '#334155' }}><strong style={{ color: '#0d1724' }}>Nombre:</strong> {formatField(data.mandante1?.nombre)}</span>
              <span style={{ fontSize: '0.7rem', color: '#334155' }}><strong style={{ color: '#0d1724' }}>C.C. / NIT:</strong> {formatField(data.mandante1?.documento)}</span>
            </div>

            {/* Firma Administrador */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ height: '70px', borderBottom: '1px solid #475569', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', color: '#cbd5e1', fontSize: '0.7rem', fontStyle: 'italic' }}>
                Firma Digital / Electrónica
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f2942' }}>EL ADMINISTRADOR (Rentun Group SAS)</span>
              <span style={{ fontSize: '0.7rem', color: '#334155' }}><strong style={{ color: '#0d1724' }}>Representante:</strong> {settings?.host_name || 'Manuel Fernando Madrid'}</span>
              <span style={{ fontSize: '0.7rem', color: '#334155' }}><strong style={{ color: '#0d1724' }}>NIT:</strong> 901.884.225-8</span>
            </div>

            {/* Firma Mandante 2 (si aplica) */}
            {data.mandante2?.nombre && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '2rem' }}>
                <div style={{ height: '70px', borderBottom: '1px solid #475569', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', color: '#cbd5e1', fontSize: '0.7rem', fontStyle: 'italic' }}>
                  Firma Digital / Electrónica
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f2942' }}>EL MANDANTE 2 (Co-propietario)</span>
                <span style={{ fontSize: '0.7rem', color: '#334155' }}><strong style={{ color: '#0d1724' }}>Nombre:</strong> {formatField(data.mandante2?.nombre)}</span>
                <span style={{ fontSize: '0.7rem', color: '#334155' }}><strong style={{ color: '#0d1724' }}>C.C. / NIT:</strong> {formatField(data.mandante2?.documento)}</span>
              </div>
            )}
          </div>

          {/* Información Comercial de Captación */}
          <div style={{ marginTop: '5rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1.2rem' }}>
            <table style={{ width: '100%', fontSize: '0.65rem', color: '#475569' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%' }}>
                    <strong style={{ color: '#0d1724' }}>Captado por:</strong> {agent ? agent.name : (data.firma?.captadoPor || 'Asesor Interno')}
                  </td>
                  <td>
                    <strong style={{ color: '#0d1724' }}>Medio de Contacto:</strong> {formatField(data.firma?.medioContacto)}
                  </td>
                </tr>
                {agent && (
                  <tr>
                    <td colspan="2" style={{ paddingTop: '0.4rem', color: '#64748b' }}>
                      Asesor Externo Registrado: {agent.name} (Cel: {agent.phone} | Tipo de Sangre: {agent.blood_type || 'N/A'})
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#94a3b8' }}>
          <span>Rentun Group SAS · Portal de Contratos de Mandato</span>
          <span>Página 6</span>
        </div>
      </div>

    </div>
  );
}
