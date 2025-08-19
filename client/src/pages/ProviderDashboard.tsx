import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Dashboard,
  Notifications,
  AttachMoney,
  Star,
  TrendingUp,
  Schedule,
  Person,
  Settings,
  CheckCircle,
  Cancel,
  LocationOn,
  Phone,
  Refresh
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { bookingService, Booking } from '../services/bookingService';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      id={`provider-tabpanel-${index}`}
      aria-labelledby={`provider-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProviderDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  
  // Mock provider data
  const [providerStats] = useState({
    totalEarnings: 25000,
    completedJobs: 45,
    rating: 4.7,
    responseTime: 12, // minutes
    acceptanceRate: 85,
    isVerified: false,
    isQuickAdd: true
  });

  // Mock analytics data
  const earningsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Earnings (₹)',
      data: [3200, 4100, 3800, 5200, 4800, 5600],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };

  const jobsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Jobs Completed',
      data: [2, 3, 1, 4, 2, 5, 3],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      borderColor: 'rgba(53, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getProviderBookings();
      setBookings(response.bookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (action: 'accept' | 'reject') => {
    if (!selectedBooking) return;

    try {
      const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
      await bookingService.updateBookingStatus(selectedBooking._id, newStatus);
      setActionDialog(false);
      setSelectedBooking(null);
      loadBookings();
      
      if (action === 'accept') {
        alert(`Booking accepted! Customer will be notified. Start OTP: ${selectedBooking.otp.startOTP}`);
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      loadBookings();
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
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

  const pendingRequests = bookings.filter(b => b.status === 'REQUESTED');
  const activeJobs = bookings.filter(b => ['ACCEPTED', 'ON_THE_WAY', 'IN_SERVICE'].includes(b.status));
  const completedJobs = bookings.filter(b => b.status === 'COMPLETED');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Provider Dashboard
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>{isOnline ? 'Online' : 'Offline'}</Typography>
                  <Chip 
                    label={isOnline ? 'Available for bookings' : 'Not accepting bookings'}
                    color={isOnline ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              }
            />
          </Box>
        </Box>
        
        <IconButton onClick={loadBookings} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Quick Add Upgrade Banner */}
      {providerStats.isQuickAdd && !providerStats.isVerified && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => setUpgradeDialog(true)}
            >
              UPGRADE NOW
            </Button>
          }
        >
          <Typography variant="subtitle2">
            {t('onboarding.upgradePrompt')}
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Earnings
                  </Typography>
                  <Typography variant="h4">
                    ₹{providerStats.totalEarnings.toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoney color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Completed Jobs
                  </Typography>
                  <Typography variant="h4">
                    {providerStats.completedJobs}
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Rating
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h4">
                      {providerStats.rating}
                    </Typography>
                    <Star color="warning" />
                  </Box>
                </Box>
                <Star color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Acceptance Rate
                  </Typography>
                  <Typography variant="h4">
                    {providerStats.acceptanceRate}%
                  </Typography>
                </Box>
                <TrendingUp color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={pendingRequests.length} color="error">
                New Requests
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={activeJobs.length} color="primary">
                Active Jobs
              </Badge>
            } 
          />
          <Tab label="Analytics" />
          <Tab label="Profile" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* New Requests */}
        <Typography variant="h6" gutterBottom>
          New Booking Requests
        </Typography>
        
        {pendingRequests.length === 0 ? (
          <Alert severity="info">No new booking requests at the moment.</Alert>
        ) : (
          <List>
            {pendingRequests.map((booking) => (
              <ListItem key={booking._id} divider>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {t(`categories.${booking.service.category}`)}
                      </Typography>
                      <Chip 
                        label={`₹${booking.service.hourlyRate}/hr`} 
                        size="small" 
                        color="primary" 
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        📍 {booking.location.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📅 {new Date(booking.scheduling.preferredDate).toLocaleDateString()}
                        {booking.scheduling.preferredTime && ` at ${booking.scheduling.preferredTime}`}
                      </Typography>
                      <Typography variant="body2">
                        {booking.service.description}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setActionDialog(true);
                      }}
                    >
                      {t('buttons.accept')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => {
                        setSelectedBooking(booking);
                        handleBookingAction('reject');
                      }}
                    >
                      {t('buttons.decline')}
                    </Button>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Active Jobs */}
        <Typography variant="h6" gutterBottom>
          Active Jobs
        </Typography>
        
        {activeJobs.length === 0 ? (
          <Alert severity="info">No active jobs at the moment.</Alert>
        ) : (
          <Grid container spacing={2}>
            {activeJobs.map((booking) => (
              <Grid item xs={12} md={6} key={booking._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6">
                        {t(`categories.${booking.service.category}`)}
                      </Typography>
                      <Chip
                        label={t(`status.${booking.status}`)}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📍 {booking.location.address}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      👤 Customer: {booking.customer}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {booking.status === 'ACCEPTED' && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStatusUpdate(booking._id, 'ON_THE_WAY')}
                        >
                          Mark: On the Way
                        </Button>
                      )}
                      
                      {booking.status === 'ON_THE_WAY' && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStatusUpdate(booking._id, 'IN_SERVICE')}
                        >
                          Start Service
                        </Button>
                      )}
                      
                      {booking.status === 'IN_SERVICE' && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleStatusUpdate(booking._id, 'COMPLETED')}
                        >
                          Complete Job
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Analytics */}
        <Typography variant="h6" gutterBottom>
          Analytics & Insights
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Earnings
                </Typography>
                <Line data={earningsData} options={{ responsive: true }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weekly Jobs
                </Typography>
                <Bar data={jobsData} options={{ responsive: true }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {providerStats.acceptanceRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Acceptance Rate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {providerStats.responseTime}m
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Response Time
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {providerStats.rating}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customer Rating
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        ₹{Math.round(providerStats.totalEarnings / providerStats.completedJobs)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Earning/Job
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Profile */}
        <Typography variant="h6" gutterBottom>
          Profile Settings
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ width: 60, height: 60 }}>P</Avatar>
                  <Box>
                    <Typography variant="h6">Provider Name</Typography>
                    <Typography variant="body2" color="text.secondary">
                      provider@example.com
                    </Typography>
                  </Box>
                </Box>
                <Button variant="outlined" size="small">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Verification Status
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Phone Verified" />
                    <CheckCircle color="success" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Aadhaar Verified" />
                    {providerStats.isVerified ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Button size="small" onClick={() => setUpgradeDialog(true)}>
                        Verify Now
                      </Button>
                    )}
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Background Check" />
                    <Cancel color="error" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Booking Action Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)}>
        <DialogTitle>Accept Booking Request</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to accept this booking?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Service: {t(`categories.${selectedBooking.service.category}`)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Location: {selectedBooking.location.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rate: ₹{selectedBooking.service.hourlyRate}/hour
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleBookingAction('accept')} variant="contained">
            Accept Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialog} onClose={() => setUpgradeDialog(false)}>
        <DialogTitle>Upgrade to Verified Provider</DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            Complete your verification to unlock premium features:
          </Typography>
          <Typography component="ul" variant="body2">
            <li>Aadhaar Verified badge</li>
            <li>Higher priority in search results</li>
            <li>Access to premium customer base</li>
            <li>Higher earning potential</li>
            <li>Customer trust and credibility</li>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialog(false)}>
            Maybe Later
          </Button>
          <Button 
            onClick={() => {
              setUpgradeDialog(false);
              navigate('/provider-onboarding', { 
                state: { 
                  isUpgrade: true,
                  fromQuickAdd: true 
                } 
              });
            }} 
            variant="contained"
          >
            Start Verification
          </Button>
        </DialogActions>
      </Dialog>

      {loading && <LinearProgress />}
    </Container>
  );
};

export default ProviderDashboard;