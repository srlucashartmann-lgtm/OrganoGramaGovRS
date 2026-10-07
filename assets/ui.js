/* Organograma RS — utilitários de apresentação compartilhados (não alteram dados) */
(function(){
  var PREFIX_RE = /^(Secretaria\s+Extraordin[áa]ria\s+(?:de|da|do|das|dos)|Secretaria\s+(?:de|da|do|das|dos))\s+(.+)$/i;

  function normalize(s){
    return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // "Secretaria da Saúde" -> { prefix: "Secretaria da", main: "Saúde" }
  // Nomes sem prefixo (ex.: "Casa Civil") voltam inteiros em `main`.
  function splitName(name){
    var full = (name || '').toString();
    var m = full.match(PREFIX_RE);
    return m ? { prefix: m[1], main: m[2] } : { prefix: '', main: full };
  }

  // Ordena pela parte que diferencia os nomes (ignora o prefixo comum).
  function compareByMainName(a, b){
    var ka = splitName(a).main, kb = splitName(b).main;
    return ka.localeCompare(kb, 'pt', { sensitivity: 'base' });
  }

  // Monta o nome em duas camadas: prefixo discreto + nome principal em destaque.
  // O texto completo continua no elemento (leitores de tela leem o nome inteiro).
  function nameNode(name, tag){
    var parts = splitName(name);
    var wrap = document.createElement(tag || 'span');
    wrap.className = 'org-name';
    if (parts.prefix){
      var pre = document.createElement('span');
      pre.className = 'org-name-prefix';
      pre.textContent = parts.prefix;
      wrap.appendChild(pre);
      wrap.appendChild(document.createTextNode(' '));
    }
    var main = document.createElement('span');
    main.className = 'org-name-main';
    main.textContent = parts.main;
    wrap.appendChild(main);
    return wrap;
  }

  // === Redes sociais da secretaria (lê os mapas de dados/redes-sociais.js) ===
  var NETWORKS = ['facebook', 'instagram', 'youtube', 'x'];
  var NETWORK_LABELS = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', x: 'X (Twitter)' };
  var NETWORK_ICONS = {
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.5V11H8v3h2v7h3v-7h2.1l.9-3H13v-1.5c0-.3.2-.5.5-.5Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.5-8.9a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2ZM17 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4Zm2 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a3 3 0 0 0-2.1-2.1C18 4.7 12 4.7 12 4.7s-6 0-7.5.4a3 3 0 0 0-2.1 2.1C2 8.7 2 12 2 12s0 3.3.4 4.8a3 3 0 0 0 2.1 2.1c1.5.4 7.5.4 7.5.4s6 0 7.5-.4a3 3 0 0 0 2.1-2.1c.4-1.5.4-4.8.4-4.8s0-3.3-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 3h4.7l4.7 6.6L18.9 3H21l-6.7 7.6L21 21h-4.7l-5-7-5.5 7H3l7-8-7-10Z"/></svg>'
  };

  // Mesmo formato de chave usado em NODE_SOCIALS ("Secretaria da Saúde" -> "secretaria-da-saude")
  function slugifyName(s){
    return normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // Junta os links da secretaria: SOCIALS[chave] (mapa por secretaria) e NODE_SOCIALS[slug do nome].
  function secretariaSocials(key, name){
    var bySecretaria = (window.SOCIALS || {})[key] || {};
    var byName = (window.NODE_SOCIALS || {})[slugifyName(name)] || {};
    var out = [];
    for (var i = 0; i < NETWORKS.length; i++){
      var net = NETWORKS[i];
      var href = bySecretaria[net] || byName[net];
      if (href) out.push({ network: net, label: NETWORK_LABELS[net], href: href });
    }
    return out;
  }

  // Lista de links com ícone; só redes cadastradas aparecem.
  function socialLinksNode(links, ownerName, className){
    var wrap = document.createElement('div');
    wrap.className = className || 'social-links';
    for (var i = 0; i < links.length; i++){
      var a = document.createElement('a');
      a.href = links[i].href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'social-link is-' + links[i].network;
      a.title = links[i].label;
      a.setAttribute('aria-label', links[i].label + (ownerName ? ' – ' + ownerName : '') + ' (abre em nova aba)');
      a.innerHTML = NETWORK_ICONS[links[i].network];
      wrap.appendChild(a);
    }
    return wrap;
  }

  window.OrgUI = {
    normalize: normalize,
    splitName: splitName,
    compareByMainName: compareByMainName,
    nameNode: nameNode,
    secretariaSocials: secretariaSocials,
    socialLinksNode: socialLinksNode
  };
})();
