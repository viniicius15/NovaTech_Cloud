function Login({
  email,
  setEmail,
  senha,
  setSenha,
  fazerLogin,
  carregando,
  mensagem,
  tipoMensagem,
  onIrParaCadastro,
}) {
  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-glow glow-one"></div>
        <div className="login-glow glow-two"></div>
      </div>

      <div className="login-wrapper">
        <div className="login-brand">
          <div className="brand-icon">N</div>
          <span>NovaTech</span>
        </div>

        <div className="login-card">
          <div className="login-header">
            <span className="welcome-badge">Bem-vindo de volta</span>

            <h1>Acesse sua conta</h1>

            <p>Entre no painel da NovaTech para gerenciar suas vendas.</p>
          </div>

          <form onSubmit={fazerLogin}>
            <div className="input-group">
              <label>E-mail</label>

              <div className="input-wrapper">
                <span>✉</span>

                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Senha</label>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            <button className="login-button" type="submit" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar no sistema →"}
            </button>
          </form>

          <button
            type="button"
            className="toggle-cadastro"
            onClick={onIrParaCadastro}
            style={{
              marginTop: "16px",
              background: "none",
              border: "none",
              color: "#888",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Não tem conta? Criar agora
          </button>

          {mensagem && (
            <div className={`toast login-toast ${tipoMensagem}`}>
              {mensagem}
            </div>
          )}

          <div className="login-footer">
            <span>NovaTech Soluções</span>
            <span>•</span>
            <span>Sistema de gestão</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;