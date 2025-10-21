// frontend/src/pages/PrintPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { getCabinets } from '../services/api';
import { QRCodeCanvas } from 'qrcode.react'; // Імпортуємо компонент для генерації QR
import {
    Box, Typography, Paper, Select, MenuItem, FormControl, InputLabel, Button,
    ToggleButtonGroup, ToggleButton, CircularProgress
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

// Компонент для одного QR-коду
const QrCodeCard = ({ container, size }) => {
    const sizeMap = {
        small: 64,  // Розміри в пікселях для canvas
        medium: 100,
        large: 150
    };
    const qrSize = sizeMap[size] || sizeMap.medium;

    return (
        <Box 
            sx={{
                border: '1px dashed grey',
                p: 1,
                display: 'inline-flex', // Змінено для кращого рендерингу
                flexDirection: 'column',
                alignItems: 'center',
                breakInside: 'avoid-page'
            }}
        >
            <QRCodeCanvas 
                value={`scan/${container.id}`} // Текст, який зашиваємо в QR
                size={qrSize}
            />
            <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold', textAlign: 'center' }}>
                {container.name}
            </Typography>
        </Box>
    );
};

const PrintPage = () => {
    const [cabinets, setCabinets] = useState([]);
    const [selectedCabinet, setSelectedCabinet] = useState(null);
    const [qrSize, setQrSize] = useState('medium');
    const [loading, setLoading] = useState(true);

    const fetchCabinets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getCabinets();
            setCabinets(response.data);
            if (response.data.length > 0) {
                setSelectedCabinet(response.data[0]);
            }
        } catch (error) {
            console.error("Не вдалося завантажити шафи", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCabinets();
    }, [fetchCabinets]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box 
                className="no-print"
                sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', // Дозволяємо перенос елементів
                    gap: 2, 
                    mb: 3, 
                    alignItems: 'center',
                }}
            >
                <Typography variant="h5" sx={{ mr: 'auto' }}>Друк QR-кодів</Typography>
                <FormControl size="small" sx={{ minWidth: 240 }}>
                    <InputLabel>Оберіть шафу</InputLabel>
                    <Select
                        value={selectedCabinet ? selectedCabinet.id : ''}
                        label="Оберіть шафу"
                        onChange={(e) => {
                            const cab = cabinets.find(c => c.id === e.target.value);
                            setSelectedCabinet(cab);
                        }}
                    >
                        {cabinets.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <ToggleButtonGroup
                    value={qrSize}
                    exclusive
                    onChange={(e, newSize) => setQrSize(newSize || 'medium')}
                    aria-label="qr code size"
                    size="small"
                >
                    <ToggleButton value="small">Маленький</ToggleButton>
                    <ToggleButton value="medium">Середній</ToggleButton>
                    <ToggleButton value="large">Великий</ToggleButton>
                </ToggleButtonGroup>
                <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
                    Друк
                </Button>
            </Box>

            {loading && <CircularProgress />}
            {selectedCabinet && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '16px 8px' // Збільшуємо вертикальний відступ
                    }}
                >
                    {selectedCabinet.containers.map(container => (
                        <QrCodeCard key={container.id} container={container} size={qrSize} />
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default PrintPage;
