// frontend/src/pages/ScannerPage.js

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getContainerById, writeOffFromContainer } from '../services/api';
import {
    Box, Typography, Paper, TextField, Button, CircularProgress, Alert
} from '@mui/material';

const ScannerPage = () => {
    const [containerInfo, setContainerInfo] = useState(null);
    const [writeOffAmount, setWriteOffAmount] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [isScannerActive, setIsScannerActive] = useState(true);

    useEffect(() => {
        if (!isScannerActive) return;

        const qrScanner = new Html5QrcodeScanner(
            'reader',
            { qrbox: { width: 250, height: 250 }, fps: 5 },
            false
        );

        const handleSuccess = (decodedText) => {
            qrScanner.clear().catch(console.error);
            setIsScannerActive(false);
            const containerId = decodedText.split('/').pop();
            fetchContainerData(containerId);
        };

        const handleError = (err) => { /* ignore */ };

        qrScanner.render(handleSuccess, handleError);

        return () => {
            if (qrScanner && qrScanner.getState()) {
                qrScanner.clear().catch(error => console.error("Не вдалося очистити сканер.", error));
            }
        };
    }, [isScannerActive]);

    const fetchContainerData = async (id) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await getContainerById(id);
            setContainerInfo(response.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Помилка: Ємність не знайдена або немає доступу.' });
            setContainerInfo(null);
        }
        setLoading(false);
    };

    const handleWriteOff = async (e) => {
        e.preventDefault();
        const amount = parseFloat(writeOffAmount);
        if (!writeOffAmount || amount <= 0) {
            setMessage({ type: 'error', text: 'Введіть коректну кількість для списання.' });
            return;
        }
        setLoading(true);
        try {
            const response = await writeOffFromContainer(containerInfo.id, amount);
            setContainerInfo(response.data);
            setMessage({ type: 'success', text: `Успішно списано ${writeOffAmount}!` });
            setWriteOffAmount('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Помилка списання.' });
        }
        setLoading(false);
    };

    const handleNewScan = () => {
        setContainerInfo(null);
        setMessage({ type: '', text: '' });
        setIsScannerActive(true); // Повторно активуємо сканер
    };

    return (
        <Box sx={{ maxWidth: '500px', margin: 'auto', textAlign: 'center' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Сканування та Списання</Typography>

                {isScannerActive && <Box id="reader" sx={{ mt: 2, mb: 2, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}></Box>}
                
                {loading && <CircularProgress sx={{ my: 2 }} />}
                
                {message.text && (
                    <Alert severity={message.type} sx={{ my: 2 }}>{message.text}</Alert>
                )}

                {containerInfo && (
                    <Box>
                        <Typography variant="h6">Інформація про ємність</Typography>
                        {/* --- ЗМІНЕНО: використовуємо нові поля --- */}
                        <Typography><strong>Матеріал:</strong> {containerInfo.name}</Typography>
                        <Typography><strong>Поточний залишок:</strong> {containerInfo.current_quantity.toFixed(2)} {containerInfo.unit}</Typography>
                        <Typography><strong>Шафа:</strong> {containerInfo.cabinet_name}</Typography>

                        <Box component="form" onSubmit={handleWriteOff} sx={{ display: 'flex', gap: 2, mt: 3 }}>
                            <TextField
                                label="Кількість для списання"
                                type="number"
                                size="small"
                                value={writeOffAmount}
                                onChange={(e) => setWriteOffAmount(e.target.value)}
                                autoFocus
                                fullWidth
                            />
                            <Button type="submit" variant="contained" color="error" disabled={loading}>Списати</Button>
                        </Box>

                        <Button variant="outlined" onClick={handleNewScan} sx={{ mt: 3 }}>
                            Сканувати знову
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ScannerPage;