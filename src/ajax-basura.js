/**
 * Chat Flotante con IA - Archivo JavaScript
 * Configurado específicamente para la página de gestión de basura del jardín
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
        addMessage("¡Hola! Soy tu asistente de gestión de basura del jardín. ¿En qué puedo ayudarte hoy? Por ejemplo, puedes preguntar sobre el estado de los contenedores, cómo vaciarlos o programar recogidas.", 'bot');
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
                    content: "Eres un asistente especializado en gestión de residuos de jardines. Solo responde sobre: contenedores, niveles de llenado, reciclaje, programación de recogidas y mantenimiento de áreas verdes. Sé conciso."
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
    
    // Respuestas locales para gestión de basura
    function getBotResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('estado') || lowerMsg.includes('nivel') || lowerMsg.includes('lleno')) {
            return 'Los contenedores se muestran en el mapa con colores: verde (vacío), amarillo (medio), rojo (lleno).';
        }
        
        if (lowerMsg.includes('vaciar') || lowerMsg.includes('recoger') || lowerMsg.includes('recogida')) {
            return 'Usa los botones "Vaciar ahora" en cada tarjeta o programa recogidas en la sección de controles.';
        }
        
        if (lowerMsg.includes('dónde') || lowerMsg.includes('ubicación')) {
            return 'Los contenedores están distribuidos por sectores (Norte, Sur, Este, Oeste) como se muestra en el mapa.';
        }
        
        if (lowerMsg.includes('tipo') || lowerMsg.includes('clase')) {
            return 'Contenedores disponibles: orgánicos, plásticos, papel, vidrio, metales, peligrosos y electrónicos.';
        }
        
        if (lowerMsg.includes('hola') || lowerMsg.includes('buenos días')) {
            return '¡Hola! ¿En qué puedo ayudarte con la gestión de basura del jardín?';
        }
        
        if (lowerMsg.includes('gracias')) {
            return '¡De nada! Juntos mantenemos el jardín limpio.';
        }
        
        if (!lowerMsg.match(/basura|contenedor|residuo|reciclaje|jardín|limpieza/)) {
            return 'Solo puedo responder preguntas sobre gestión de basura del jardín. ¿En qué puedo ayudarte sobre los contenedores?';
        }
        
        return 'Consulta el mapa para ver el estado de los contenedores o la lista para más detalles.';
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