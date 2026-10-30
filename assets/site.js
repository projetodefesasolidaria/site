/* Defesa Solidária · comportamento do site */

/*
 * CONFIGURAÇÃO EDITÁVEL
 * canalAberto   true exibe o formulário de contato inicial; false exibe o aviso de abertura.
 * aberturaTexto texto exibido quando o canal estiver fechado.
 * vagas         situação das vagas exibida na página (Regimento, art. 20).
 * form          endereço do Google Forms que recebe o contato inicial e os campos correspondentes.
 */
window.DS_CONFIG = {
  canalAberto: true,
  aberturaTexto: "O contato inicial será aberto em breve, e a data será divulgada nesta página e no perfil institucional do projeto.",
  vagas: { disponiveis: 3, total: 3, atualizadoEm: "30 de outubro de 2026" },
  form: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSfkN2Gjm4iaMCA8Q_3giBW1VckdSL_KwfWtVzjAqyPMO-Hs6g/formResponse",
    campos: {
      nome: "457905669", relacao: "520144594", telefone: "323354500", email: "513408301", origem: "1234409273",
      acusado: "1595485192", vitima: "1652869829", correus: "1442956097", processo: "1474362403", comarca: "903118989",
      juri: "1016776643", declaracoes: "1420932128"
    }
  }
};

