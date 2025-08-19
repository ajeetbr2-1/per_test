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
  Chip,
  FormControlLabel,
  Checkbox,
  Input,
  Slider,
  Switch,
  Divider
} from '@mui/material';
import { 
  ArrowBack, 
  Upload, 
  CheckCircle, 
  Verified,
  Business,
  PersonPin,
  Build,
  Security
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

interface OnboardingState {
  isUpgrade?: boolean;
  providerId?: string;
  fromQuickAdd?: boolean;
}

const ProviderOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OnboardingState;
  
  // State
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    languages: [] as string[],
    dateOfBirth: ''
  });

  const [serviceDetails, setServiceDetails] = useState({
    businessName: '',
    services: [{
      category: '',
      subcategory: '',
      hourlyRate: 100,
      description: ''
    }],
    serviceArea: {
      pincode: '',
      radius: 5
    },
    availability: {
      monday: { start: '09:00', end: '18:00', available: true },
      tuesday: { start: '09:00', end: '18:00', available: true },
      wednesday: { start: '09:00', end: '18:00', available: true },
      thursday: { start: '09:00', end: '18:00', available: true },
      friday: { start: '09:00', end: '18:00', available: true },
      saturday: { start: '09:00', end: '18:00', available: true },
      sunday: { start: '09:00', end: '18:00', available: false }
    }
  });

  const [experience, setExperience] = useState({
    yearsOfExperience: 1,
    previousWork: '',
    certifications: [] as string[],
    portfolio: [] as File[],
    specialSkills: [] as string[]
  });

  const [verification, setVerification] = useState({
    aadhaarNumber: '',
    aadhaarFile: null as File | null,
    aadhaarPassword: '',
    policeVerification: false,
    backgroundCheck: false,
    agreeToTerms: false
  });

  const categories = [
    'plumbing', 'electrical', 'cleaning', 'gardening', 
    'painting', 'carpentry', 'appliance_repair', 'other'
  ];

  const languageOptions = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati'];
  const skillOptions = [
    'Emergency Services', 'Installation', 'Repair', 'Maintenance', 
    'Consultation', 'Design', 'Quality Assurance', 'Customer Service'
  ];

  const steps = [
    { label: 'Personal Info', icon: <PersonPin /> },
    { label: 'Service Details', icon: <Business /> },
    { label: 'Experience', icon: <Build /> },
    { label: 'Aadhaar e-KYC', icon: <Security /> },
    { label: 'Complete', icon: <CheckCircle /> }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call for onboarding completion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Onboarding completed successfully! You are now a verified provider.');
      navigate('/provider-dashboard');
    } catch (err: any) {
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    setServiceDetails({
      ...serviceDetails,
      services: [...serviceDetails.services, {
        category: '',
        subcategory: '',
        hourlyRate: 100,
        description: ''
      }]
    });
  };

  const removeService = (index: number) => {
    const newServices = serviceDetails.services.filter((_, i) => i !== index);
    setServiceDetails({ ...serviceDetails, services: newServices });
  };

  const updateService = (index: number, field: string, value: any) => {
    const newServices = [...serviceDetails.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServiceDetails({ ...serviceDetails, services: newServices });
  };

  const handleLanguageToggle = (language: string) => {
    const languages = personalInfo.languages.includes(language)
      ? personalInfo.languages.filter(l => l !== language)
      : [...personalInfo.languages, language];
    setPersonalInfo({ ...personalInfo, languages });
  };

  const handleSkillToggle = (skill: string) => {
    const skills = experience.specialSkills.includes(skill)
      ? experience.specialSkills.filter(s => s !== skill)
      : [...experience.specialSkills, skill];
    setExperience({ ...experience, specialSkills: skills });
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('onboarding.personalInfo')}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={personalInfo.dateOfBirth}
                onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={personalInfo.address.street}
                onChange={(e) => setPersonalInfo({ 
                  ...personalInfo, 
                  address: { ...personalInfo.address, street: e.target.value }
                })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={personalInfo.address.city}
                onChange={(e) => setPersonalInfo({ 
                  ...personalInfo, 
                  address: { ...personalInfo.address, city: e.target.value }
                })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={personalInfo.address.state}
                onChange={(e) => setPersonalInfo({ 
                  ...personalInfo, 
                  address: { ...personalInfo.address, state: e.target.value }
                })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pincode"
                value={personalInfo.address.pincode}
                onChange={(e) => setPersonalInfo({ 
                  ...personalInfo, 
                  address: { ...personalInfo.address, pincode: e.target.value }
                })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Languages You Speak
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {languageOptions.map((language) => (
                  <Chip
                    key={language}
                    label={language}
                    onClick={() => handleLanguageToggle(language)}
                    color={personalInfo.languages.includes(language) ? 'primary' : 'default'}
                    variant={personalInfo.languages.includes(language) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('onboarding.serviceDetails')}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Name (Optional)"
                value={serviceDetails.businessName}
                onChange={(e) => setServiceDetails({ ...serviceDetails, businessName: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Services Offered
              </Typography>
              {serviceDetails.services.map((service, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={service.category}
                          onChange={(e) => updateService(index, 'category', e.target.value)}
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {t(`categories.${cat}`)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Subcategory"
                        value={service.subcategory}
                        onChange={(e) => updateService(index, 'subcategory', e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Hourly Rate (₹)"
                        type="number"
                        value={service.hourlyRate}
                        onChange={(e) => updateService(index, 'hourlyRate', Number(e.target.value))}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" height="100%">
                        <Button
                          color="error"
                          onClick={() => removeService(index)}
                          disabled={serviceDetails.services.length === 1}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Card>
              ))}
              
              <Button onClick={addService} variant="outlined">
                Add Another Service
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Area Pincode"
                value={serviceDetails.serviceArea.pincode}
                onChange={(e) => setServiceDetails({
                  ...serviceDetails,
                  serviceArea: { ...serviceDetails.serviceArea, pincode: e.target.value }
                })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Service Radius: {serviceDetails.serviceArea.radius} km</Typography>
              <Slider
                value={serviceDetails.serviceArea.radius}
                onChange={(_, value) => setServiceDetails({
                  ...serviceDetails,
                  serviceArea: { ...serviceDetails.serviceArea, radius: value as number }
                })}
                min={1}
                max={25}
                step={1}
                marks={[
                  { value: 1, label: '1km' },
                  { value: 10, label: '10km' },
                  { value: 25, label: '25km' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('onboarding.experience')}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Years of Experience: {experience.yearsOfExperience}</Typography>
              <Slider
                value={experience.yearsOfExperience}
                onChange={(_, value) => setExperience({ ...experience, yearsOfExperience: value as number })}
                min={0}
                max={20}
                step={1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 20, label: '20+' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Previous Work & Experience"
                multiline
                rows={4}
                value={experience.previousWork}
                onChange={(e) => setExperience({ ...experience, previousWork: e.target.value })}
                placeholder="Describe your previous work experience, notable projects, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Special Skills & Expertise
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {skillOptions.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => handleSkillToggle(skill)}
                    color={experience.specialSkills.includes(skill) ? 'primary' : 'default'}
                    variant={experience.specialSkills.includes(skill) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Portfolio Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                >
                  Upload Portfolio Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setExperience({ ...experience, portfolio: [...experience.portfolio, ...files] });
                    }}
                  />
                </Button>
                {experience.portfolio.length > 0 && (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {experience.portfolio.length} file(s) selected
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Verified color="primary" />
                <Typography variant="h6">
                  {t('onboarding.aadhaarKyc')}
                </Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Complete Aadhaar verification to get the trusted provider badge and priority in search results.
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Aadhaar Number"
                value={verification.aadhaarNumber}
                onChange={(e) => setVerification({ ...verification, aadhaarNumber: e.target.value })}
                inputProps={{ maxLength: 12 }}
                placeholder="XXXX XXXX XXXX"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Aadhaar Document
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVerification({ ...verification, aadhaarFile: file });
                      }
                    }}
                  />
                </Button>
                {verification.aadhaarFile && (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Selected: {verification.aadhaarFile.name}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Aadhaar Password (for e-KYC)"
                type="password"
                value={verification.aadhaarPassword}
                onChange={(e) => setVerification({ ...verification, aadhaarPassword: e.target.value })}
                helperText="This is used for online verification and is not stored"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verification.policeVerification}
                    onChange={(e) => setVerification({ ...verification, policeVerification: e.target.checked })}
                  />
                }
                label="I consent to police verification (optional - increases trust score)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verification.backgroundCheck}
                    onChange={(e) => setVerification({ ...verification, backgroundCheck: e.target.checked })}
                  />
                }
                label="I consent to background check (optional - increases trust score)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verification.agreeToTerms}
                    onChange={(e) => setVerification({ ...verification, agreeToTerms: e.target.checked })}
                    required
                  />
                }
                label="I agree to the Terms & Conditions and Privacy Policy"
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Box textAlign="center">
            <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Verification Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Congratulations! Your provider profile has been verified. You now have access to all premium features and will receive priority in search results.
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                🎉 You've earned these badges:
              </Typography>
              <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                <Chip label="Aadhaar Verified" color="success" icon={<Verified />} />
                <Chip label="Background Checked" color="primary" />
                <Chip label="Experienced Professional" color="secondary" />
              </Box>
            </Alert>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/provider-dashboard')}
            >
              Go to Provider Dashboard
            </Button>
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
          {state?.isUpgrade ? 'Complete Verification' : t('onboarding.fullOnboarding')}
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((stepInfo, index) => (
          <Step key={stepInfo.label}>
            <StepLabel icon={stepInfo.icon}>
              {stepInfo.label}
            </StepLabel>
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
          {step < 4 && (
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
                disabled={loading || (step === 3 && !verification.agreeToTerms)}
              >
                {loading ? 'Processing...' : step === 3 ? 'Complete Verification' : 'Next'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProviderOnboarding;