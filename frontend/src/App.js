// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link, Outlet } from 'react-router-dom';
// --- ЗМІНА ТУТ: імпортуємо replenishContainer ---
import { getSummaryReport, replenishContainer } from './services/api';
import LoginPage from './pages/LoginPage';
import ScannerPage from './pages/ScannerPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import UserManagementPage from './pages/UserManagementPage';
import ReportsPage from './pages/ReportsPage';
import PrintPage from './pages/PrintPage';
import './App.css';
import { jwtDecode } from 'jwt-decode';
import { Button, Box, IconButton, Badge, Menu, MenuItem, Typography, Tooltip, AppBar, Toolbar, CssBaseline } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Layout = ({ user, onLogout }) => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const fetchLowStockData = async () => {
        if (user.role === 'ADMINISTRATOR') {
            try {
                const response = await getSummaryReport();
                setLowStockItems(response.data.low_stock_items);
            } catch (error) {
                console.error("Не вдалося завантажити сповіщення", error);
            }
        }
    };
    
    useEffect(() => {
        fetchLowStockData();
        const interval = setInterval(fetchLowStockData, 300000); 
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.role]);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // --- ЗМІНА ТУТ: Повністю нова логіка для handleNotificationClick ---
    const handleNotificationClick = async (item) => {
        handleMenuClose(); // Закриваємо меню
        const quantityStr = prompt(`Введіть кількість для поповнення "${item.name}" (поточний залишок: ${item.current_quantity.toFixed(2)})`);
        
        if (quantityStr) {
            const quantity = parseFloat(quantityStr);
            if (!isNaN(quantity) && quantity > 0) {
                try {
                    await replenishContainer(item.id, quantity);
                    // Перезавантажуємо сторінку, щоб оновити всі дані - і лічильник, і залишки
                    window.location.reload();
                } catch (error) {
                    alert('Помилка поповнення.');
                    console.error("Помилка поповнення:", error);
                }
            } else {
                alert('Будь ласка, введіть коректне додатне число.');
            }
        }
    };

    const open = Boolean(anchorEl);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
            <CssBaseline />
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Inventory App
                    </Typography>
                    <nav>
                        {user.role === 'ADMINISTRATOR' && (
                            <>
                                <Button component={Link} to="/" color="inherit">Огляд складу</Button>
                                <Button component={Link} to="/history" color="inherit">Історія</Button>
                                <Button component={Link} to="/users" color="inherit">Користувачі</Button>
                                <Button component={Link} to="/reports" color="inherit">Звіти</Button>
                                <Button component={Link} to="/print" color="inherit">Друк QR</Button>
                            </>
                        )}
                    </nav>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">Користувач: <strong>{user.username}</strong></Typography>
                        {user.role === 'ADMINISTRATOR' && (
                            <>
                                <Tooltip title="Сповіщення про низький залишок">
                                    <IconButton color="inherit" onClick={handleMenuOpen}>
                                        <Badge badgeContent={lowStockItems.length} color="error">
                                            <NotificationsIcon />
                                        </Badge>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleMenuClose}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <Typography sx={{ p: 2, pt: 1, fontWeight: 'bold' }}>Низький залишок</Typography>
                                    {lowStockItems.length > 0 ? (
                                        lowStockItems.map(item => (
                                            <MenuItem key={item.id} onClick={() => handleNotificationClick(item)}>
                                                {item.name} в "{item.cabinet.name}" ({item.current_quantity.toFixed(2)} / {item.low_stock_threshold})
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>Немає позицій з низьким залишком</MenuItem>
                                    )}
                                </Menu>
                            </>
                        )}
                        <Button onClick={onLogout} variant="outlined" size="small">Вийти</Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }} id="print-area">
                <Outlet />
            </Box>
        </Box>
    );
};

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
      const token = localStorage.getItem('accessToken');
      if (token) {
          try {
              const decodedUser = jwtDecode(token);
              if (decodedUser.exp * 1000 > Date.now()) {
                setUser({ id: decodedUser.user_id, username: decodedUser.username, role: decodedUser.role });
              } else {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
              }
          } catch (error) {
              console.error("Недійсний токен:", error);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
          }
      }
  }, []);
  
  const handleLoginSuccess = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
          const decodedUser = jwtDecode(token);
          setUser({ id: decodedUser.user_id, username: decodedUser.username, role: decodedUser.role });
          navigate('/');
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      navigate('/login');
  };

  return (
      <Routes>
          {!user ? (
              <>
                  <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                  <Route path="*" element={<Navigate to="/login" />} />
              </>
          ) : (
              <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
                  {user.role === 'ADMINISTRATOR' ? (
                      <>
                          <Route index element={<DashboardPage />} />
                          <Route path="history" element={<HistoryPage />} />
                          <Route path="users" element={<UserManagementPage />} />
                          <Route path="reports" element={<ReportsPage />} />
                          <Route path="print" element={<PrintPage />} />
                      </>
                  ) : (
                      <Route index element={<ScannerPage />} />
                  )}
                  <Route path="*" element={<Navigate to="/" />} />
              </Route>
          )}
      </Routes>
  );
}

export default App;