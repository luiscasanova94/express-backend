# Implementación del Sistema de Límite de Créditos

## Resumen de Cambios

Se ha implementado un sistema completo de límite de créditos para controlar el uso de la API de Data Axle. Los cambios incluyen:

### 1. Frontend (.env)
**Archivo requerido:** `frontend/.env`
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_DATA_AXLE_API_TOKEN=your_data_axle_token_here
VITE_DATA_AXLE_API_BASE_URL=https://api.dataaxle.com

# Credits Configuration
VITE_CREDITS_LIMIT=1000
```

### 2. Vista de Statistics
**Archivo modificado:** `frontend/src/views/statistics-view.ts`
- Se agregó la visualización del límite de créditos al lado del título
- Se muestra el límite obtenido desde las variables de entorno

### 3. Servicio de Statistics
**Archivo modificado:** `frontend/src/services/statistics.service.ts`
- Se agregó el campo `creditsLimit` a la interfaz `StatisticsResponse`
- Se incluye el límite de créditos en la respuesta del servicio

### 4. Nuevo Servicio de Créditos
**Archivo creado:** `frontend/src/services/credits.service.ts`
- Servicio para verificar créditos disponibles antes de hacer búsquedas
- Endpoint `/check-credits` para validar disponibilidad

### 5. Backend - Controlador de Historial
**Archivo modificado:** `backend/controllers/searchHistoryController.js`
- Función `checkCreditsAvailable()` para verificar créditos disponibles
- Validación de créditos antes de crear entradas en el historial
- Nuevo endpoint `POST /check-credits` para verificar créditos
- Respuesta de error detallada cuando no hay créditos suficientes

### 6. Backend - Servidor
**Archivo modificado:** `backend/server.js`
- Se agregó la ruta `POST /check-credits` para verificar créditos

### 7. Servicio de Historial de Búsquedas
**Archivo modificado:** `frontend/src/services/search-history.service.ts`
- Manejo específico de errores de créditos insuficientes
- Mensajes de error detallados para el usuario

### 8. Vista Principal (Home)
**Archivo modificado:** `frontend/src/views/home-view.ts`
- Verificación de créditos antes de ejecutar búsquedas
- Prevención de llamadas a Data Axle cuando no hay créditos disponibles
- Integración del modal de alerta de créditos insuficientes

### 9. Modal de Alerta de Créditos
**Archivo creado:** `frontend/src/components/credits-alert-modal.ts`
- Modal personalizado que se muestra cuando se alcanza el límite de créditos
- Muestra información detallada sobre créditos usados, disponibles y límite total
- Botones para cerrar el modal o navegar a la vista de estadísticas

## Variables de Entorno Requeridas

### Frontend (.env)
```env
VITE_CREDITS_LIMIT=1000  # Límite de créditos por usuario
```

### Backend (.env)
```env
CREDITS_LIMIT=1000  # Límite de créditos por usuario (opcional, usa 1000 por defecto)
```

## Flujo de Verificación de Créditos

1. **Antes de la búsqueda:** El frontend verifica créditos disponibles usando `creditsService.checkCredits()`
2. **Si no hay créditos:** Se muestra un modal de alerta con información detallada y opciones para el usuario
3. **Si hay créditos:** Se hace la llamada a Data Axle normalmente
4. **Al guardar resultados:** El backend verifica nuevamente los créditos antes de guardar en el historial
5. **En caso de error:** Se muestra un mensaje detallado al usuario sobre los créditos disponibles

## Endpoints del Backend

### GET /statistics
Obtiene estadísticas de uso incluyendo créditos totales usados.

### POST /check-credits
Verifica si hay créditos disponibles para una búsqueda.
```json
{
  "estimatedCredits": 1
}
```

Respuesta:
```json
{
  "available": true,
  "availableCredits": 999,
  "totalUsed": 1,
  "limit": 1000
}
```

## Manejo de Errores

- **Créditos insuficientes:** Se muestra un modal de alerta elegante con información detallada
- **Error de verificación:** Error 500 con mensaje genérico
- **Frontend:** Modal personalizado que previene búsquedas y ofrece navegación a estadísticas
- **Backend:** Error 400 con detalles de créditos disponibles para validación adicional

## Notas Importantes

1. El límite de créditos se configura en las variables de entorno
2. La verificación se hace tanto en frontend como backend para mayor seguridad
3. Los créditos se calculan basándose en el número de documentos devueltos por Data Axle
4. El sistema previene búsquedas cuando no hay créditos disponibles
5. Se mantiene compatibilidad con el sistema existente
