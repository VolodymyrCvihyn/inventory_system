// frontend/src/pages/DashboardPage.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCabinets, createCabinet, deleteCabinet } from '../services/api';
import ContainerManager from '../components/ContainerManager';
import {
    Typography, Box, TextField, Button, IconButton, Paper, Grid,
    List, ListItem, ListItemButton, ListItemText, Divider, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const DashboardPage = () => {
    const [cabinets, setCabinets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCabinetName, setNewCabinetName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCabinet, setSelectedCabinet] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getCabinets();
            setCabinets(response.data);
            return response.data; // Повертаємо завантажені дані
        } catch (error) {
            console.error("Не вдалося завантажити шафи", error);
            return []; // Повертаємо порожній масив у разі помилки
        } finally {
            setLoading(false);
        }
    }, []);

    // Ефект №1: Завантаження даних та вибір першої шафи
    useEffect(() => {
        fetchAllData().then(fetchedCabinets => {
            if (!selectedCabinet && fetchedCabinets.length > 0) {
                setSelectedCabinet(fetchedCabinets[0]);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Ефект №2: Обробка переходу зі сповіщень
    useEffect(() => {
        const highlightId = location.state?.highlightCabinetId;
        if (highlightId && cabinets.length > 0) {
            const cabinetToSelect = cabinets.find(c => c.id === highlightId);
            if (cabinetToSelect) {
                setSelectedCabinet(cabinetToSelect);
            }
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, cabinets, navigate, location.pathname]);


    const handleCreateCabinet = async () => {
        if (!newCabinetName) return;
        try {
            const response = await createCabinet(newCabinetName, '');
            setNewCabinetName('');
            fetchAllData().then(() => {
                setSelectedCabinet(response.data);
            });
        } catch (error) { console.error("Помилка створення шафи", error); }
    };
    
    const handleDeleteCabinet = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Ви впевнені, що хочете видалити цю шафу?')) {
            try {
                await deleteCabinet(id);
                if (selectedCabinet?.id === id) {
                    setSelectedCabinet(null);
                }
                fetchAllData();
            } catch (error) { console.error("Помилка видалення шафи", error); }
        }
    };
    
    const filteredCabinets = useMemo(() => 
        cabinets.filter(cabinet => 
            cabinet.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [cabinets, searchTerm]);
    
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                        <Typography variant="h6">Шафи та матеріали</Typography>
                        <TextField
                            label="Знайти шафу або матеріал..."
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    </Box>
                    <List sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
                        {loading ? <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress /></Box> :
                        filteredCabinets.map(cabinet => (
                            <ListItem key={cabinet.id} disablePadding secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={(e) => handleDeleteCabinet(cabinet.id, e)}>
                                    <DeleteIcon />
                                </IconButton>
                            }>
                                <ListItemButton
                                    selected={selectedCabinet?.id === cabinet.id}
                                    onClick={() => setSelectedCabinet(cabinet)}
                                >
                                    <ListItemText primary={cabinet.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                    <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField label="Назва нової шафи" size="small" fullWidth value={newCabinetName} onChange={(e) => setNewCabinetName(e.target.value)} />
                            <Button variant="contained" onClick={handleCreateCabinet}>Створити</Button>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} sm={8}>
                {selectedCabinet ? (
                    <ContainerManager
                        key={selectedCabinet.id}
                        cabinetId={selectedCabinet.id}
                        containers={selectedCabinet.containers}
                        onDataRefresh={fetchAllData}
                    />
                ) : (
                    !loading && (
                        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Box>
                                <Typography variant="h6">Шафу не обрано</Typography>
                                <Typography color="text.secondary">Оберіть шафу зі списку зліва або створіть нову.</Typography>
                            </Box>
                        </Paper>
                    )
                )}
            </Grid>
        </Grid>
    );
};

export default DashboardPage;