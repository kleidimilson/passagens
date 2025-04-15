

// const puppeteer = require('puppeteer-core');
// const fs = require('fs');

// async function buscarVoosLatam(origin, destination, outboundDate, inboundDate, passengers) {
//   const browser = await puppeteer.launch({
//     headless: false,
//     executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
//     defaultViewport: null,
//     args: ['--start-maximized']
//   });

//   const page = await browser.newPage();

//   const url = `https://www.latamairlines.com/br/pt/oferta-voos?origin=${origin}&outbound=${outboundDate}&destination=${destination}&adt=${passengers.adults}&chd=${passengers.children}&inf=${passengers.infants}&trip=RT&cabin=Economy&redemption=false&sort=RECOMMENDED&inbound=${inboundDate}`;

//   await page.goto(url, { waitUntil: 'networkidle2' });

//   try {
//     const hasCookie = await page.waitForSelector('#cookies-politics-button', { timeout: 60000 });
//     if (hasCookie) {
//       await page.click('#cookies-politics-button');
//       console.log('✅ Cookies aceitos!');
//     }
//   } catch (error) {
//     console.error('❌ Não foi possível encontrar o botão de cookies.');
//   }

//   try {
//     await page.waitForSelector('[data-testid^="wrapper-card-flight-"]', { timeout: 60000 });
//   } catch (error) {
//     console.error('❌ Não foi possível encontrar os cards de voos.');
//     await browser.close();
//     return;
//   }

//   const voos = await page.$$eval('[data-testid^="wrapper-card-flight-"]', cards => {
//     return cards.map(card => {
//       const getText = selector =>
//         card.querySelector(selector)?.textContent.trim() || '';

//       const horarioPartida = getText('[data-testid$="-origin"] .flightInfostyles__TextHourFlight-sc__sc-edlvrg-4');
//       const aeroportoPartida = getText('[data-testid$="-origin"] .flightInfostyles__TextIATA-sc__sc-edlvrg-5');
//       const horarioChegada = getText('[data-testid$="-destination"] .flightInfostyles__TextHourFlight-sc__sc-edlvrg-4');
//       const aeroportoChegada = getText('[data-testid$="-destination"] .flightInfostyles__TextIATA-sc__sc-edlvrg-5');
//       const duracao = getText('[data-testid$="-duration"] span:last-child');
//       const preco = card.querySelector('[data-testid$="-amount"] [aria-label]')?.getAttribute('aria-label') || '';
//       const operador = getText('[data-testid="FlightOperatorDetail"]');

//       return {
//         partida: `${horarioPartida} (${aeroportoPartida})`,
//         chegada: `${horarioChegada} (${aeroportoChegada})`,
//         duracao,
//         preco,
//         operador
//       };
//     });
//   });

//   console.log('✈️ Voos encontrados:\n');
//   console.table(voos);

//   // Carregar ofertas antigas de um arquivo
//   let ofertasAntigas = [];
//   if (fs.existsSync('ofertas_voosLatam.json')) {
//     ofertasAntigas = JSON.parse(fs.readFileSync('ofertas_voosLatam.json'));
//   }

//   // Comparar ofertas
//   voos.forEach(voo => {
//     const ofertaAntiga = ofertasAntigas.find(o => o.partida === voo.partida && o.chegada === voo.chegada);
//     if (ofertaAntiga) {
//       if (parseFloat(voo.preco.replace('R$', '').replace(',', '.')) < parseFloat(ofertaAntiga.preco.replace('R$', '').replace(',', '.'))) {
//         console.log(`🚨 Oferta melhor encontrada!`);
//         console.table([voo]);
//       }
//     } else {
//       console.log(`📅 Nova oferta encontrada:`);
//       console.table([voo]);
//     }
//   });

//   // Salvar as ofertas no arquivo JSON
//   fs.writeFileSync('ofertas_voosLatam.json', JSON.stringify(voos, null, 2));

//   await browser.close();
// }

// // Chamando a função com parâmetros dinâmicos
// buscarVoosLatam(
//   'THE', 
//   'SAO', 
//   '2025-04-15T15%3A00%3A00.000Z', 
//   '2025-05-20T15%3A00%3A00.000Z', 
//   { adults: 1, children: 0, infants: 0 }
// );
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Inicializa o cliente do WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('ready', async () => {
  console.log('✅ Cliente do WhatsApp pronto!');

  // Executa o scraping e envio
  await buscarVoosLatam(
    'THE', 
    'SAO', 
    '2025-04-15T15%3A00%3A00.000Z', 
    '2025-05-20T15%3A00%3A00.000Z', 
    { adults: 1, children: 0, infants: 0 }
  );
});

client.initialize();

