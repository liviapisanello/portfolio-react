"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Sun, X } from "lucide-react";

const THEME_KEY = "livia-portfolio-theme";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(THEME_KEY);
    } catch (error) {
      console.error("Não foi possível ler a preferência de tema salva.", error);
    }
    if (saved === "dark" || saved === "light") {
      document.documentElement.dataset.theme = saved;
    }
  }, []);

  function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch (error) {
      console.error("Não foi possível salvar a preferência de tema.", error);
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <nav className="header-inner section-wrap" aria-label="Navegação principal">
        <Link className="wordmark" href="/" onClick={closeMenu}>
          LÍVIA<span>.</span>
        </Link>
        <div className={`nav-links${menuOpen ? " nav-links-open" : ""}`}>
          <Link href="/#sobre" onClick={closeMenu}>
            Sobre
          </Link>
          <Link href="/#skills" onClick={closeMenu}>
            Stack
          </Link>
          <Link href="/#projetos" onClick={closeMenu}>
            Projetos
          </Link>
          <Link href="/#contato" onClick={closeMenu}>
            Contato
          </Link>
        </div>
        <div className="header-actions">
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
            title="Alternar tema"
          >
            <Sun size={18} />
          </button>
          <button
            className="icon-button menu-toggle"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>
    </header>
  );
}
