import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_URL } from '../services/api';

const formatDate = (v) =>
  v
    ? new Intl.DateTimeFormat('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      }).format(new Date(v))
    : '—';

// ─── Status states ─────────────────────────────────────────────────────────
const STATUS = { loading: 'loading', valid: 'valid', revoked: 'revoked', notFound: 'notFound', error: 'error' };

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [state, setState]   = useState(STATUS.loading);
  const [cert, setCert]     = useState(null);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!certificateId) { setState(STATUS.notFound); return; }

    const id = certificateId.toUpperCase().trim();

    fetch(`${API_URL}/certificates/verify/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) { setState(STATUS.notFound); return; }
        if (data.valid) {
          setCert(data);
          setState(STATUS.valid);
        } else if (data.reason === 'revoked') {
          setCert(data);
          setState(STATUS.revoked);
        } else {
          setState(STATUS.notFound);
        }
      })
      .catch((e) => { setErrMsg(e.message); setState(STATUS.error); });
  }, [certificateId]);

  const pdfHref = `${API_URL}/certificates/pdf/${(certificateId || '').toUpperCase()}`;

  // ── Loading ─────────────────────────────────────────────────────────────
  if (state === STATUS.loading) {
    return (
      <div style={{ minHeight:'100vh', display:'grid', placeItems:'center',
                    background:'#f8faf6' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{
            width:48, height:48, border:'3px solid #e2ebe0',
            borderTopColor:'#1c563e', borderRadius:'50%',
            animation:'spin 0.8s linear infinite', margin:'0 auto 16px',
          }}/>
          <p style={{ color:'#6b7a6e', fontWeight:700, fontSize:13 }}>
            Verifying certificate…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (state === STATUS.error) {
    return (
      <VerifyShell icon="⚠️" accent="#946914" bg="#fffbeb" border="#f0d080">
        <p className="eyebrow" style={{ color:'#946914' }}>Verification Error</p>
        <h1 style={{ color:'#5a3e00', fontSize:'clamp(28px,4vw,42px)' }}>
          Unable to verify
        </h1>
        <p style={{ color:'#7a5a14' }}>{errMsg || 'An unexpected error occurred.'}</p>
        <Link to="/" className="button" style={{ marginTop:16 }}>Return Home</Link>
      </VerifyShell>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────
  if (state === STATUS.notFound) {
    return (
      <VerifyShell icon="✕" accent="#943727" bg="#fdf3f2" border="#f3c8c2">
        <p className="eyebrow" style={{ color:'#943727' }}>Certificate Not Found</p>
        <h1 style={{ color:'#5a1a0f', fontSize:'clamp(28px,4vw,42px)' }}>
          This certificate could not be verified.
        </h1>
        <p style={{ color:'#7a3a2a', maxWidth:440, lineHeight:1.7 }}>
          The certificate ID <code style={{ background:'rgba(0,0,0,.06)',
          padding:'1px 6px', borderRadius:4 }}>
            {certificateId?.toUpperCase()}
          </code> does not exist in the Prashikshan registry.
          If you believe this is an error, please contact support.
        </p>
        <Link to="/" className="button" style={{ marginTop:16 }}>Return Home</Link>
      </VerifyShell>
    );
  }

  // ── Revoked ─────────────────────────────────────────────────────────────
  if (state === STATUS.revoked) {
    return (
      <VerifyShell icon="🚫" accent="#943727" bg="#fdf3f2" border="#f3c8c2">
        <p className="eyebrow" style={{ color:'#943727' }}>Certificate Status: REVOKED</p>
        <h1 style={{ color:'#5a1a0f', fontSize:'clamp(28px,4vw,42px)' }}>
          This certificate has been revoked.
        </h1>
        <p style={{ color:'#7a3a2a', lineHeight:1.7 }}>
          Certificate <code style={{ background:'rgba(0,0,0,.06)',
          padding:'1px 6px', borderRadius:4 }}>
            {cert?.certificateId}
          </code> was issued on {formatDate(cert?.issuedAt)} but has since been
          revoked by the platform. It is no longer valid for professional use.
        </p>
        <Link to="/" className="button" style={{ marginTop:16 }}>Return Home</Link>
      </VerifyShell>
    );
  }

  // ── Valid ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:'100vh', background:'#f8faf6',
      display:'grid', placeItems:'center', padding:'40px 24px',
    }}>
      <div style={{
        width:'min(100%, 640px)', background:'white', borderRadius:12,
        boxShadow:'0 20px 60px rgba(7,40,20,.12)',
        overflow:'hidden', border:'1px solid #dde5da',
      }}>
        {/* Green header strip */}
        <div style={{
          background:'linear-gradient(135deg,#1c4d37,#2b7550)',
          padding:'32px 36px 28px', textAlign:'center',
        }}>
          {/* Animated checkmark */}
          <div style={{
            width:72, height:72, borderRadius:'50%',
            background:'rgba(255,255,255,.15)',
            border:'3px solid rgba(255,255,255,.4)',
            display:'grid', placeItems:'center',
            margin:'0 auto 16px',
            fontSize:32,
          }}>✓</div>
          <p style={{
            margin:'0 0 6px', fontSize:10, fontWeight:800,
            color:'#d8f0e0', textTransform:'uppercase', letterSpacing:'0.12em',
          }}>
            Prashikshan · Verified Certificate
          </p>
          <h1 style={{
            margin:0, color:'white', fontFamily:"'Playfair Display', serif",
            fontSize:'clamp(24px,3.5vw,36px)', lineHeight:1.1,
          }}>
            ✓ VALID CERTIFICATE
          </h1>
          <p style={{ margin:'8px 0 0', color:'#c5ded0', fontSize:12 }}>
            This certificate has been verified against the Prashikshan registry.
          </p>
        </div>

        {/* Certificate details card */}
        <div style={{ padding:'28px 36px' }}>
          {[
            { label:'Student Name',    value: cert.studentName,           bold:true  },
            { label:'Course Completed',value: cert.courseName,            bold:true  },
            { label:'Course Code',     value: cert.courseCode                        },
            { label:'NEP Credits',     value: `${cert.credits} academic credits`     },
            { label:'Issue Date',      value: formatDate(cert.issuedAt)              },
            { label:'Certificate ID',  value: cert.certificateId,         mono:true  },
            { label:'Status',          value: cert.status,                badge:true },
          ].map(({ label, value, bold, mono, badge }) => (
            <div key={label} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'10px 0', borderBottom:'1px solid #eef1ee',
            }}>
              <span style={{ fontSize:11, color:'#6b7a6e', fontWeight:700 }}>{label}</span>
              {badge ? (
                <span style={{
                  padding:'3px 10px', borderRadius:12, fontSize:10, fontWeight:800,
                  background:'#e1f1df', color:'#1f663c',
                }}>● {value}</span>
              ) : (
                <span style={{
                  fontSize: bold ? 13 : 12,
                  fontWeight: bold ? 800 : 500,
                  color: '#1d3024',
                  fontFamily: mono ? "'DM Mono', monospace" : undefined,
                  letterSpacing: mono ? '0.04em' : undefined,
                }}>
                  {value}
                </span>
              )}
            </div>
          ))}

          {/* Actions */}
          <div style={{ display:'flex', gap:10, marginTop:22 }}>
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="button"
              style={{ flex:1, justifyContent:'center' }}>
              ↓ Download PDF Certificate
            </a>
            <Link to="/" className="button button-outline" style={{ flex:1, justifyContent:'center' }}>
              ← Return Home
            </Link>
          </div>

          <p style={{
            marginTop:16, fontSize:10, color:'#9aa69c',
            textAlign:'center', lineHeight:1.6,
          }}>
            This certificate was issued by Prashikshan — an NEP 2020-aligned career
            pathway platform. Verification powered by the Prashikshan Certificate Registry.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared shell for error/not-found/revoked states ─────────────────────
function VerifyShell({ icon, accent, bg, border, children }) {
  return (
    <div style={{
      minHeight:'100vh', background:'#f8faf6',
      display:'grid', placeItems:'center', padding:'40px 24px',
    }}>
      <div style={{
        width:'min(100%, 580px)', background:bg, borderRadius:12,
        border:`1.5px solid ${border}`,
        boxShadow:'0 10px 30px rgba(0,0,0,.07)',
        padding:'40px 40px 36px', textAlign:'center',
      }}>
        <div style={{
          width:64, height:64, borderRadius:'50%',
          background:bg, border:`2px solid ${border}`,
          display:'grid', placeItems:'center',
          margin:'0 auto 20px', fontSize:28,
        }}>
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}