(function () {
  var doc = document;

  /* cabeçalho sólido ao rolar */
  var header = doc.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40 || header.dataset.sempreSolido === "1") header.classList.add("solid");
    else header.classList.remove("solid");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* menu no celular */
  var menuBtn = doc.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var aberto = doc.body.classList.toggle("menu-aberto");
      menuBtn.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    doc.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        doc.body.classList.remove("menu-aberto");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* animação de entrada */
  var revelar = doc.querySelectorAll(".revela");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visivel"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revelar.forEach(function (el) { io.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add("visivel"); });
  }

  /* destaque do item de navegação da seção visível */
  var links = doc.querySelectorAll('.nav a[href^="#"]');
  if (links.length && "IntersectionObserver" in window) {
    var mapa = {};
    links.forEach(function (a) { mapa[a.getAttribute("href").slice(1)] = a; });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && mapa[e.target.id]) {
          links.forEach(function (l) { l.classList.remove("ativo"); });
          mapa[e.target.id].classList.add("ativo");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(mapa).forEach(function (id) { var s = doc.getElementById(id); if (s) navObs.observe(s); });
  }

  /* ano no rodapé */
  doc.querySelectorAll("[data-ano]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* situação das vagas */
  var cfg = window.DS_CONFIG;
  var vagasNum = doc.querySelector("[data-vagas-num]");
  if (vagasNum) {
    vagasNum.innerHTML = cfg.vagas.disponiveis + "<small> / " + cfg.vagas.total + "</small>";
    var vt = doc.querySelector("[data-vagas-texto]");
    if (vt) {
      vt.textContent = cfg.vagas.disponiveis > 0
        ? (cfg.vagas.disponiveis === 1 ? "vaga disponível para novos casos" : "vagas disponíveis para novos casos")
        : "Sem vagas no momento. Procure a Defensoria Pública do Estado do Pará.";
    }
    var vd = doc.querySelector("[data-vagas-data]");
    if (vd) vd.textContent = "Situação atualizada em " + cfg.vagas.atualizadoEm + ".";
  }

  /* formulário de contato inicial */
  var card = doc.querySelector(".form-card");
  var form = doc.getElementById("form-contato");
  if (!card || !form) return;

  if (!cfg.canalAberto || cfg.vagas.disponiveis <= 0) {
    card.classList.add("canal-fechado");
    var ft = card.querySelector("[data-fechado-texto]");
    if (ft) {
      ft.textContent = cfg.vagas.disponiveis <= 0
        ? "No momento não há vagas disponíveis. Recomendamos procurar a Defensoria Pública do Estado do Pará, que presta assistência jurídica integral e gratuita a quem dela necessita."
        : cfg.aberturaTexto;
    }
    return;
  }

  /* máscara simples de telefone */
  var tel = form.querySelector("#f-telefone");
  if (tel) {
    tel.addEventListener("input", function () {
      var d = tel.value.replace(/\D/g, "").slice(0, 11);
      var r = d;
      if (d.length > 2) r = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) r = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(d.length - 4);
      tel.value = r;
    });
  }

  function marcarErro(el, on) {
    var box = el.closest(".campo") || el.closest(".check");
    if (box) box.classList.toggle("erro", on);
  }

  function validar() {
    var ok = true, primeiro = null;
    form.querySelectorAll("[data-obrigatorio]").forEach(function (el) {
      var valido;
      if (el.type === "checkbox") valido = el.checked;
      else if (el.type === "radio") valido = !!form.querySelector('input[name="' + el.name + '"]:checked');
      else valido = el.value.trim().length > 0;
      if (el.type === "email" && el.value.trim()) valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (el.id === "f-telefone") valido = el.value.replace(/\D/g, "").length >= 10;
      marcarErro(el, !valido);
      if (!valido) { ok = false; if (!primeiro) primeiro = el; }
    });
    var email = form.querySelector("#f-email");
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      marcarErro(email, true); ok = false; if (!primeiro) primeiro = email;
    }
    if (primeiro) primeiro.focus({ preventScroll: false });
    return ok;
  }

  form.querySelectorAll("input,select,textarea").forEach(function (el) {
    el.addEventListener("change", function () { marcarErro(el, false); });
    el.addEventListener("input", function () { marcarErro(el, false); });
  });

  var status = card.querySelector(".form-status");
  function mostrarErro(msg) { status.className = "form-status erro"; status.innerHTML = msg; }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    status.className = "form-status";
    if (form.querySelector('[name="website"]').value) return; /* armadilha contra robôs */
    if (!validar()) {
      mostrarErro("Revise os campos destacados. Os campos marcados com asterisco e as quatro declarações são necessários para o envio.");
      return;
    }
    var c = cfg.form.campos;
    if (!cfg.form.action || !c.nome) {
      mostrarErro("O envio está temporariamente indisponível. Escreva para <a href=\"mailto:projetodefesasolidaria@gmail.com\">projetodefesasolidaria@gmail.com</a> informando apenas os nomes da pessoa acusada, da vítima e dos corréus, o número do processo e a comarca.");
      return;
    }
    var v = function (id) { var el = form.querySelector(id); return el ? el.value.trim() : ""; };
    var juri = form.querySelector('input[name="juri"]:checked');
    var agora = new Date();
    var carimbo = agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    var decl = [];
    form.querySelectorAll(".declaracoes input:checked").forEach(function (i) { decl.push("[x] " + i.dataset.texto); });

    var dados = new URLSearchParams();
    dados.append("entry." + c.nome, v("#f-nome"));
    dados.append("entry." + c.relacao, v("#f-relacao"));
    dados.append("entry." + c.telefone, v("#f-telefone"));
    dados.append("entry." + c.email, v("#f-email"));
    dados.append("entry." + c.origem, v("#f-origem"));
    dados.append("entry." + c.acusado, v("#f-acusado"));
    dados.append("entry." + c.vitima, v("#f-vitima"));
    dados.append("entry." + c.correus, v("#f-correus"));
    dados.append("entry." + c.processo, v("#f-processo"));
    dados.append("entry." + c.comarca, v("#f-comarca"));
    dados.append("entry." + c.juri, juri ? juri.value : "");
    dados.append("entry." + c.declaracoes, "Declarações aceitas no site em " + carimbo + ":\n" + decl.join("\n"));

    var botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.querySelector(".rotulo").textContent = "Enviando";

    fetch(cfg.form.action, { method: "POST", mode: "no-cors", body: dados })
      .then(function () {
        card.classList.add("enviado");
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(function () {
        botao.disabled = false;
        botao.querySelector(".rotulo").textContent = "Enviar contato inicial";
        mostrarErro("Não foi possível concluir o envio. Verifique sua conexão e tente novamente ou escreva para <a href=\"mailto:projetodefesasolidaria@gmail.com\">projetodefesasolidaria@gmail.com</a>.");
      });
  });
})();
