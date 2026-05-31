export const auditService = {
    async log(logData) {
        try {
            const response = await fetch('/api/auditoria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData),
            });
            if (!response.ok) throw new Error('Falha ao registrar log');
            return await response.json();
        } catch (error) {
            console.error('Erro de auditoria:', error);
        }
    }
};