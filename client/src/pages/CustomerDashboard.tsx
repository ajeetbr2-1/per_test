import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack,
  Schedule,
  Payment,
  CheckCircle,
  Cancel,
  Refresh
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { bookingService, Booking, CreateBookingData } from '../services/bookingService';
import { Provider } from '../services/providerService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [otpDialog, setOtpDialog] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    serviceCategory: '',
    description: '',
    address: '',
    pincode: '',
    preferredDate: '',
    preferredTime: '',
    flexibility: 'flexible' as 'strict' | 'flexible',
    estimatedDuration: 1,
    paymentMethod: 'cash' as 'cash' | 'online' | 'card'
  });

  // OTP state
  const [otpForm, setOtpForm] = useState({
    otp: '',
    type: 'start' as 'start' | 'end'
  });

  useEffect(() => {
    // Load selected provider from localStorage
    const providerData = localStorage.getItem('selectedProvider');
    if (providerData) {
      const provider = JSON.parse(providerData);
      setSelectedProvider(provider);
      setBookingForm(prev => ({
        ...prev,
        serviceCategory: provider.services[0]?.category || ''
      }));
    }

    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.bookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedProvider) return;

    try {
      const bookingData: CreateBookingData = {
        providerId: selectedProvider._id,
        serviceCategory: bookingForm.serviceCategory,
        description: bookingForm.description,
        location: {
          address: bookingForm.address,
          pincode: bookingForm.pincode
        },
        scheduling: {
          preferredDate: bookingForm.preferredDate,
          preferredTime: bookingForm.preferredTime,
          flexibility: bookingForm.flexibility
        },
        estimatedDuration: bookingForm.estimatedDuration
      };

      const response = await bookingService.createBooking(bookingData);
      
      // Show success message with OTPs
      alert(`Booking created successfully! Start OTP: ${response.startOTP}, End OTP: ${response.endOTP}`);
      
      setBookingDialog(false);
      loadBookings();
      
      // Clear selected provider
      localStorage.removeItem('selectedProvider');
      setSelectedProvider(null);
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleOTPVerification = async () => {
    if (!currentBooking) return;

    try {
      await bookingService.verifyOTP(currentBooking._id, otpForm.otp, otpForm.type);
      setOtpDialog(false);
      setOtpForm({ otp: '', type: 'start' });
      loadBookings();
      alert('OTP verified successfully!');
    } catch (error) {
      console.error('OTP verification failed:', error);
      alert('Invalid OTP. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'warning';
      case 'ACCEPTED': return 'info';
      case 'ON_THE_WAY': return 'primary';
      case 'IN_SERVICE': return 'secondary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusSteps = () => [
    'REQUESTED',
    'ACCEPTED', 
    'ON_THE_WAY',
    'IN_SERVICE',
    'COMPLETED'
  ];

  const getActiveStep = (status: string) => {
    const steps = getStatusSteps();
    return Math.max(0, steps.indexOf(status));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
          {t('dashboard.myBookings')}
        </Typography>
      </Box>

      {/* Selected Provider Booking */}
      {selectedProvider && (
        <Card sx={{ mb: 4, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Book {selectedProvider.userId.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Rating value={selectedProvider.ratings.average} readOnly size="small" />
              <Typography variant="body2">
                {selectedProvider.ratings.average.toFixed(1)} ({selectedProvider.ratings.count} reviews)
              </Typography>
              <Chip label={`₹${selectedProvider.services[0]?.hourlyRate}/hour`} color="primary" />
            </Box>
            <Button
              variant="contained"
              onClick={() => setBookingDialog(true)}
            >
              {t('booking.bookNow')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Active Bookings" />
          <Tab label="Completed Bookings" />
          <Tab label="All Bookings" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Active Bookings */}
        <Grid container spacing={3}>
          {bookings
            .filter(booking => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status))
            .map((booking) => (
              <Grid item xs={12} key={booking._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="between" alignItems="start" mb={2}>
                      <Typography variant="h6">
                        {booking.provider.userId.name}
                      </Typography>
                      <Chip
                        label={t(`status.${booking.status}`)}
                        color={getStatusColor(booking.status) as any}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t(`categories.${booking.service.category}`)} - {booking.service.description}
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                      📍 {booking.location.address}
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                      📅 {new Date(booking.scheduling.preferredDate).toLocaleDateString()}
                      {booking.scheduling.preferredTime && ` at ${booking.scheduling.preferredTime}`}
                    </Typography>

                    {/* Status Stepper */}
                    <Box mt={2} mb={2}>
                      <Stepper activeStep={getActiveStep(booking.status)} alternativeLabel>
                        {getStatusSteps().map((step) => (
                          <Step key={step}>
                            <StepLabel>{t(`status.${step}`)}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap={1} mt={2}>
                      {booking.status === 'ACCEPTED' && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setCurrentBooking(booking);
                            setOtpForm({ ...otpForm, type: 'start' });
                            setOtpDialog(true);
                          }}
                        >
                          Enter Start OTP
                        </Button>
                      )}
                      
                      {booking.status === 'IN_SERVICE' && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setCurrentBooking(booking);
                            setOtpForm({ ...otpForm, type: 'end' });
                            setOtpDialog(true);
                          }}
                        >
                          Enter End OTP
                        </Button>
                      )}

                      <Button
                        variant="text"
                        startIcon={<Refresh />}
                        onClick={loadBookings}
                      >
                        Refresh
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Completed Bookings */}
        <Grid container spacing={3}>
          {bookings
            .filter(booking => booking.status === 'COMPLETED')
            .map((booking) => (
              <Grid item xs={12} md={6} key={booking._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {booking.provider.userId.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(`categories.${booking.service.category}`)}
                    </Typography>
                    <Typography variant="body2">
                      Completed on {new Date(booking.timeline.completed!).toLocaleDateString()}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Write Review
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* All Bookings */}
        <List>
          {bookings.map((booking) => (
            <ListItem key={booking._id} divider>
              <ListItemText
                primary={`${booking.provider.userId.name} - ${t(`categories.${booking.service.category}`)}`}
                secondary={`${new Date(booking.createdAt).toLocaleDateString()} • ${booking.location.address}`}
              />
              <ListItemSecondaryAction>
                <Chip
                  label={t(`status.${booking.status}`)}
                  color={getStatusColor(booking.status) as any}
                  size="small"
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </TabPanel>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('booking.bookNow')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('booking.selectDateTime')}
                type="datetime-local"
                value={bookingForm.preferredDate}
                onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Description"
                multiline
                rows={3}
                value={bookingForm.description}
                onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('booking.serviceAddress')}
                value={bookingForm.address}
                onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Pincode"
                value={bookingForm.pincode}
                onChange={(e) => setBookingForm({ ...bookingForm, pincode: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('booking.estimatedDuration')}
                type="number"
                value={bookingForm.estimatedDuration}
                onChange={(e) => setBookingForm({ ...bookingForm, estimatedDuration: Number(e.target.value) })}
                InputProps={{ endAdornment: 'hours' }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('booking.paymentMethod')}</InputLabel>
                <Select
                  value={bookingForm.paymentMethod}
                  onChange={(e) => setBookingForm({ ...bookingForm, paymentMethod: e.target.value as any })}
                >
                  <MenuItem value="cash">{t('booking.cash')}</MenuItem>
                  <MenuItem value="online">{t('booking.online')}</MenuItem>
                  <MenuItem value="card">{t('booking.card')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>{t('buttons.cancel')}</Button>
          <Button onClick={handleCreateBooking} variant="contained">
            {t('buttons.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Dialog */}
      <Dialog open={otpDialog} onClose={() => setOtpDialog(false)}>
        <DialogTitle>
          {otpForm.type === 'start' ? 'Enter Start OTP' : 'Enter End OTP'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="OTP"
            value={otpForm.otp}
            onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpDialog(false)}>{t('buttons.cancel')}</Button>
          <Button onClick={handleOTPVerification} variant="contained">
            Verify OTP
          </Button>
        </DialogActions>
      </Dialog>

      {loading && <LinearProgress />}
    </Container>
  );
};

export default CustomerDashboard;