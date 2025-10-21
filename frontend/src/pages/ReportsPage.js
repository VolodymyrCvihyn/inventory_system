// frontend/src/pages/ReportsPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { getSummaryReport, getCabinets } from '../services/api';
import * as XLSX from 'xlsx';

import {
    Box, Typography, Paper, Grid, Select, MenuItem, FormControl, InputLabel, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';

const StatCard = ({ title, value, icon }) => (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon}
        <Box>
            <Typography variant="h6">{value}</Typography>
            <Typography color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

const ReportsPage = () => {
    const [report, setReport] = useState(null);
    const [cabinets, setCabinets] = useState([]);
    const [selectedCabinet, setSelectedCabinet] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async (cabinetId) => {
        setLoading(true);
        try {
            const reportRes = await getSummaryReport(cabinetId || null);
            setReport(reportRes.data);
            if (cabinets.length === 0) {
                const cabinetsRes = await getCabinets();
                setCabinets(cabinetsRes.data);
            }
        } catch (error) {
            console.error("Не вдалося завантажити дані звіту", error);
        }
        setLoading(false);
    }, [cabinets.length]);

    useEffect(() => {
        fetchReport(selectedCabinet);
    }, [selectedCabinet, fetchReport]);

    const handleExport = () => {
        if (!report) return;

        const wb = XLSX.utils.book_new();

        const fullInventoryData = report.full_inventory.map(item => ({
            'Шафа': item.cabinet_name,
            'Матеріал': item.name,
            'Поточна кількість': item.current_quantity,
            'Одиниця': item.unit,
            'Поріг': item.low_stock_threshold,
        }));
        const ws_full = XLSX.utils.json_to_sheet(fullInventoryData);
        XLSX.utils.book_append_sheet(wb, ws_full, "Повний звіт");
        
        const summaryData = report.materials_summary.map(item => ({
            'Матеріал': item.name,
            'Загальна кількість': item.total_quantity,
            'Одиниця': item.unit
        }));
        const ws1 = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws1, "Зведення по матеріалах");

        const lowStockData = report.low_stock_items.map(item => ({
            'Матеріал': item.name,
            'Шафа': item.cabinet_name,
            'Поточна кількість': item.current_quantity,
            'Поріг': item.low_stock_threshold,
            'Одиниця': item.unit
        }));
        const ws2 = XLSX.utils.json_to_sheet(lowStockData);
        XLSX.utils.book_append_sheet(wb, ws2, "Низький залишок");

        const cabinetName = selectedCabinet ? cabinets.find(c => c.id === selectedCabinet)?.name : 'увесь_склад';
        XLSX.writeFile(wb, `Zvit_${cabinetName.replace(/[\s/]/g, '_')}.xlsx`);
    };

    if (loading || !report) return <Typography>Завантаження звітів...</Typography>;

    return (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Звіти</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 240 }}>
                        <InputLabel>Фільтр по шафі</InputLabel>
                        <Select
                            value={selectedCabinet}
                            label="Фільтр по шафі"
                            onChange={(e) => setSelectedCabinet(e.target.value)}
                        >
                            <MenuItem value=""><em>Всі шафи</em></MenuItem>
                            {cabinets.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                    >
                        Експорт в Excel
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {report.total_cabinets !== undefined && (
                    <Grid item xs={12} md={6}>
                        <StatCard title="Всього шаф" value={report.total_cabinets} icon={<InventoryIcon fontSize="large" color="primary" />} />
                    </Grid>
                )}
                <Grid item xs={12} md={6}>
                    <StatCard title="Всього ємностей" value={report.total_containers} icon={<AssessmentIcon fontSize="large" color="secondary" />} />
                </Grid>
            </Grid>

            <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Зведення по матеріалах</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead><TableRow><TableCell>Матеріал</TableCell><TableCell>Загальна кількість</TableCell></TableRow></TableHead>
                        <TableBody>
                            {report.materials_summary.map((item, index) => (
                                <TableRow key={index}><TableCell>{item.name}</TableCell><TableCell>{item.total_quantity.toFixed(2)} {item.unit}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            
            <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="error"><WarningAmberIcon sx={{ verticalAlign: 'middle', mr: 1 }}/>Позиції з низьким залишком</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead><TableRow><TableCell>Матеріал</TableCell><TableCell>Шафа</TableCell><TableCell>Поточна кількість</TableCell><TableCell>Поріг</TableCell></TableRow></TableHead>
                        <TableBody>
                            {report.low_stock_items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.cabinet_name}</TableCell>
                                    <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>{item.current_quantity.toFixed(2)} {item.unit}</TableCell>
                                    <TableCell>{item.low_stock_threshold} {item.unit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default ReportsPage;