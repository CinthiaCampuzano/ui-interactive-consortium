export const JOB_DEFINITIONS = [
    {
        id: 'MONTHLY_FEE_GENERATION',
        name: 'Generar Expensas Mensuales',
        description: 'Inicia el proceso de cálculo y generación de las expensas para un consorcio y período específico.',
        jobName: 'MONTHLY_FEE_GENERATION_JOB',
        parameters: [
            { name: 'consortiumIds', label: 'ID del Consorcio', type: 'string', required: true },
            { name: 'periodDate', label: 'Período a generar', type: 'period', required: true, helperText: 'Seleccione el mes a generar.' },
        ],
    },
    {
        id: 'OVERDUE_PAYMENT_REMINDER',
        name: 'Enviar Recordatorios de Pago',
        description: 'Envía notificaciones por email a las unidades con pagos vencidos en uno o más consorcios.',
        jobName: 'OVERDUE_PAYMENT_REMINDER_JOB',
        parameters: [
            { name: 'consortiumIds', label: 'IDs de Consorcios (opcional, separados por coma)', type: 'long[]', required: false, helperText: 'Si se deja en blanco, se ejecuta para todos.' },
            { name: 'daysOverdue', label: 'Días de Vencimiento Mínimos', type: 'int', required: true, helperText: 'Ej: 30 para deudas con 30 o más días de vencidas.' },
        ],
    },
    {
        id: 'CLEANUP_OLD_LOGS',
        name: 'Limpieza de Logs Antiguos',
        description: 'Elimina registros de logs del sistema que sean más antiguos que la cantidad de días especificada.',
        jobName: 'CLEANUP_OLD_LOGS_JOB',
        parameters: [
            { name: 'daysToKeep', label: 'Días de Logs a Conservar', type: 'int', required: true, helperText: 'Se eliminarán los logs más antiguos que esta cantidad de días. Ej: 90' },
        ],
    },
];
