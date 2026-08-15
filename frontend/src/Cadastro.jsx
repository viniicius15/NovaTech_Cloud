import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_SENHA_FORTE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

function Cadastro({ mostrarMensagem, onCadastroSucesso, onVoltarLogin }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [erros, setErros] = useState({});

  function limparErro(campo) {
    setErros((atual) => {
      if (!atual[campo]) return atual;

      const copia = { ...atual };
      delete copia[campo];
      return copia;
    });
  }

  function validar() {
    const novosErros = {};

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    if (!nomeLimpo) {
      novosErros.nome = "Informe seu nome.";
    } else if (nomeLimpo.length < 2) {
      novosErros.nome = "Nome muito curto.";
    }

    if (!emailLimpo) {
      novosErros.email = "Informe seu e-mail.";
    } else if (!REGEX_EMAIL.test(emailLimpo)) {
      novosErros.email = "Digite um e-mail válido.";
    }

    if (!senha) {
      novosErros.senha = "Informe uma senha.";
    } else if (senha.length < 6) {
      novosErros.senha = "A senha deve ter no mínimo 6 caracteres.";
    } else if (!REGEX_SENHA_FORTE.test(senha)) {
      novosErros.senha = "A senha deve ter letras e números.";
    }

    if (!confirmarSenha) {
      novosErros.confirmarSenha = "Confirme sua senha.";
    } else if (senha && confirmarSenha !== senha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  }

  async function fazerCadastro(e) {
    e.preventDefault();

    if (!validar()) {
      mostrarMensagem("Corrija os campos destacados.", "error");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        if (resposta.status === 409) {
          setErros({ email: "Este e-mail já está cadastrado." });
        }

        mostrarMensagem(dados.error || "Erro ao criar conta.", "error");
        return;
      }

      mostrarMensagem("Conta criada com sucesso! Faça login.");

      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
      setErros({});

      onCadastroSucesso();
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao conectar com o servidor.", "error");
    } finally {
      setCarregando(false);
    }
  }

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
            <span className="welcome-badge">Crie sua conta</span>

            <h1>Cadastre-se</h1>

            <p>Crie sua conta para acessar o painel da NovaTech.</p>
          </div>

          <form onSubmit={fazerCadastro} noValidate>
            <div className="input-group">
              <label>Nome</label>

              <div className="input-wrapper">
                <span>👤</span>

                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    limparErro("nome");
                  }}
                />
              </div>

              {erros.nome && (
                <span className="campo-erro">{erros.nome}</span>
              )}
            </div>

            <div className="input-group">
              <label>E-mail</label>

              <div className="input-wrapper">
                <span>✉</span>

                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    limparErro("email");
                  }}
                />
              </div>

              {erros.email && (
                <span className="campo-erro">{erros.email}</span>
              )}
            </div>

            <div className="input-group">
              <label>Senha</label>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    limparErro("senha");

                    if (confirmarSenha) {
                      limparErro("confirmarSenha");
                    }
                  }}
                />
              </div>

              {erros.senha ? (
                <span className="campo-erro">{erros.senha}</span>
              ) : (
                <span className="campo-dica">
                  Mínimo 6 caracteres, com letras e números.
                </span>
              )}
            </div>

            <div className="input-group">
              <label>Confirmar senha</label>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value);
                    limparErro("confirmarSenha");
                  }}
                />
              </div>

              {erros.confirmarSenha && (
                <span className="campo-erro">{erros.confirmarSenha}</span>
              )}
            </div>

            <button className="login-button" type="submit" disabled={carregando}>
              {carregando ? "Criando conta..." : "Criar conta →"}
            </button>
          </form>

          <button
            type="button"
            className="toggle-cadastro"
            onClick={onVoltarLogin}
            style={{
              marginTop: "16px",
              background: "none",
              border: "none",
              color: "#888",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Já tem conta? Fazer login
          </button>

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

export default Cadastro;