"use client";

// ── GoSports Header ────────────────────────────────────────────
export default function Header() {
  return (
    <header className="relative z-10 w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">

        {/* Logo + brand */}
        <div className="flex items-center gap-3 mb-8">
          {/* Logo mark */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gosports-primary flex items-center justify-center shadow-gosports-md">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="2" />
                <path
                  d="M7 11 C7 8 9 6 11 6 C13 6 15 8 15 11"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="11" cy="15" r="2" fill="white" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gosports-accent rounded-full border-2 border-white" />
          </div>

          {/* Brand name */}
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-gosports-dark">
              Go<span className="text-gosports-primary">Sports</span>
            </span>
            <div className="text-xs text-gosports-gray font-medium tracking-wide uppercase">
              Central de Ajuda
            </div>
          </div>

          {/* Badge */}
          <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-gosports-light border border-gosports-primary/20 text-gosports-secondary text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-gosports-primary animate-pulse" />
            Assistente Ativo
          </div>
        </div>

        {/* Hero text */}
        <div className="text-center space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-gosports-dark">
            Como podemos{" "}
            <span className="gradient-text">te ajudar</span>
            <span className="text-gosports-accent">?</span>
          </h1>
          <p className="text-gosports-gray text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Tire suas dúvidas sobre o app GoSports — reservas, conta,
            pagamentos e muito mais.
          </p>
        </div>

      </div>
    </header>
  );
}
