// frontend/src/pages/HistoryPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions, getUsers } from '../services/api';
import {
    Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, TableSortLabel,
    Box, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString('uk-UA');
};

const getTransactionChip = (type) => {
    if (type === 'WRITE_OFF') {
        return <Chip label="Списання" color="error" size="small" />;
    }
    if (type === 'REPLENISH') {
        return <Chip label="Поповнення" color="success" size="small" />;
    }
    return <Chip label="Створення" color="primary" size="small" />;
};

const HistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'descending' });
    
    const [filterMaterial, setFilterMaterial] = useState('');
    const [filterUser, setFilterUser] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [transactionsRes, usersRes] = await Promise.all([
                    getTransactions(),
                    getUsers()
                ]);
                setTransactions(transactionsRes.data);
                setUsers(usersRes.data);
            } catch (err) {
                setError('Не вдалося завантажити дані.');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const filteredAndSortedTransactions = useMemo(() => {
        let filteredItems = transactions.filter(t => {
            const materialMatch = t.container_name.toLowerCase().includes(filterMaterial.toLowerCase());
            // Для фільтрації ми використовуємо ID, оскільки t.user - це просто рядок
            const userObject = users.find(u => u.username === t.user);
            const userMatch = !filterUser || (userObject && userObject.id === filterUser);
            return materialMatch && userMatch;
        });

        if (sortConfig !== null) {
            filteredItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredItems;
    }, [transactions, sortConfig, filterMaterial, filterUser, users]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    if (loading) return <Typography>Завантаження історії...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Paper sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom>
                Історія операцій
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="Пошук за матеріалом"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={filterMaterial}
                    onChange={(e) => setFilterMaterial(e.target.value)}
                />
                <FormControl size="small" fullWidth>
                    <InputLabel>Фільтр за користувачем</InputLabel>
                    <Select
                        value={filterUser}
                        label="Фільтр за користувачем"
                        onChange={(e) => setFilterUser(e.target.value)}
                    >
                        <MenuItem value=""><em>Всі користувачі</em></MenuItem>
                        {users.map(user => (
                            <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'timestamp'}
                                    direction={sortConfig.key === 'timestamp' ? (sortConfig.direction === 'ascending' ? 'asc' : 'desc') : 'asc'}
                                    onClick={() => requestSort('timestamp')}
                                >
                                    Час
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Тип</TableCell>
                            <TableCell>Матеріал</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'quantity_change'}
                                    direction={sortConfig.key === 'quantity_change' ? (sortConfig.direction === 'ascending' ? 'asc' : 'desc') : 'asc'}
                                    onClick={() => requestSort('quantity_change')}
                                >
                                    Зміна кількості
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Користувач</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAndSortedTransactions.map(t => (
                            <TableRow key={t.id}>
                                <TableCell>{formatTimestamp(t.timestamp)}</TableCell>
                                <TableCell>{getTransactionChip(t.transaction_type)}</TableCell>
                                <TableCell>{t.container_name}</TableCell>
                                <TableCell sx={{ color: t.quantity_change > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                    {t.quantity_change > 0 ? `+${t.quantity_change}` : t.quantity_change}
                                </TableCell>
                                {/* --- ВИПРАВЛЕННЯ ТУТ --- */}
                                <TableCell>{t.user ? t.user : 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default HistoryPage;