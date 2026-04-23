import React from 'react';
import type { ReactNode } from 'react';
import { ChatWidget } from './ChatWidget';
import elpratBg from '../assets/elprat-bg.png';
import elpratLogo from '../assets/elprat-logo.svg';
import styles from './ElPratDemo.module.css';

interface ElPratDemoProps {
  layout: ReactNode;
  isComplaintMode?: boolean;
  onToggleComplaint?: () => void;
}

export const ElPratDemo: React.FC<ElPratDemoProps> = ({ 
  layout, 
  isComplaintMode = false,
  onToggleComplaint,
}) => {
  return (
    <div className={styles.demo}>
      {/* ── Top language bar ──────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <a href="#" className={styles.langLink}>Català</a>
          <span className={styles.langSeparator}> | </span>
          <a href="#" className={styles.langLink}>Castellano</a>
        </div>
      </div>

      {/* ── Main header ───────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Logo */}
          <a href="#" className={styles.logo}>
            <img
              src={elpratLogo}
              alt="Ajuntament del Prat de Llobregat"
              className={styles.logoImg}
            />
          </a>

          {/* Navigation */}
          <nav aria-label="Navegació principal">
            <ul className={styles.nav}>
              {[
                "L'Ajuntament",
                'Participació',
                'Seu Electrònica',
                'La ciutat',
                'Atenció ciudadana',
                'Temes',
                'Actualitat',
                'Sala de Premsa',
              ].map((item) => (
                <li key={item} className={styles.navItem}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search icon */}
          <div className={styles.searchIcon} aria-label="Cerca">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>
      </header>

      {/* ── Hero section ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <img
          src={elpratBg}
          alt=""
          className={styles.heroBg}
          aria-hidden="true"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={styles.heroContent}>
          <h1 className={styles.heroText}>elprat</h1>
        </div>

        {/* Weather */}
        <div className={styles.heroWeather} aria-label="Temps: Avui 18 graus">
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <ellipse cx="32" cy="38" rx="18" ry="12" fill="rgba(255,255,255,0.8)" />
            <ellipse cx="24" cy="36" rx="12" ry="9" fill="rgba(255,255,255,0.9)" />
            <circle cx="18" cy="28" r="9" fill="rgba(255,255,255,0.75)" />
            <circle cx="30" cy="25" r="11" fill="rgba(255,255,255,0.85)" />
            <circle cx="42" cy="30" r="8" fill="rgba(255,255,255,0.75)" />
          </svg>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>Avui</div>
            <div className={styles.heroWeatherTemp}>18°</div>
          </div>
        </div>

        {/* Social icons */}
        <div className={styles.heroSocial} aria-hidden="true">
          {['𝕏', 'f', '✈', '▶', '♪', '✓'].map((icon, i) => (
            <div key={i} className={styles.socialIcon} title="">
              {icon}
            </div>
          ))}
        </div>
      </section>

      {/* ── Search + most consulted ────────────────────────────────── */}
      <section className={styles.searchSection}>
        <div className={styles.searchSectionInner}>
          <div className={styles.searchBox}>
            <div className={styles.searchInput}>
              <span>Cerca tràmits, serveis i molt més...</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div className={styles.searchHint}>
              El més cercat:{' '}
              <a href="#">Transports</a>, <a href="#">Agenda</a>,{' '}
              <a href="#">Inscripcions on-line</a> ...
            </div>
            <div className={styles.searchCita}>
              Has de fer tràmits de forma presencial amb l'Ajuntament?<br />
              No perdis temps, <a href="#">demana cita prèvia</a>
            </div>
          </div>

          <aside>
            <div className={styles.mostConsulted}>
              <h2 className={styles.mostConsultedTitle}>El més consultat</h2>
              <ul className={styles.mostConsultedList}>
                {[
                  'Sol·licitud general',
                  "Justificant d'empadronament",
                  'Al·legacions de trànsit',
                  'Recollida de mobles',
                  "Oferta pública d'ocupació",
                  'Farmàcies',
                  'Queixes i suggeriments',
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Cards section ─────────────────────────────────────────── */}
      <section className={styles.cardsSection}>
        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <div
              className={styles.cardImgPlaceholder}
              style={{ background: 'linear-gradient(135deg, #f9e4b0, #e8c84a)' }}
            >
              Festes de la Carxofa — Prat 2026
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardLabel}>Agenda</div>
              <div className={styles.cardTitle}>Festes de la Carxofa del Prat 2026</div>
            </div>
          </div>
          <div className={styles.card}>
            <div
              className={styles.cardImgPlaceholder}
              style={{ background: 'linear-gradient(135deg, #b5e8a0, #3aaa35)' }}
            >
              Fira de Llibres de Primavera i Lletres
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardLabel}>Cultura</div>
              <div className={styles.cardTitle}>Fira de Llibres de Primavera i Lletres</div>
            </div>
          </div>
          <div className={styles.card}>
            <div
              className={styles.cardImgPlaceholder}
              style={{
                background: 'linear-gradient(135deg, #d0e8d0, #7ab87a)',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontWeight: 700, color: '#1d4e8b', fontSize: '15px' }}>Alba Bou</span>
              <span style={{ color: '#555' }}>L'alcaldessa</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardLabel}>Ajuntament</div>
              <div className={styles.cardTitle}>Missatge de l'alcaldessa</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        © 2026 Ajuntament del Prat de Llobregat · Plaça de la Vila, 1 · 08820 El Prat de
        Llobregat
      </footer>

      {/* ── Floating chat widget ───────────────────────────────────── */}
      <ChatWidget 
        layout={layout} 
        isComplaintMode={isComplaintMode}
        onToggleComplaint={onToggleComplaint}
      />
    </div>
  );
};