async function buscarVoosLatam(origin, destination, outboundDate, inboundDate, passengers) {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();

  const url = `https://www.latamairlines.com/br/pt/oferta-voos?origin=${origin}&outbound=${outboundDate}&destination=${destination}&adt=${passengers.adults}&chd=${passengers.children}&inf=${passengers.infants}&trip=RT&cabin=Economy&redemption=false&sort=RECOMMENDED&inbound=${inboundDate}`;

  await page.goto(url, { waitUntil: 'networkidle2' });

  try {
    const hasCookie = await page.waitForSelector('#cookies-politics-button', { timeout: 60000 });
    if (hasCookie) {
      await page.click('#cookies-politics-button');
      console.log('✅ Cookies aceitos!');
    }
  } catch {
    console.warn('⚠️ Não foi possível encontrar o botão de cookies.');
  }

  try {
    await page.waitForSelector('[data-testid^="wrapper-card-flight-"]', { timeout: 60000 });
  } catch {
    console.error('❌ Não foi possível encontrar os cards de voos.');
    await browser.close();
    return;
  }

  const voos = await page.$$eval('[data-testid^="wrapper-card-flight-"]', cards => {
    return cards.map(card => {
      const getText = selector =>
        card.querySelector(selector)?.textContent.trim() || '';

      const horarioPartida = getText('[data-testid$="-origin"] .flightInfostyles__TextHourFlight-sc__sc-edlvrg-4');
      const aeroportoPartida = getText('[data-testid$="-origin"] .flightInfostyles__TextIATA-sc__sc-edlvrg-5');
      const horarioChegada = getText('[data-testid$="-destination"] .flightInfostyles__TextHourFlight-sc__sc-edlvrg-4');
      const aeroportoChegada = getText('[data-testid$="-destination"] .flightInfostyles__TextIATA-sc__sc-edlvrg-5');
      const duracao = getText('[data-testid$="-duration"] span:last-child');
      const preco = card.querySelector('[data-testid$="-amount"] [aria-label]')?.getAttribute('aria-label') || '';
      const operador = getText('[data-testid="FlightOperatorDetail"]');

      return {
        partida: `${horarioPartida} (${aeroportoPartida})`,
        chegada: `${horarioChegada} (${aeroportoChegada})`,
        duracao,
        preco,
        operador,
      };
    });
  });

  console.log('✈️ Voos encontrados:\n');
  console.table(voos);

  // Carregar ofertas antigas
  let ofertasAntigas = [];
  const filePath = 'ofertas_voosLatam.json';
  if (fs.existsSync(filePath)) {
    ofertasAntigas = JSON.parse(fs.readFileSync(filePath));
  }

  const mensagens = [];

  // Util para conversão de preço
  const parsePreco = valor => parseFloat(valor.replace(/[R$\s]/g, '').replace('.', '').replace(',', '.'));

  // Comparar ofertas
  voos.forEach(voo => {
    const ofertaAntiga = ofertasAntigas.find(o => o.partida === voo.partida && o.chegada === voo.chegada);
    const precoAtual = parsePreco(voo.preco);
    const precoAntigo = ofertaAntiga ? parsePreco(ofertaAntiga.preco) : null;

    if (ofertaAntiga && precoAtual < precoAntigo) {
      mensagens.push(`🚨 *Oferta melhor encontrada!*\n✈️ *Partida:* ${voo.partida}\n📍 *Chegada:* ${voo.chegada}\n💸 *Preço:* ${voo.preco}\n🕒 *Duração:* ${voo.duracao}\n🛫 *Operador:* ${voo.operador}  \n *Link:* https://www.latamairlines.com/br/pt/oferta-voos?origin=${origin}&outbound=${outboundDate}&destination=${destination}&adt=${passengers.adults}&chd=${passengers.children}&inf=${passengers.infants}&trip=RT&cabin=Economy&redemption=false&sort=RECOMMENDED&inbound=${inboundDate}`);
    } else if (!ofertaAntiga) {
      mensagens.push(`📅 *Nova oferta!*\n✈️ *Partida:* ${voo.partida}\n📍 *Chegada:* ${voo.chegada}\n💸 *Preço:* ${voo.preco}\n🕒 *Duração:* ${voo.duracao}\n🛫 *Operador:* ${voo.operador} \n *Link:* https://www.latamairlines.com/br/pt/oferta-voos?origin=${origin}&outbound=${outboundDate}&destination=${destination}&adt=${passengers.adults}&chd=${passengers.children}&inf=${passengers.infants}&trip=RT&cabin=Economy&redemption=false&sort=RECOMMENDED&inbound=${inboundDate}`);
    }
  });

  // Salvar as novas ofertas
  fs.writeFileSync(filePath, JSON.stringify(voos, null, 2));

  // Enviar mensagens no WhatsApp
//   const chats = await client.getChats();
//   const chatPessoal = chats.find(chat =>
//     !chat.isGroup && (chat.name === 'Kleidimilson' || chat.id.user.includes('55')) // fallback com número
//   );

const chats = await client.getChats();
const grupo = chats.find(chat => chat.isGroup && chat.name === 'Testes');

  if (grupo && mensagens.length > 0) {
    for (const msg of mensagens) {
      await grupo.sendMessage(msg);
    }
    console.log('📩 Mensagens enviadas no WhatsApp!');
  } else {
    console.log('⚠️ Nenhuma nova oferta para enviar ou chat não encontrado.');
  }

  await browser.close();
}
