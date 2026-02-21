// ============================================================
// BestBarbers Report Agent v2 — background.js
// ============================================================

// ⚠️ TROQUE PELA SUA URL DO VERCEL APÓS O DEPLOY
// Exemplo: 'https://bestbarbers-dashboard.vercel.app/api/dados'
const SERVER_URL = 'COLE_SUA_URL_VERCEL_AQUI/api/dados';

// ── Instala alarme na primeira vez ────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('coletaAutomatica', { periodInMinutes: 60 });
  notificar('BestBarbers Agent ativado ✂️', 'Coleta automática configurada — a cada 1 hora.');
});

// ── Dispara coleta a cada 1 hora ──────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'coletaAutomatica') await coletarEEnviar();
});

// ── Notificação Chrome ────────────────────────────────────
function notificar(titulo, mensagem, erro = false) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: titulo,
    message: mensagem,
    priority: erro ? 2 : 1,
    silent: !erro
  });
}

// ── Coleta e envia ao Vercel ──────────────────────────────
async function coletarEEnviar() {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://adm.bestbarbers.app/*' });

    if (tabs.length === 0) {
      notificar('BestBarbers Agent ⚠️',
        'Coleta automática: nenhuma aba do BestBarbers aberta.', true);
      return;
    }

    let ok = 0;
    for (const tab of tabs) {
      const resp = await chrome.tabs.sendMessage(tab.id, { action: 'coletar' });
      if (resp?.sucesso) {
        await enviar(resp.dados);
        ok++;
      }
    }

    if (ok > 0) {
      const hora = new Date().toLocaleString('pt-BR', {hour:'2-digit', minute:'2-digit'});
      notificar('BestBarbers — Dados enviados ✅', `Coleta automática às ${hora}. Próxima em 1h.`);
    }

  } catch (e) {
    notificar('BestBarbers Agent ❌', 'Erro: ' + e.message, true);
  }
}

async function enviar(dados) {
  await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
}

// ── Mensagens do popup ────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === 'download') {
    chrome.downloads.download({ url: msg.dataUrl, filename: msg.filename, saveAs: false },
      id => sendResponse({ sucesso: !chrome.runtime.lastError, id })
    );
    return true;
  }

  if (msg.action === 'enviarServidor') {
    enviar(msg.dados)
      .then(() => sendResponse({ sucesso: true }))
      .catch(e => sendResponse({ sucesso: false, erro: e.message }));
    return true;
  }

  if (msg.action === 'coletarAgora') {
    coletarEEnviar()
      .then(() => sendResponse({ sucesso: true }))
      .catch(e => sendResponse({ sucesso: false, erro: e.message }));
    return true;
  }
});
