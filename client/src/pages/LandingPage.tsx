import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Switch,
  FormControlLabel,
  AppBar,
  Toolbar,
  Rating,
  Badge,
  Fab
} from '@mui/material';
import {
  Search,
  Mic,
  FilterList,
  LocationOn,
  Star,
  Verified,
  Language,
  Add
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { providerService, Provider, ProviderSearchParams } from '../services/providerService';

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: 'online',
    minRating: 0,
    maxPrice: 1000,
    aadhaarVerified: false,
    sortBy: 'smart' as 'smart' | 'rating' | 'price'
  });
  const [isListening, setIsListening] = useState(false);
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  
  const recognitionRef = useRef<any>(null);

  // Voice Search Setup
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        handleSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [i18n.language]);

  const handleVoiceSearch = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSearch = async (searchValue?: string) => {
    const query = searchValue || searchTerm;
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchParams: ProviderSearchParams = {
        pincode: query,
        category: filters.category || undefined,
        status: filters.status,
        minRating: filters.minRating,
        maxPrice: filters.maxPrice,
        aadhaarVerified: filters.aadhaarVerified || undefined,
        sortBy: filters.sortBy
      };

      const results = await providerService.searchProviders(searchParams);
      setProviders(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setLanguageAnchor(null);
  };

  const handleBookProvider = (provider: Provider) => {
    // Store selected provider and navigate to booking
    localStorage.setItem('selectedProvider', JSON.stringify(provider));
    navigate('/customer-dashboard');
  };

  const categories = [
    'plumbing', 'electrical', 'cleaning', 'gardening', 
    'painting', 'carpentry', 'appliance_repair', 'other'
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('welcome')}
          </Typography>
          
          {/* Language Switcher */}
          <IconButton
            color="inherit"
            onClick={(e) => setLanguageAnchor(e.currentTarget)}
          >
            <Language />
          </IconButton>
          <Menu
            anchorEl={languageAnchor}
            open={Boolean(languageAnchor)}
            onClose={() => setLanguageAnchor(null)}
          >
            <MenuItem onClick={() => handleLanguageChange('en')}>English</MenuItem>
            <MenuItem onClick={() => handleLanguageChange('hi')}>हिंदी</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t('findServices')}
          </Typography>
          
          {/* Search Bar */}
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <LocationOn color="action" />,
              }}
            />
            <IconButton 
              color="primary" 
              onClick={handleVoiceSearch}
              disabled={isListening}
              sx={{ 
                bgcolor: isListening ? 'error.main' : 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: isListening ? 'error.dark' : 'primary.dark' }
              }}
            >
              <Mic />
            </IconButton>
            <Button
              variant="contained"
              onClick={() => handleSearch()}
              startIcon={<Search />}
              disabled={loading}
            >
              {t('buttons.search')}
            </Button>
          </Box>

          {isListening && (
            <Typography color="error" variant="body2">
              {t('voiceSearch')} - Listening...
            </Typography>
          )}
        </Box>

        {/* Category Chips */}
        <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center" mb={4}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={t(`categories.${category}`)}
              onClick={() => {
                setFilters({ ...filters, category: category === filters.category ? '' : category });
                if (searchTerm) handleSearch();
              }}
              color={filters.category === category ? 'primary' : 'default'}
              variant={filters.category === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {/* Filters */}
        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            startIcon={<FilterList />}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            variant="outlined"
          >
            {t('buttons.filter')}
          </Button>
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
            PaperProps={{ sx: { width: 300, p: 2 } }}
          >
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="online">{t('filters.freeNow')}</MenuItem>
                <MenuItem value="">{t('filters.all')}</MenuItem>
              </Select>
            </FormControl>

            <Typography gutterBottom>Price Range (₹/hour)</Typography>
            <Slider
              value={filters.maxPrice}
              onChange={(_, value) => setFilters({ ...filters, maxPrice: value as number })}
              min={100}
              max={2000}
              step={50}
              valueLabelDisplay="auto"
              marks={[
                { value: 100, label: '₹100' },
                { value: 2000, label: '₹2000' }
              ]}
            />

            <Typography gutterBottom>Minimum Rating</Typography>
            <Slider
              value={filters.minRating}
              onChange={(_, value) => setFilters({ ...filters, minRating: value as number })}
              min={0}
              max={5}
              step={0.5}
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0' },
                { value: 4, label: '4.0+' },
                { value: 5, label: '5' }
              ]}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={filters.aadhaarVerified}
                  onChange={(e) => setFilters({ ...filters, aadhaarVerified: e.target.checked })}
                />
              }
              label={t('filters.aadhaarVerified')}
            />

            <Box mt={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setFilterAnchor(null);
                  if (searchTerm) handleSearch();
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Menu>
        </Box>

        {/* Providers List */}
        {providers.length > 0 && (
          <Grid container spacing={3}>
            {providers.map((provider) => (
              <Grid item xs={12} sm={6} md={4} key={provider._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" component="h3">
                        {provider.userId.name}
                      </Typography>
                      <Chip
                        label={t(`provider.${provider.status}`)}
                        color={provider.status === 'online' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Rating value={provider.ratings.average} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {t('provider.rating', { 
                          rating: provider.ratings.average.toFixed(1), 
                          count: provider.ratings.count 
                        })}
                      </Typography>
                    </Box>

                    <Typography variant="h6" color="primary" gutterBottom>
                      {t('provider.hourlyRate', { rate: provider.services[0]?.hourlyRate || 0 })}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {t(`categories.${provider.services[0]?.category}`)}
                    </Typography>

                    {/* Trust Badges */}
                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                      {provider.badges.map((badge) => (
                        <Chip
                          key={badge}
                          label={t(`trustBadges.${badge}`)}
                          size="small"
                          variant="outlined"
                          color={badge === 'aadhaar_verified' ? 'success' : 'default'}
                          icon={badge === 'aadhaar_verified' ? <Verified /> : undefined}
                        />
                      ))}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleBookProvider(provider)}
                      disabled={provider.status !== 'online'}
                    >
                      {t('booking.bookNow')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Quick Add Provider FAB */}
        <Fab
          color="secondary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate('/quick-add-provider')}
        >
          <Add />
        </Fab>
      </Container>
    </Box>
  );
};

export default LandingPage;