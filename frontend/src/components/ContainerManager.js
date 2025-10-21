// frontend/src/components/ContainerManager.js

import React, { useState } from 'react';
import { createContainer, updateContainer, deleteContainer, replenishContainer, getQrCodeImage } from '../services/api';
import {
    Box, TextField, Button, Typography, IconButton, Paper, Tooltip, LinearProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const FillLevelIndicator = ({ current, initial }) => {
    const value = (initial > 0) ? (current / initial) * 100 : 0;
    let color = 'primary';
    if (value <= 20) color = 'error';
    else if (value <= 50) color = 'warning';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={value} color={color} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(value)}%`}</Typography>
            </Box>
        </Box>
    );
};

const ContainerManager = ({ cabinetId, containers, onDataRefresh }) => {
    const [newName, setNewName] = useState('');
    const [newUnit, setNewUnit] = useState('');
    const [newInitialQuantity, setNewInitialQuantity] = useState('');
    const [newCurrentQuantity, setNewCurrentQuantity] = useState('');
    const [newThreshold, setNewThreshold] = useState('');
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});

    const handleCreate = async () => {
        if (!newName || !newUnit || !newInitialQuantity || newCurrentQuantity === '') {
            alert('Назва, одиниця, макс. та поточна кількість є обов\'язковими');
            return;
        }
        const data = {
            cabinet: cabinetId, name: newName, unit: newUnit,
            initial_quantity: parseFloat(newInitialQuantity),
            current_quantity: parseFloat(newCurrentQuantity),
            low_stock_threshold: parseFloat(newThreshold || 0),
        };
        try {
            await createContainer(data);
            setNewName(''); setNewUnit(''); setNewInitialQuantity(''); setNewCurrentQuantity(''); setNewThreshold('');
            onDataRefresh();
        } catch (error) { console.error("Помилка створення ємності:", error); }
    };

    const handleEdit = (container) => {
        setEditId(container.id);
        setEditData({ ...container });
    };

    const handleCancelEdit = () => setEditId(null);

    const handleSave = async (id) => {
        try {
            await updateContainer(id, editData);
            setEditId(null);
            onDataRefresh();
        } catch (error) { console.error("Помилка оновлення:", error); }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Ви впевнені, що хочете видалити цю ємність?')) {
            try {
                await deleteContainer(id);
                onDataRefresh();
            } catch (error) { console.error("Помилка видалення:", error); }
        }
    };

    const handleReplenish = async (container) => {
        const quantityStr = prompt(`Введіть кількість для поповнення "${container.name}" (поточний залишок: ${container.current_quantity.toFixed(2)})`);
        if (quantityStr) {
            const quantity = parseFloat(quantityStr);
            if (!isNaN(quantity) && quantity > 0) {
                try {
                    await replenishContainer(container.id, quantity);
                    onDataRefresh();
                } catch (error) { console.error("Помилка поповнення:", error); }
            } else { alert('Будь ласка, введіть коректне додатне число.'); }
        }
    };

    const handleOpenQr = async (containerId) => {
        const qrUrl = await getQrCodeImage(containerId);
        if (qrUrl) {
            window.open(qrUrl, '_blank');
        } else {
            alert('Не вдалося завантажити QR-код. Перевірте консоль на наявність помилок.');
        }
    };
    
    return (
        <Box>
            <Typography variant="subtitle1" sx={{mb: 1}}>Додати ємність у цю шафу</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 1, mb: 2, alignItems: 'center' }}>
                <TextField label="Назва матеріалу" size="small" value={newName} onChange={e => setNewName(e.target.value)} />
                <TextField label="Одиниця (мл, г)" size="small" value={newUnit} onChange={e => setNewUnit(e.target.value)} />
                <TextField label="Макс. кількість" type="number" size="small" value={newInitialQuantity} onChange={e => setNewInitialQuantity(e.target.value)} />
                <TextField label="Поточна кількість" type="number" size="small" value={newCurrentQuantity} onChange={e => setNewCurrentQuantity(e.target.value)} />
                <TextField label="Поріг" type="number" size="small" value={newThreshold} onChange={e => setNewThreshold(e.target.value)} />
                <Button variant="contained" onClick={handleCreate} sx={{height: '40px'}}>Додати</Button>
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                            <TableCell>Назва</TableCell>
                            <TableCell>Кількість</TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Наповнення</TableCell>
                            <TableCell>QR-код</TableCell>
                            <TableCell align="right">Дії</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {containers.map(c => (
                            <TableRow key={c.id} sx={ c.current_quantity <= c.low_stock_threshold ? { backgroundColor: 'rgba(255, 0, 0, 0.08)' } : {} }>
                                {editId === c.id ? (
                                    <>
                                        <TableCell><TextField size="small" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /></TableCell>
                                        <TableCell><TextField size="small" type="number" value={editData.current_quantity} onChange={e => setEditData({...editData, current_quantity: e.target.value})} /></TableCell>
                                        <TableCell>--</TableCell>
                                        <TableCell>--</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Зберегти"><IconButton onClick={() => handleSave(c.id)}><SaveIcon /></IconButton></Tooltip>
                                            <Tooltip title="Скасувати"><IconButton onClick={handleCancelEdit}><CancelIcon /></IconButton></Tooltip>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>{c.name}</TableCell>
                                        <TableCell>{c.current_quantity.toFixed(2)} {c.unit}</TableCell>
                                        <TableCell>
                                            <FillLevelIndicator current={c.current_quantity} initial={c.initial_quantity} />
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" onClick={() => handleOpenQr(c.id)}>
                                                Відкрити
                                            </Button>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Поповнити"><IconButton color="success" onClick={() => handleReplenish(c)}><AddCircleOutlineIcon /></IconButton></Tooltip>
                                            <Tooltip title="Редагувати"><IconButton onClick={() => handleEdit(c)}><EditIcon /></IconButton></Tooltip>
                                            <Tooltip title="Видалити"><IconButton onClick={() => handleDelete(c.id)}><DeleteIcon /></IconButton></Tooltip>
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ContainerManager;