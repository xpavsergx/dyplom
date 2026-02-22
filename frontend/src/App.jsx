import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, TextField, Button, Typography, Card, CardContent, 
  CircularProgress, Alert, Grid, Box, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, 
  AppBar, Toolbar, CssBaseline, Chip, Stack, Link, Autocomplete, MenuItem, Select, FormControl, InputLabel, Tooltip
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import LogoutIcon from '@mui/icons-material/Logout';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FlightIcon from '@mui/icons-material/Flight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Розширена база аеропортів з групуванням по країнах
const AIRPORTS = [
  { label: 'Warszawa Chopina (WAW)', code: 'WAW', country: '🇵🇱 Polska' },
  { label: 'Warszawa Modlin (WMI)', code: 'WMI', country: '🇵🇱 Polska' },
  { label: 'Kraków (KRK)', code: 'KRK', country: '🇵🇱 Polska' },
  { label: 'Gdańsk (GDN)', code: 'GDN', country: '🇵🇱 Polska' },
  { label: 'Wrocław (WRO)', code: 'WRO', country: '🇵🇱 Polska' },
  { label: 'Poznań (POZ)', code: 'POZ', country: '🇵🇱 Polska' },
  { label: 'Katowice (KTW)', code: 'KTW', country: '🇵🇱 Polska' },
  
  { label: 'Londyn Heathrow (LHR)', code: 'LHR', country: '🇬🇧 Wielka Brytania' },
  { label: 'Londyn Stansted (STN)', code: 'STN', country: '🇬🇧 Wielka Brytania' },
  { label: 'Londyn Luton (LTN)', code: 'LTN', country: '🇬🇧 Wielka Brytania' },
  
  { label: 'Paryż CDG (CDG)', code: 'CDG', country: '🇫🇷 Francja' },
  { label: 'Paryż Beauvais (BVA)', code: 'BVA', country: '🇫🇷 Francja' },
  { label: 'Paryż Orly (ORY)', code: 'ORY', country: '🇫🇷 Francja' },
  
  { label: 'Rzym Fiumicino (FCO)', code: 'FCO', country: '🇮🇹 Włochy' },
  { label: 'Mediolan Bergamo (BGY)', code: 'BGY', country: '🇮🇹 Włochy' },
  { label: 'Mediolan Malpensa (MXP)', code: 'MXP', country: '🇮🇹 Włochy' },
  { label: 'Neapol (NAP)', code: 'NAP', country: '🇮🇹 Włochy' },
  
  { label: 'Madryt (MAD)', code: 'MAD', country: '🇪🇸 Hiszpania' },
  { label: 'Barcelona (BCN)', code: 'BCN', country: '🇪🇸 Hiszpania' },
  { label: 'Alicante (ALC)', code: 'ALC', country: '🇪🇸 Hiszpania' },
  { label: 'Teneryfa Południe (TFS)', code: 'TFS', country: '🇪🇸 Hiszpania' },
  
  { label: 'Berlin (BER)', code: 'BER', country: '🇩🇪 Niemcy' },
  { label: 'Frankfurt (FRA)', code: 'FRA', country: '🇩🇪 Niemcy' },
  { label: 'Monachium (MUC)', code: 'MUC', country: '🇩🇪 Niemcy' },
  
  { label: 'Nowy Jork (JFK)', code: 'JFK', country: '🇺🇸 USA' },
  { label: 'Los Angeles (LAX)', code: 'LAX', country: '🇺🇸 USA' },
  { label: 'Chicago (ORD)', code: 'ORD', country: '🇺🇸 USA' },
  
  { label: 'Dubaj (DXB)', code: 'DXB', country: '🇦🇪 ZEA' },
  { label: 'Abu Zabi (AUH)', code: 'AUH', country: '🇦🇪 ZEA' }
];

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4F46E5', light: '#818CF8', dark: '#3730A3' }, 
    secondary: { main: '#10B981', light: '#34D399', dark: '#059669' }, 
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { 
      styleOverrides: { 
        root: { 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid #F1F5F9'
        } 
      } 
    },
    MuiButton: {
      styleOverrides: {
        root: { padding: '10px 24px', boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' } }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    }
  },
});

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(0,0,0,0.05)',
  color: theme.palette.text.primary,
}));

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [origin, setOrigin] = useState(AIRPORTS[0]);
  const [destination, setDestination] = useState(AIRPORTS[14]);
  const [date, setDate] = useState('2026-05-20');
  const [flexibility, setFlexibility] = useState(0);
  const [customTargetPrice, setCustomTargetPrice] = useState('');
  
  const [trackedRoutes, setTrackedRoutes] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchTrackedRoutes();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setTrackedRoutes([]);
    }
  }, [token]);

  const handleAuth = async () => {
    setError(null); setLoading(true);
    try {
      if (isLoginView) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        const res = await axios.post('http://127.0.0.1:8000/token', formData);
        localStorage.setItem('token', res.data.access_token);
        setToken(res.data.access_token);
      } else {
        await axios.post('http://127.0.0.1:8000/register', { email, password });
        setIsLoginView(true);
        setError("Konto utworzone! Zaloguj się.");
      }
    } catch (e) {
      setError(isLoginView ? "Błędne dane logowania." : "Błąd rejestracji.");
    } finally { setLoading(false); }
  };

  const logout = () => { localStorage.removeItem('token'); setToken(null); setSearchResult(null); };

  const fetchTrackedRoutes = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/routes/');
      setTrackedRoutes(res.data);
    } catch (e) { console.error("Error fetching routes"); }
  };

  const getAirportCode = (port) => typeof port === 'object' && port !== null ? port.code : port;

  const handleSearch = async () => {
    setLoading(true); setError(null); setSearchResult(null);
    try {
      const originCode = getAirportCode(origin);
      const destCode = getAirportCode(destination);
      
      let datesToSearch = [date];
      if (flexibility > 0) {
        datesToSearch = [];
        for (let i = -flexibility; i <= flexibility; i++) {
          let d = new Date(date);
          d.setDate(d.getDate() + i);
          datesToSearch.push(d.toISOString().split('T')[0]);
        }
      }

      const promises = datesToSearch.map(async (d) => {
        try {
          const res = await axios.get('http://127.0.0.1:8000/check-price/', { 
            params: { origin: originCode, destination: destCode, date: d } 
          });
          if (res.data.status === 'success') {
            return { ...res.data.data, searchedDate: d };
          }
          return null;
        } catch (e) { return null; }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter(r => r !== null);

      if (validResults.length === 0) {
        setError("Nie znaleziono lotów w wybranym terminie. Spróbuj zmienić datę.");
      } else {
        validResults.sort((a, b) => new Date(a.searchedDate) - new Date(b.searchedDate));
        const bestFlight = [...validResults].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0];
        
        setSearchResult({
          best: bestFlight,
          allOptions: validResults,
          originCode,
          destCode
        });
        setCustomTargetPrice(bestFlight.price);
      }
    } catch (e) { setError("Wystąpił błąd podczas komunikacji z serwerem Amadeus."); }
    finally { setLoading(false); }
  };

  const handleTrack = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/routes/', {
        origin: searchResult.originCode, 
        destination: searchResult.destCode, 
        departure_date: searchResult.best.searchedDate, 
        target_price: parseFloat(customTargetPrice),
        check_interval: 6
      });
      setSearchResult(null);
      fetchTrackedRoutes();
      setTabValue(1); 
    } catch (e) { setError("Błąd dodawania do obserwowanych."); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Na pewno chcesz przestać śledzić ten lot?")) return;
    try { await axios.delete(`http://127.0.0.1:8000/routes/${id}`); fetchTrackedRoutes(); setSelectedHistory(null); } catch (e) { }
  };

  const fetchHistory = async (route) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/routes/${route.id}/history`);
      setSelectedHistory(res.data.map(h => ({
        price: h.price,
        time: new Date(h.timestamp).toLocaleDateString('pl-PL') + ' ' + new Date(h.timestamp).toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})
      })));
      setSelectedRoute(route);
    } catch (e) { alert("Brak historii dla tego lotu."); }
  };

  const minPrice = selectedHistory && selectedHistory.length > 0 
    ? Math.min(...selectedHistory.map(h => h.price)) 
    : null;

  const getGoogleFlightsUrl = (origin, dest, date) => {
    return `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${dest}%20on%20${date}`;
  };

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="xs" sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ p: 5, bgcolor: 'white', borderRadius: 4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', width: '100%', textAlign: 'center' }}>
            <Box sx={{ m: 1, background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)', p: 2, borderRadius: '50%', display: 'inline-flex', color: 'white', mb: 2 }}>
              <FlightTakeoffIcon fontSize="large" />
            </Box>
            <Typography component="h1" variant="h4" sx={{ mb: 1, color: '#0F172A' }}>
              FlightMonitor
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, color: '#64748B' }}>
              Inteligentne śledzenie cen biletów lotniczych
            </Typography>
            
            {error && <Alert severity={error.includes("utworzone") ? "success" : "error"} sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            
            <TextField variant="outlined" margin="normal" required fullWidth label="Adres Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField variant="outlined" margin="normal" required fullWidth label="Hasło" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            
            <Button fullWidth variant="contained" size="large" sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1.1rem' }} onClick={handleAuth} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit"/> : (isLoginView ? "Zaloguj się" : "Rozpocznij za darmo")}
            </Button>
            <Link component="button" underline="hover" variant="body2" sx={{ color: '#4F46E5', fontWeight: 600 }} onClick={() => { setIsLoginView(!isLoginView); setError(null); }}>
              {isLoginView ? "Nie masz konta? Zarejestruj się" : "Masz już konto? Zaloguj się"}
            </Link>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlassAppBar position="sticky" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: '70px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: {xs: 1, md: 0}, mr: 4 }}>
              <Box sx={{ background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)', p: 1, borderRadius: 2, mr: 1.5, display: 'flex' }}>
                <FlightTakeoffIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h5" noWrap sx={{ color: '#0F172A', letterSpacing: '-0.5px' }}>
                FlightMonitor
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => setTabValue(0)} 
                startIcon={<SearchIcon />} 
                sx={{ 
                  color: tabValue === 0 ? 'primary.main' : 'text.secondary',
                  bgcolor: tabValue === 0 ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                }}
              >
                Wyszukiwarka
              </Button>
              <Button 
                onClick={() => setTabValue(1)} 
                startIcon={<AnalyticsIcon />} 
                sx={{ 
                  color: tabValue === 1 ? 'primary.main' : 'text.secondary',
                  bgcolor: tabValue === 1 ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                }}
              >
                Moje loty
              </Button>
            </Box>
            <Button color="inherit" sx={{ color: '#64748B' }} size="small" startIcon={<LogoutIcon />} onClick={logout}>Wyloguj</Button>
          </Toolbar>
        </Container>
      </GlassAppBar>

      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}
        
        {tabValue === 0 ? (
           <Box>
              <Box textAlign="center" mb={6}>
                <Typography variant="h4" color="#0F172A" mb={1}>Odkryj świat w najlepszej cenie</Typography>
                <Typography variant="h6" color="text.secondary" fontWeight="400">Porównuj daty, śledź spadki cen i kupuj bilety bez przepłacania.</Typography>
              </Box>

              <Grid container spacing={0} justifyContent="center">
                <Grid item xs={12}>
                   <Card sx={{ p: {xs: 2, md: 4}, overflow: 'visible' }}>
                     {/* Змінено Grid розмітку: xs=12 (мобільні), md=6 (ноутбуки), lg=3 (великі монітори) */}
                     <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6} lg={3}>
                          <Autocomplete
                            options={AIRPORTS}
                            groupBy={(option) => option.country}
                            getOptionLabel={(option) => option.label || ""}
                            isOptionEqualToValue={(option, value) => option.code === value?.code}
                            value={origin}
                            onChange={(e, v) => setOrigin(v)}
                            slotProps={{
                              paper: { sx: { minWidth: 320, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } }
                            }}
                            renderInput={(params) => <TextField {...params} label="Miejsce wylotu" variant="outlined" />}
                            renderOption={(props, option) => (
                              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                                <FlightIcon sx={{ mr: 1.5, color: '#94A3B8', fontSize: 20, flexShrink: 0 }} />
                                <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}>
                                  {option.label}
                                </Typography>
                              </Box>
                            )}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6} lg={3}>
                          <Autocomplete
                            options={AIRPORTS}
                            groupBy={(option) => option.country}
                            getOptionLabel={(option) => option.label || ""}
                            isOptionEqualToValue={(option, value) => option.code === value?.code}
                            value={destination}
                            onChange={(e, v) => setDestination(v)}
                            slotProps={{
                              paper: { sx: { minWidth: 320, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } }
                            }}
                            renderInput={(params) => <TextField {...params} label="Miejsce przylotu" />}
                            renderOption={(props, option) => (
                              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                                <FlightIcon sx={{ mr: 1.5, color: '#94A3B8', fontSize: 20, transform: 'rotate(90deg)', flexShrink: 0 }} />
                                <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}>
                                  {option.label}
                                </Typography>
                              </Box>
                            )}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6} lg={3}>
                          <TextField fullWidth type="date" label="Data wyjazdu" InputLabelProps={{shrink:true}} value={date} onChange={e=>setDate(e.target.value)}/>
                        </Grid>
                        
                        <Grid item xs={12} md={6} lg={3}>
                          <FormControl fullWidth>
                            <InputLabel>Elastyczność dat</InputLabel>
                            <Select value={flexibility} label="Elastyczność dat" onChange={e => setFlexibility(e.target.value)}>
                              <MenuItem value={0}>Tylko dokładna data</MenuItem>
                              <MenuItem value={1}>+/- 1 dzień (3 dni)</MenuItem>
                              <MenuItem value={2}>+/- 2 dni (5 dni)</MenuItem>
                              <MenuItem value={3}>+/- 3 dni (Tydzień)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Button 
                            fullWidth 
                            variant="contained" 
                            size="large" 
                            onClick={handleSearch} 
                            disabled={loading}
                            sx={{ py: 1.8, fontSize: '1.1rem', mt: 2 }}
                            startIcon={!loading && <SearchIcon />}
                          >
                            {loading ? <CircularProgress size={24} color="inherit"/> : "Szukaj najlepszych opcji"}
                          </Button>
                        </Grid>
                     </Grid>
                   </Card>
                   
                   {/* ... (Нижче йде код карток і графіків, він залишається без змін) ... */}
                   {searchResult && (
                      <Box mt={5} animation="fadeIn 0.5s">
                        <Card sx={{ bgcolor: 'secondary.main', color: 'white', border: 'none', mb: 4 }}>
                          <CardContent sx={{ p: 4 }}>
                             <Grid container alignItems="center" spacing={3}>
                               <Grid item xs={12} md={8}>
                                 <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5 }}>🔥 NAJTAŃSZA ZNALEZIONA OPCJA</Typography>
                                 <Typography variant="h4" fontWeight="bold" mt={1}>
                                   {searchResult.best.searchedDate}
                                 </Typography>
                                 <Typography variant="h6" mt={1} sx={{ opacity: 0.9 }}>
                                   Linia lotnicza: {searchResult.best.airline}
                                 </Typography>
                               </Grid>
                               <Grid item xs={12} md={4} textAlign={{xs: 'left', md: 'right'}}>
                                 <Typography variant="h2" fontWeight="800">
                                   {searchResult.best.price} <Typography component="span" variant="h4">{searchResult.best.currency}</Typography>
                                 </Typography>
                               </Grid>
                             </Grid>
                             
                             <Box mt={4} p={3} bgcolor="rgba(255,255,255,0.15)" borderRadius={3} display="flex" gap={2} alignItems="center" flexWrap="wrap">
                                <Typography variant="body1" fontWeight="bold">Chcesz poczekać na tańsze bilety?</Typography>
                                <TextField 
                                  type="number" 
                                  size="small" 
                                  value={customTargetPrice} 
                                  onChange={e=>setCustomTargetPrice(e.target.value)}
                                  sx={{ bgcolor: 'white', borderRadius: 1, width: '150px' }}
                                />
                                <Button variant="contained" sx={{ bgcolor: '#0F172A', '&:hover': {bgcolor: '#1E293B'} }} onClick={handleTrack} startIcon={<AddAlertIcon/>}>
                                  Rozpocznij monitoring
                                </Button>
                             </Box>
                          </CardContent>
                        </Card>

                        {searchResult.allOptions.length > 1 && (
                          <Box>
                            <Typography variant="h5" color="#0F172A" mb={3} display="flex" alignItems="center" gap={1}>
                              <CalendarMonthIcon color="primary" /> Analiza cen w pobliskich dniach
                            </Typography>
                            
                            <Grid container spacing={2}>
                              {searchResult.allOptions.map((option, idx) => {
                                const isBest = option === searchResult.best;
                                return (
                                  <Grid item xs={12} sm={6} md={4} key={idx}>
                                    <Card sx={{ 
                                      height: '100%', 
                                      border: isBest ? '2px solid #10B981' : '1px solid #E2E8F0',
                                      bgcolor: isBest ? '#F0FDF4' : 'white',
                                      transition: 'transform 0.2s',
                                      '&:hover': { transform: 'translateY(-4px)' }
                                    }}>
                                      <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary" mb={1}>Data wylotu</Typography>
                                        <Typography variant="h6" fontWeight="bold" color="#0F172A" mb={2}>{option.searchedDate}</Typography>
                                        
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                          <Chip label={option.airline} size="small" sx={{ bgcolor: '#E2E8F0', fontWeight: 'bold' }} />
                                          <Typography variant="h6" color={isBest ? 'secondary.dark' : 'primary.main'} fontWeight="bold">
                                            {option.price} PLN
                                          </Typography>
                                        </Stack>
                                        
                                        <Button 
                                          fullWidth 
                                          variant={isBest ? "contained" : "outlined"}
                                          color={isBest ? "secondary" : "primary"}
                                          endIcon={<OpenInNewIcon />}
                                          href={getGoogleFlightsUrl(searchResult.originCode, searchResult.destCode, option.searchedDate)}
                                          target="_blank"
                                        >
                                          Sprawdź w Google
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                )
                              })}
                            </Grid>
                          </Box>
                        )}
                      </Box>
                   )}
                </Grid>
              </Grid>
           </Box>
        ) : (
           <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" color="#0F172A">Obserwowane loty</Typography>
                <Button startIcon={<RefreshIcon />} onClick={fetchTrackedRoutes} variant="outlined" color="primary">Odśwież dane</Button>
              </Stack>
              
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 4, mb: 4, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>KIERUNEK</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>DATA WYLOTU</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>OCZEKIWANA CENA</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#64748B' }}>ZARZĄDZAJ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trackedRoutes.length === 0 ? (
                      <TableRow><TableCell colSpan={4} align="center" sx={{py: 8}}><Typography variant="h6" color="text.secondary">Nie śledzisz jeszcze żadnych lotów.</Typography></TableCell></TableRow>
                    ) : (
                      trackedRoutes.map(r => (
                        <TableRow key={r.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ fontSize: '1.05rem', fontWeight: 500 }}>
                            <FlightTakeoffIcon sx={{ verticalAlign: 'middle', mr:1.5, color: '#4F46E5' }}/> 
                            {r.origin} <Typography component="span" color="text.secondary" mx={1}>➝</Typography> {r.destination}
                          </TableCell>
                          <TableCell><Chip icon={<CalendarMonthIcon/>} label={r.departure_date} variant="outlined" sx={{ borderRadius: 2 }} /></TableCell>
                          <TableCell><Chip label={`${r.target_price} PLN`} sx={{ bgcolor: '#E0E7FF', color: '#3730A3', fontWeight: 'bold' }}/></TableCell>
                          <TableCell align="right">
                            <Tooltip title="Zobacz wykres cen">
                              <IconButton onClick={()=>fetchHistory(r)} sx={{ color: '#10B981', mr: 1, bgcolor: '#F0FDF4' }}><AnalyticsIcon/></IconButton>
                            </Tooltip>
                            <Tooltip title="Usuń z obserwowanych">
                              <IconButton onClick={()=>handleDelete(r.id)} sx={{ color: '#EF4444', bgcolor: '#FEF2F2' }}><DeleteIcon/></IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* ГРАФІК ЦІН */}
              {selectedHistory && selectedRoute && (
                 <Card sx={{p: {xs: 2, md: 4}, mb: 4, position: 'relative', border: '1px solid #E2E8F0' }}>
                    <IconButton sx={{ position: 'absolute', right: 15, top: 15, bgcolor: '#F1F5F9' }} onClick={() => setSelectedHistory(null)}>×</IconButton>
                    
                    <Grid container spacing={2} alignItems="center" mb={4}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h5" color="#0F172A" fontWeight="bold">
                          Historia zmian ceny
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mt={1}>
                          Trasa: <b>{selectedRoute.origin} ➝ {selectedRoute.destination}</b> | Wylot: <b>{selectedRoute.departure_date}</b>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        {minPrice && (
                          <Chip 
                            icon={<TrendingDownIcon />} 
                            label={`Najniższa odnotowana cena: ${minPrice} PLN`} 
                            sx={{ mr: 2, fontWeight: 'bold', bgcolor: '#F0FDF4', color: '#059669', border: '1px solid #A7F3D0' }} 
                          />
                        )}
                        <Button 
                          variant="contained" 
                          color="primary" 
                          endIcon={<OpenInNewIcon />}
                          href={getGoogleFlightsUrl(selectedRoute.origin, selectedRoute.destination, selectedRoute.departure_date)}
                          target="_blank"
                          sx={{ borderRadius: 8 }}
                        >
                          Google Flights
                        </Button>
                      </Grid>
                    </Grid>

                    <Box sx={{ height: 400, width: '100%' }}>
                      <ResponsiveContainer>
                        <LineChart data={selectedHistory} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="time" stroke="#94A3B8" tick={{fontSize: 12}} tickMargin={10} />
                          <YAxis stroke="#94A3B8" domain={['auto', 'auto']} tickFormatter={(value) => `${value} zł`} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`${value} PLN`, 'Cena']}
                          />
                          
                          <ReferenceLine 
                            y={selectedRoute.target_price} 
                            label={{ position: 'top', value: 'Twój cel', fill: '#10B981', fontSize: 13, fontWeight: 'bold' }} 
                            stroke="#10B981" 
                            strokeDasharray="5 5" 
                            strokeWidth={2}
                          />
                          
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="url(#colorUv)" 
                            strokeWidth={4} 
                            dot={{ r: 5, fill: '#4F46E5', strokeWidth: 2, stroke: 'white' }} 
                            activeDot={{ r: 8, fill: '#4F46E5', strokeWidth: 0 }} 
                            name="Cena" 
                          />
                          <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#4F46E5" />
                              <stop offset="100%" stopColor="#818CF8" />
                            </linearGradient>
                          </defs>
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                 </Card>
              )}
           </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;