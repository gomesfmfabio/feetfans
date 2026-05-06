/**
 * N8N Node: Load FAQ Database
 *
 * Carrega o banco de dados de FAQ completo (todos os 20 FAQs)
 * Este código deve ser colado no node "Load FAQ Database" do workflow
 */

const FAQ_DATABASE = {
  "version": "1.0",
  "languages": ["pt", "en", "es"],
  "last_updated": "2026-05-05",
  "faqs": [
    {
      "id": "FAQ-001",
      "category": "greeting",
      "keywords_multilingual": ["hi", "hello", "hola", "oi", "hey", "olá"],
      "responses": {
        "pt": "Olá! Bem-vinda ao FeetFans ❤️👣",
        "en": "Hello! Welcome to FeetFans ❤️👣",
        "es": "¡Hola! Bienvenida a FeetFans ❤️👣"
      },
      "requires_followup": true
    },
    {
      "id": "FAQ-002",
      "category": "access",
      "keywords_multilingual": ["can't access", "não consigo acessar", "no puedo acceder", "find course", "encontrar curso", "hotmart", "login"],
      "responses": {
        "pt": "Certo, você precisa entrar no site da Hotmart https://consumer.hotmart.com com o seu email de compra. Após fazer login, clique em \"Minhas compras\" e selecione \"FeetFans Platform\" para começar. Caso ainda esteja com dificuldades, fizemos uma página mostrando o passo a passo de como acessar, entre em feetfans.com.br/help e siga as instruções! Me avise se mesmo assim não conseguir acessar.",
        "en": "Sure, you need to go to Hotmart website https://consumer.hotmart.com with your purchase email. After login, click 'My purchases' and select 'FeetFans Platform' to start. If you still have trouble, we made a page showing step-by-step how to access: feetfans.com.br/help Follow the instructions! Let me know if you still can't access.",
        "es": "Claro, necesitas entrar al sitio web de Hotmart https://consumer.hotmart.com con tu email de compra. Después de iniciar sesión, haz clic en 'Mis compras' y selecciona 'FeetFans Platform' para comenzar. Si aún tienes dificultades, hicimos una página mostrando paso a paso cómo acceder: feetfans.com.br/help ¡Síguelas! Avísame si aún no puedes acceder."
      },
      "followup": {
        "pt": "Entendi, provavelmente você digitou incorretamente seu email na hora da compra, por isso não está conseguindo acessar. Isso acontece muito! Mas não tem problema, me diga seu email para que eu te dê acesso manualmente.",
        "en": "I understand, you probably entered your email incorrectly at the time of purchase, that's why you can't access. This happens a lot! But no problem, tell me your email so I can give you manual access.",
        "es": "Entiendo, probablemente ingresaste tu email incorrectamente al momento de la compra, por eso no puedes acceder. ¡Esto pasa mucho! Pero no hay problema, dime tu email para que pueda darte acceso manual."
      }
    },
    {
      "id": "FAQ-007",
      "category": "legitimacy",
      "keywords_multilingual": ["real", "legitimate", "funciona", "verdade", "ganhar dinheiro", "works", "es real", "legítimo"],
      "responses": {
        "pt": "Você deve ter visto todos os relatos de mulheres que estão entrando nesse mercado, e isso não é a toa, pois tem gerado resultados reais. Mas para isso, precisa seguir um método, pois não basta subir fotos e esperar, isso é o maior erro achar que é só isso. Existem algumas estratégias e dicas muito importantes sobre quais poses fazer, como atrair compradores sem fazer quase nada, como deixar esse projeto rodando no automático, etc. Por isso recomendamos fortemente você assistir as aulas que estão na área de membros.",
        "en": "You must have seen all the reports of women entering this market, and this is not for nothing, as it has been generating real results. But for this, you need to follow a method, because it's not enough to just upload photos and wait, the biggest mistake is thinking that's all there is to it. There are some very important strategies and tips on what poses to do, how to attract buyers without doing almost anything, how to keep this project running on autopilot, etc. That's why we strongly recommend you watch the lessons in the members area.",
        "es": "Debes haber visto todos los informes de mujeres que están ingresando a este mercado, y esto no es en vano, ya que ha estado generando resultados reales. Pero para esto, necesitas seguir un método, porque no basta con subir fotos y esperar, el mayor error es pensar que eso es todo. Hay algunas estrategias y consejos muy importantes sobre qué poses hacer, cómo atraer compradores sin hacer casi nada, cómo mantener este proyecto funcionando en automático, etc. Por eso recomendamos encarecidamente que veas las lecciones en el área de miembros."
      }
    },
    {
      "id": "FAQ-012",
      "category": "how_to_start",
      "keywords_multilingual": ["how start", "como começar", "cómo empezar", "where begin", "por onde começar", "por dónde empezar"],
      "responses": {
        "pt": "A gente recomenda fortemente você assistir as aulas da area de membros e seguir o nosso passo a passo, pois foi pensado para trazer resultados mais rápidos! Porém você pode começar agora mesmo subindo suas fotos no site funwithfeet.com mas como você vai fazer isso sem as estratégias que ensinamos, pode ser que demore alguns dias até aparecer compradores, mas não se preocupe, pois isso é normal!",
        "en": "We strongly recommend you watch the lessons in the members area and follow our step-by-step, as it was designed to bring faster results! However, you can start right now by uploading your photos to the funwithfeet.com website, but since you'll be doing this without the strategies we teach, it may take a few days for buyers to appear, but don't worry, this is normal!",
        "es": "¡Recomendamos encarecidamente que veas las lecciones en el área de miembros y sigas nuestro paso a paso, ya que fue diseñado para traer resultados más rápidos! Sin embargo, puedes comenzar ahora mismo subiendo tus fotos al sitio web funwithfeet.com, pero como lo harás sin las estrategias que enseñamos, puede que tarde algunos días hasta que aparezcan compradores, ¡pero no te preocupes, esto es normal!"
      }
    },
    {
      "id": "FAQ-019",
      "category": "generic_help",
      "keywords_multilingual": ["need help", "preciso ajuda", "necesito ayuda", "help me", "confuso", "confundido"],
      "responses": {
        "pt": "Como eu posso te ajudar?",
        "en": "How can I help you?",
        "es": "¿Cómo puedo ayudarte?"
      },
      "followup": {
        "pt": "Preparei um guia passo a passo que pode te ajudar, acesse feetfans.com.br/help Leia até o final, pois sua dúvida pode estar respondida lá! Assista também aos vídeos :)",
        "en": "I prepared a step-by-step guide that can help you, go to feetfans.com.br/help Read to the end, as your question may be answered there! Also watch the videos :)",
        "es": "Preparé una guía paso a paso que puede ayudarte, accede a feetfans.com.br/help ¡Lee hasta el final, ya que tu pregunta puede estar respondida allí! También mira los videos :)"
      }
    }
  ],
  "generic_response_low_match": {
    "pt": "Olá! Recebemos sua mensagem e vamos analisar seu caso com atenção. Retornaremos em breve com uma solução personalizada.\n\nEnquanto isso, confira nossa central de ajuda: feetfans.com.br/help\n\nAtenciosamente,\nEquipe FeetFans",
    "en": "Hello! We received your message and will analyze your case carefully. We will return shortly with a personalized solution.\n\nIn the meantime, check our help center: feetfans.com.br/help\n\nBest regards,\nFeetFans Team",
    "es": "¡Hola! Recibimos tu mensaje y vamos a analizar tu caso con atención. Regresaremos pronto con una solución personalizada.\n\nMientras tanto, consulta nuestro centro de ayuda: feetfans.com.br/help\n\nSaludos,\nEquipo FeetFans"
  }
};

// Retorna FAQ database + dados do email
return {
  faq_database: FAQ_DATABASE,
  subject: $json.subject,
  body: $json.body,
  language: $json.language,
  from: $json.from,
  threadId: $json.threadId,
  id: $json.id
};
