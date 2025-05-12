/**
 * Chat Flotante con IA - Archivo JavaScript
 * Configurado específicamente para la página de evaluación de riesgos del jardín
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configuración de la API (reemplaza con tus credenciales reales)
    const API_URL = 'https://api.openai.com/v1/chat/completions';
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Elementos DOM
    const chatButton = document.querySelector('.chat-button');
    const chatContainer = document.querySelector('.chat-container');
    const chatClose = document.querySelector('.chat-close');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatTyping = document.getElementById('chatTyping');
    
    // Variables de estado
    let chatVisible = false;
    
    // ===== FUNCIONES PRINCIPALES =====
    
    function init() {
        bindEvents();
        addMessage("¡Hola! Soy tu asistente de evaluación de riesgos del jardín. ¿En qué puedo ayudarte hoy? Por ejemplo, puedes preguntar sobre: plagas detectadas, problemas de suelo, riesgos ambientales o cómo reportar nuevos problemas.", 'bot');
    }
    
    function bindEvents() {
        chatButton.addEventListener('click', toggleChat);
        chatClose.addEventListener('click', toggleChat);
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    function toggleChat() {
        chatVisible = !chatVisible;
        chatContainer.classList.toggle('active', chatVisible);
        if (chatVisible) chatInput.focus();
        scrollToBottom();
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        chatInput.value = '';
        showTyping(true);
        
        // Primero intenta con respuestas locales
        const localResponse = getBotResponse(message);
        if (localResponse && !localResponse.includes('Lo siento')) {
            setTimeout(() => {
                addMessage(localResponse, 'bot');
                showTyping(false);
            }, 800);
        } else {
            // Si no hay respuesta local adecuada, usa la API
            callChatAPI(message);
        }
    }
    
    // ===== FUNCIONES DE API =====
    
    function callChatAPI(message) {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "Eres un asistente especializado en identificación y gestión de riesgos en jardines. " +
                            "Solo responde sobre: plagas, enfermedades de plantas, problemas de suelo, " +
                            "riesgos ambientales, condiciones climáticas peligrosas y mantenimiento preventivo. " +
                            "Sé conciso y técnico cuando sea necesario."
                }, {
                    role: "user",
                    content: message
                }],
                temperature: 0.3,
                max_tokens: 150
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const reply = data.choices?.[0]?.message?.content || getBotResponse(message);
            addMessage(reply, 'bot');
        })
        .catch(error => {
            console.error("Error en la API:", error);
            // Si falla la API, usa la respuesta local como respaldo
            addMessage(getBotResponse(message), 'bot');
        })
        .finally(() => {
            showTyping(false);
        });
    }
    
    // Respuestas locales para gestión de riesgos
    function getBotResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        // Preguntas sobre plagas
        if (lowerMsg.includes('plaga') || lowerMsg.includes('insecto') || lowerMsg.includes('pulgón')) {
            return 'Las plagas activas aparecen en rojo en el mapa. Para tratamientos, usa productos ecológicos como jabón potásico o neem.';
        }
        
        // Preguntas sobre enfermedades
        if (lowerMsg.includes('enfermedad') || lowerMsg.includes('hongo') || lowerMsg.includes('oídio')) {
            return 'Las enfermedades comunes son oídio, mildiu y roya. Reporta síntomas en la sección de controles.';
        }
        
        // Preguntas sobre suelo
        if (lowerMsg.includes('suelo') || lowerMsg.includes('tierra') || lowerMsg.includes('nutriente')) {
            return 'Problemas de suelo: compactación (airear), sequía (regar), o falta de nutrientes (abonar).';
        }
        
        // Preguntas sobre reportes
        if (lowerMsg.includes('reportar') || lowerMsg.includes('nuevo') || lowerMsg.includes('problema')) {
            return 'Para reportar un riesgo nuevo: 1) Localízalo en el mapa, 2) Describe el problema, 3) Estima su gravedad.';
        }
        
        // Preguntas sobre riesgo ambiental
        if (lowerMsg.includes('clima') || lowerMsg.includes('lluvia') || lowerMsg.includes('temperatura')) {
            return 'Riesgos climáticos: heladas (proteger plantas), sequía (regar temprano), viento fuerte (tutorar).';
        }
        
        // Preguntas generales
        if (lowerMsg.includes('hola') || lowerMsg.includes('buenos días') || lowerMsg.includes('buenas tardes')) {
            return '¡Hola! Soy el asistente de riesgos del jardín. ¿Qué problema necesitas reportar o consultar?';
        }
        
        if (lowerMsg.includes('gracias')) {
            return '¡De nada! Un jardín bien gestionado es un jardín saludable.';
        }
        
        // Para preguntas no relacionadas
        if (!lowerMsg.match(/riesgo|plaga|enfermedad|suelo|clima|jardín|problema|reportar/)) {
            return 'Solo puedo responder sobre evaluación y gestión de riesgos en el jardín. ¿En qué puedo ayudarte sobre estos temas?';
        }
        
        // Respuesta por defecto
        return 'Consulta el mapa de riesgos o la lista de problemas activos. ¿Necesitas ayuda con algo específico?';
    }
    
    // ===== FUNCIONES AUXILIARES =====
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function showTyping(show) {
        chatTyping.style.display = show ? 'block' : 'none';
        if (show) scrollToBottom();
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Iniciar el chat
    init();
});