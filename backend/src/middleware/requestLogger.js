/**
 * Middleware para logar o tempo de resposta das requisições.
 * Ajuda a identificar gargalos de performance e queries lentas.
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Quando a resposta terminar de ser enviada
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    // Log formatado: [METODO] /url - Status - Tempo ms
    const logMessage = `[${method}] ${originalUrl} - ${statusCode} - ${duration}ms`;
    
    // Se demorar mais de 200ms, destacar como lento
    if (duration > 200) {
      console.warn(`\u26a0\ufe0f  LENTO: ${logMessage}`);
    } else {
      console.log(`\u2705 ${logMessage}`);
    }
  });

  next();
}

module.exports = { requestLogger };
