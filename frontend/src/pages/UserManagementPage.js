// frontend/src/pages/UserManagementPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import {
    Box, Button, Typography, Paper, Checkbox, FormControlLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Стан для модального вікна
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentUser, setCurrentUser] = useState({ username: '', password: '', role: 'OPERATOR', is_staff: false });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (error) { console.error("Не вдалося завантажити користувачів", error); }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenDialog = (user = null) => {
        if (user) {
            setIsEditMode(true);
            setCurrentUser({ ...user, password: '' }); // Пароль не передаємо для редагування
        } else {
            setIsEditMode(false);
            setCurrentUser({ username: '', password: '', role: 'OPERATOR', is_staff: false });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => setDialogOpen(false);

    const handleSave = async () => {
        const data = { ...currentUser };
        // Не відправляємо порожній пароль при редагуванні, щоб він не змінився
        if (isEditMode && !data.password) {
            delete data.password;
        } else if (!isEditMode && !data.password) {
            alert('Пароль є обов\'язковим для нового користувача.');
            return;
        }

        try {
            if (isEditMode) {
                await updateUser(data.id, data);
            } else {
                await createUser(data);
            }
            fetchUsers();
            handleCloseDialog();
        } catch (error) {
            console.error("Помилка збереження користувача", error);
            alert("Помилка збереження. Можливо, такий логін вже існує.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
            try {
                await deleteUser(id);
                fetchUsers();
            } catch (error) { console.error("Помилка видалення", error); }
        }
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setCurrentUser(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    return (
        <Paper sx={{ padding: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Керування користувачами</Typography>
                <Button variant="contained" onClick={() => handleOpenDialog()}>Створити користувача</Button>
            </Box>
            
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                            <TableCell>Логін</TableCell>
                            <TableCell>Роль</TableCell>
                            <TableCell>Адміністратор (is_staff)</TableCell>
                            <TableCell align="right">Дії</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.is_staff ? 'Так' : 'Ні'}</TableCell>
                                <TableCell align="right">
                                    <Button size="small" onClick={() => handleOpenDialog(user)}>Редагувати</Button>
                                    <Button size="small" color="error" onClick={() => handleDelete(user.id)}>Видалити</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>{isEditMode ? 'Редагувати користувача' : 'Створити нового користувача'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" name="username" label="Логін" type="text" fullWidth variant="standard" value={currentUser.username} onChange={handleChange} />
                    <TextField margin="dense" name="password" label={isEditMode ? "Новий пароль (не змінювати)" : "Пароль"} type="password" fullWidth variant="standard" value={currentUser.password} onChange={handleChange} />
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel>Роль</InputLabel>
                        <Select name="role" value={currentUser.role} onChange={handleChange}>
                            <MenuItem value={'OPERATOR'}>Оператор</MenuItem>
                            <MenuItem value={'ADMINISTRATOR'}>Адміністратор</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={<Checkbox name="is_staff" checked={currentUser.is_staff} onChange={handleChange} />}
                        label="Права адміністратора (is_staff)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Скасувати</Button>
                    <Button onClick={handleSave}>Зберегти</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default UserManagementPage;