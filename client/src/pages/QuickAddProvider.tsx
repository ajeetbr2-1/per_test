import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack, CheckCircle, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { providerService, QuickAddData } from '../services/providerService';

const QuickAddProvider: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [providerId, setProviderId] = useState('');
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<QuickAddData>({
    name: '',
    phone: '',
    serviceCategory: '',
    hourlyRate: 100,
    pincode: '',
    serviceRadius: 5
  });

  const [errors, setErrors] = useState<Partial<QuickAddData>>({});

  const categories = [
    'plumbing', 'electrical', 'cleaning', 'gardening', 
    'painting', 'carpentry', 'appliance_repair', 'other'
  ];

  const steps = [
    'Basic Information',
    'Service Details',
    'Success'
  ];

  const validateForm = () => {
    const newErrors: Partial<QuickAddData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (formData.phone.length < 10) newErrors.phone = 'Phone must be at least 10 digits';
    if (!formData.serviceCategory) newErrors.serviceCategory = 'Service category is required';
    if (formData.hourlyRate < 50) newErrors.hourlyRate = 'Hourly rate must be at least ₹50';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (formData.pincode.length !== 6) newErrors.pincode = 'Pincode must be 6 digits';
    if (formData.serviceRadius < 1) newErrors.serviceRadius = 'Service radius must be at least 1 km';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 0) {
      // Validate basic info
      const basicErrors: Partial<QuickAddData> = {};
      if (!formData.name.trim()) basicErrors.name = 'Name is required';
      if (!formData.phone.trim()) basicErrors.phone = 'Phone is required';
      if (formData.phone.length < 10) basicErrors.phone = 'Phone must be at least 10 digits';
      
      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        return;
      }
    }
    
    if (step === 1) {
      // Validate service details and submit
      if (validateForm()) {
        handleSubmit();
      }
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await providerService.createQuickAddProvider(formData);
      setProviderId(response.providerId);
      setStep(2);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create provider profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/provider-onboarding', { 
      state: { 
        isUpgrade: true, 
        providerId,
        fromQuickAdd: true 
      } 
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={!!errors.phone}
                helperText={errors.phone}
                required
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                error={!!errors.pincode}
                helperText={errors.pincode}
                required
                inputProps={{ maxLength: 6 }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Service Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.serviceCategory} required>
                <InputLabel>Service Category</InputLabel>
                <Select
                  value={formData.serviceCategory}
                  onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {t(`categories.${category}`)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.serviceCategory && (
                  <Typography color="error" variant="caption">
                    {errors.serviceCategory}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hourly Rate (₹)"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                error={!!errors.hourlyRate}
                helperText={errors.hourlyRate}
                required
                InputProps={{ inputProps: { min: 50, max: 5000 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Radius (km)"
                type="number"
                value={formData.serviceRadius}
                onChange={(e) => setFormData({ ...formData, serviceRadius: Number(e.target.value) })}
                error={!!errors.serviceRadius}
                helperText={errors.serviceRadius}
                required
                InputProps={{ inputProps: { min: 1, max: 50 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info">
                You can add more services and update your profile after completing this quick setup.
              </Alert>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box textAlign="center">
            <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Profile Created Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Your provider profile has been created. You can now start receiving booking requests.
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('onboarding.upgradePrompt')}
              </Typography>
              <Typography variant="body2">
                Complete full verification to get:
                <br />• Aadhaar Verified badge
                <br />• Higher booking priority
                <br />• Access to premium features
                <br />• Customer trust and more bookings
              </Typography>
            </Alert>
            
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                startIcon={<TrendingUp />}
                onClick={() => setUpgradeDialog(true)}
                size="large"
              >
                Upgrade to Verified Provider
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/provider-dashboard')}
                size="large"
              >
                Go to Dashboard
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
          {t('onboarding.quickAdd')}
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form Card */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          {step < 2 && (
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                onClick={handleBack}
                disabled={step === 0}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? 'Creating...' : step === 1 ? 'Create Profile' : 'Next'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={upgradeDialog} onClose={() => setUpgradeDialog(false)}>
        <DialogTitle>Upgrade to Verified Provider</DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            Ready to become a verified provider? This will take you through a more detailed onboarding process including:
          </Typography>
          <Typography component="ul" variant="body2">
            <li>Personal information verification</li>
            <li>Aadhaar e-KYC</li>
            <li>Experience and portfolio details</li>
            <li>Service area and pricing setup</li>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialog(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} variant="contained">
            Start Verification
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuickAddProvider;