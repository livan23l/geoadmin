/**
 * Chat Flotante con IA - Archivo JavaScript
 * Configurado específicamente para la página de limpieza del jardín
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
        addMessage("¡Hola! Soy tu asistente de limpieza del jardín. ¿En qué puedo ayudarte hoy? Por ejemplo, puedes preguntar sobre horarios de limpieza, equipos disponibles o reportar áreas que necesitan atención.", 'bot');
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
                    content: "Eres un asistente especializado en limpieza y mantenimiento de jardines. " +
                            "Solo responde sobre: horarios de limpieza, equipos de limpieza, " +
                            "reporte de áreas sucias, programación de mantenimiento y productos " +
                            "de limpieza ecológicos. Sé conciso y profesional."
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
    
    // Respuestas locales para gestión de limpieza
    function getBotResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        // Preguntas sobre horarios
        if (lowerMsg.includes('horario') || lowerMsg.includes('cuándo') || lowerMsg.includes('programación')) {
            return 'La limpieza regular se realiza de lunes a viernes de 7:00 a.m. a 3:00 p.m. ¿Necesitas reportar un área específica?';
        }
        
        // Preguntas sobre equipos
        if (lowerMsg.includes('equipo') || lowerMsg.includes('herramienta') || lowerMsg.includes('producto')) {
            return 'Contamos con escobas, recogedores, podadoras, aspiradoras de hojas y productos de limpieza ecológicos.';
        }
        
        // Preguntas sobre reportes
        if (lowerMsg.includes('reportar') || lowerMsg.includes('sucio') || lowerMsg.includes('necesita limpieza')) {
            return 'Para reportar un área que necesita limpieza, describe su ubicación (ej: "Sector Norte cerca del estanque") y la gravedad.';
        }
        
        // Preguntas sobre mantenimiento
        if (lowerMsg.includes('mantenimiento') || lowerMsg.includes('programar')) {
            return 'El mantenimiento profundo se programa los primeros lunes de cada mes. Solicita cambios en la sección de controles.';
        }
        
        // Preguntas generales
        if (lowerMsg.includes('hola') || lowerMsg.includes('buenos días') || lowerMsg.includes('buenas tardes')) {
            return '¡Hola! Soy el asistente de limpieza del jardín. ¿En qué puedo ayudarte hoy?';
        }
        
        if (lowerMsg.includes('gracias')) {
            return '¡De nada! Un jardín limpio es un jardín saludable.';
        }
        
        // Para preguntas no relacionadas
        if (!lowerMsg.match(/limpieza|jardín|mantenimiento|limpio|sucio|barrido|equipo|producto/)) {
            return 'Solo puedo responder preguntas sobre limpieza y mantenimiento del jardín. ¿En qué puedo ayudarte sobre estos temas?';
        }
        
        // Respuesta por defecto
        return 'Para gestionar la limpieza del jardín, puedes: 1) Consultar los horarios, 2) Reportar áreas que necesitan atención, o 3) Solicitar productos de limpieza. ¿Qué necesitas?';
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