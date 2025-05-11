/**
 * Chat Flotante con IA - Archivo JavaScript
 * Este archivo contiene toda la lógica para el funcionamiento del chat flotante
 * que se puede integrar con cualquier API de IA mediante AJAX.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configuración de la API
    const API_URL = 'https://api.ejemplo.com/chat'; // Reemplazar con la URL real de la API
    const API_KEY = 'tu-clave-api'; // Reemplazar con tu clave API real
    
    // Elementos DOM
    const chatButton = document.querySelector('.chat-button');
    const chatContainer = document.querySelector('.chat-container');
    const chatClose = document.querySelector('.chat-close');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatTyping = document.getElementById('chatTyping');
    
    // Variables de estado (en memoria)
    let chatVisible = false;
    
    // ===== FUNCIONES PRINCIPALES =====
    
    // Inicialización
    function init() {
        bindEvents();
    }
    
    // Vincular eventos
    function bindEvents() {
        // Abrir/cerrar chat
        chatButton.addEventListener('click', toggleChat);
        chatClose.addEventListener('click', toggleChat);
        
        // Enviar mensaje
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Mostrar/ocultar chat
    function toggleChat() {
        chatVisible = !chatVisible;
        
        if (chatVisible) {
            chatContainer.classList.add('active');
            chatInput.focus();
            scrollToBottom();
        } else {
            chatContainer.classList.remove('active');
        }
    }
    
    // Enviar mensaje
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Añadir mensaje del usuario al chat
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Mostrar indicador de escritura
        showTyping(true);
        
        // Llamar a la API
        callChatAPI(message);
    }
    
    // ===== FUNCIONES DE COMUNICACIÓN CON API =====
    
    // Llamar a la API de chat usando AJAX
    function callChatAPI(message) {
        // Configuración para la petición AJAX
        const xhr = new XMLHttpRequest();
        
        // Para usar Fetch API en lugar de XMLHttpRequest (más moderno)
        // descomenta el código fetch y comenta esta sección
        
        // Versión con XMLHttpRequest
        try {
            xhr.open('POST', API_URL, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', `Bearer ${API_KEY}`);
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    showTyping(false);
                    
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            addMessage(response.message || response.response || "No se recibió respuesta", 'bot');
                        } catch (e) {
                            console.error('Error al procesar la respuesta:', e);
                            addMessage('Error al procesar la respuesta del servidor', 'bot');
                        }
                    } else {
                        console.error('Error en la petición:', xhr.status);
                        addMessage('Error de comunicación con el servidor', 'bot');
                    }
                }
            };
            
            // Simulación temporal (eliminar en producción)
            // xhr.send(JSON.stringify({ message: message }));
            
            // En lugar de enviar la petición real, simular una respuesta
            simulateResponse(message);
            
        } catch (error) {
            console.error('Error al realizar la petición:', error);
            showTyping(false);
            addMessage('Error de comunicación', 'bot');
        }
        
        /* Versión con Fetch API (más moderna)
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            showTyping(false);
            addMessage(data.message || data.response, 'bot');
        })
        .catch(error => {
            console.error('Error:', error);
            showTyping(false);
            addMessage('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.', 'bot');
        });
        */
    }
    
    // Función temporal para simular respuestas del bot (eliminar en producción)
    function simulateResponse(message) {
        setTimeout(() => {
            const botResponse = getBotResponse(message);
            showTyping(false);
            addMessage(botResponse, 'bot');
        }, 1000 + Math.random() * 1000); // Retraso aleatorio entre 1-2 segundos
    }
    
    // Respuestas simuladas (reemplazar con respuestas reales de la API)
    function getBotResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('hola') || lowerMsg.includes('saludos') || lowerMsg.includes('buenos días') || lowerMsg.includes('buenas tardes') || lowerMsg.includes('buenas noches')) {
            return '¡Hola! ¿En qué puedo ayudarte hoy?';
        } else if (lowerMsg.includes('ayuda') || lowerMsg.includes('necesito ayuda')) {
            return 'Estoy aquí para ayudarte. Puedes preguntarme sobre servicios, información del sitio, o cualquier duda que tengas.';
        } else if (lowerMsg.includes('gracias') || lowerMsg.includes('te agradezco')) {
            return '¡De nada! Estoy aquí para lo que necesites.';
        } else if (lowerMsg.includes('adiós') || lowerMsg.includes('hasta luego') || lowerMsg.includes('chao')) {
            return 'Hasta pronto. Si necesitas algo más, estaré aquí para ayudarte.';
        } else if (lowerMsg.includes('qué') && (lowerMsg.includes('hacer') || lowerMsg.includes('haces'))) {
            return 'Puedo responder preguntas, proporcionar información sobre servicios, y ayudarte con cualquier duda que tengas sobre este sitio.';
        } else if (lowerMsg.includes('nombre')) {
            return 'Soy un asistente virtual. Puedes llamarme como prefieras.';
        } else if (lowerMsg.includes('contacto') || lowerMsg.includes('teléfono') || lowerMsg.includes('email') || lowerMsg.includes('correo')) {
            return 'Para contacto directo, por favor visita nuestra sección de contacto en el sitio web o escribe a info@ejemplo.com';
        } else if (lowerMsg.includes('precio') || lowerMsg.includes('costo') || lowerMsg.includes('tarifa')) {
            return 'Los precios varían según el servicio. ¿Hay algún servicio específico por el que quieras preguntar?';
        } else if (lowerMsg.includes('ubicación') || lowerMsg.includes('dirección') || lowerMsg.includes('dónde')) {
            return 'Estamos ubicados en Av. Ejemplo 123, Ciudad Ejemplo. Puedes encontrar un mapa en la sección de contacto.';
        } else if (lowerMsg.includes('problema') || lowerMsg.includes('error') || lowerMsg.includes('no funciona')) {
            return 'Lamento escuchar eso. ¿Podrías proporcionar más detalles sobre el problema que estás experimentando?';
        } else {
            return 'Entiendo tu mensaje. Para obtener una respuesta más precisa, pronto me conectaré a una API de IA real.';
        }
    }
    
    // ===== FUNCIONES AUXILIARES =====
    
    // Añadir mensaje al chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Mostrar/ocultar indicador de escritura
    function showTyping(show) {
        chatTyping.style.display = show ? 'block' : 'none';
        if (show) {
            scrollToBottom();
        }
    }
    
    // Desplazar al final del chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Iniciar widget
    init();
});
