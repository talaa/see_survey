require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const authMiddleware = require('./middleware/authMiddleware');
const sequelize = require('./config/database');

// Enable CORS for both development and production
app.use(cors({
  origin: [
    'http://localhost',
    'http://localhost:5173', // Development
    'https://see-survey-bmgy.vercel.app',
    'http://localhost:8000',
    "http://10.129.10.227",
    'http://localhost:8001'
  ],
  credentials: true
}));

// Body parsing middleware - handle different content types
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ type: 'text/plain', limit: '50mb' }));

// Custom middleware to parse JSON from text/plain if needed
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'text/plain' && req.body) {
    try {
      // Try to parse the body as JSON if it's a string
      if (typeof req.body === 'string') {
        const parsed = JSON.parse(req.body);
        req.body = parsed;
      }
    } catch (error) {
      // If parsing fails, leave the body as is
      console.warn('Failed to parse text/plain body as JSON:', error.message);
    }
  }
  next();
});

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/mw_antennas', express.static(path.join(__dirname, 'uploads/mw_antennas')));
app.use('/uploads/site_images', express.static(path.join(__dirname, 'uploads/site_images')));
app.use('/uploads/transmission_mw', express.static(path.join(__dirname, 'uploads/transmission_mw')));

// Routes
const siteLocationRoutes = require('./routes/siteLocationRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const siteVisitInfoRoutes = require('./routes/siteVisitInfoRoutes');
const siteAccessRoutes = require('./routes/siteAccessRoutes');
const siteAreaInfoRoutes = require('./routes/siteAreaInfoRoutes');
const acConnectionInfoRoutes = require('./routes/acConnectionInfoRoutes');
const powerMeterRoutes = require('./routes/powerMeterRoutes');
const acPanelRoutes = require('./routes/acPanelRoutes');
const outdoorGeneralLayoutRoutes = require('./routes/outdoorGeneralLayoutRoutes');
const outdoorCabinetsRoutes = require('./routes/outdoorCabinetsRoutes');
const ranEquipmentRoutes = require('./routes/ranEquipmentRoutes');
const transmissionMWRoutes = require('./routes/transmissionMW');
const dcPowerSystemRoutes = require('./routes/dcPowerSystem');
const antennaStructureRoutes = require('./routes/antennaStructure');
const mwAntennasRoutes = require('./routes/mwAntennas');
const externalDCDistributionRoutes = require('./routes/externalDCDistributionRoutes');
const antennaConfigurationRoutes = require('./routes/antennaConfigurationRoutes');
const radioUnitsRoutes = require('./routes/radioUnitsRoutes');
const newRadioInstallationsRoutes = require('./routes/newRadioInstallationsRoutes');
const newAntennasRoutes = require('./routes/newAntennasRoutes');
const newRadioUnitsRoutes = require('./routes/newRadioUnitsRoutes');
const newFPFHsRoutes = require('./routes/newFPFHsRoutes');
const newGPSRoutes = require('./routes/newGPSRoutes');
const siteImagesRoutes = require('./routes/siteImagesRoutes');
const exportRoutes = require('./routes/exportRoutes');
// Reporting routes
const reportRoutes = require('./routes/report');
// Health & Safety routes
const healthSafetySiteAccessRoutes = require('./routes/healthSafetySiteAccessRoutes');
const healthSafetyBTSAccessRoutes = require('./routes/healthSafetyBTSAccessRoutes');

// Define Sequelize model associations
const User = require('./models/User');
const Survey = require('./models/Survey');
const SiteVisitInfo = require('./models/SiteVisitInfo');
const TransmissionMW = require('./models/TransmissionMW');
const DCPowerSystem = require('./models/DCPowerSystem');
const AntennaStructure = require('./models/AntennaStructure');
const AntennaStructureImages = require('./models/AntennaStructureImages');
const MWAntennas = require('./models/MWAntennas');
const ExternalDCDistribution = require('./models/ExternalDCDistribution');
const AntennaConfiguration = require('./models/AntennaConfiguration');
const RadioUnits = require('./models/RadioUnits');
const NewRadioInstallations = require('./models/NewRadioInstallations');
const NewAntennas = require('./models/NewAntennas');
const NewRadioUnits = require('./models/NewRadioUnits');
const NewFPFHs = require('./models/NewFPFHs');
const NewGPS = require('./models/NewGPS');
// Health & Safety models
const HealthSafetySiteAccess = require('./models/HealthSafetySiteAccess');
const HealthSafetyBTSAccess = require('./models/HealthSafetyBTSAccess');
const MWAntennasImages = require('./models/MWAntennasImages');
const { report } = require('process');

// Load AC Connection associations
require('./models/associations');

User.hasMany(Survey, { foreignKey: 'user_id', as: 'surveys' });
User.hasMany(Survey, { foreignKey: 'creator_id', as: 'createdSurveys' });
Survey.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Survey.belongsTo(User, { foreignKey: 'creator_id', as: 'createdBy' });
Survey.hasMany(SiteVisitInfo, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'siteVisitInfo' });
SiteVisitInfo.belongsTo(Survey, { foreignKey: 'session_id', targetKey: 'session_id' });
Survey.hasOne(ExternalDCDistribution, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'externalDCDistribution' });
ExternalDCDistribution.belongsTo(Survey, { foreignKey: 'session_id', targetKey: 'session_id' });
Survey.hasOne(AntennaConfiguration, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'antennaConfiguration' });
AntennaConfiguration.belongsTo(Survey, { foreignKey: 'session_id', targetKey: 'session_id' });
Survey.hasOne(RadioUnits, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'radioUnits' });
RadioUnits.belongsTo(Survey, { foreignKey: 'session_id', targetKey: 'session_id' });
Survey.hasOne(NewRadioInstallations, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'newRadioInstallations' });
NewRadioInstallations.belongsTo(Survey, { foreignKey: 'session_id', targetKey: 'session_id' });

// AntennaStructure and AntennaStructureImages associations
Survey.hasOne(AntennaStructure, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'antennaStructure' });
AntennaStructure.belongsTo(Survey, { foreignKey: 'session_id', targetKey: 'session_id' });
AntennaStructure.hasMany(AntennaStructureImages, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'images' });
AntennaStructureImages.belongsTo(AntennaStructure, { foreignKey: 'session_id', targetKey: 'session_id' });

// Simplified associations without foreign key constraints to avoid index limits
NewRadioInstallations.hasMany(NewAntennas, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'newAntennas', constraints: false });
NewAntennas.belongsTo(NewRadioInstallations, { foreignKey: 'session_id', targetKey: 'session_id', constraints: false });
NewRadioInstallations.hasOne(NewRadioUnits, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'newRadioUnits', constraints: false });
NewRadioUnits.belongsTo(NewRadioInstallations, { foreignKey: 'session_id', targetKey: 'session_id', constraints: false });
NewRadioInstallations.hasOne(NewFPFHs, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'newFPFHs', constraints: false });
NewFPFHs.belongsTo(NewRadioInstallations, { foreignKey: 'session_id', targetKey: 'session_id', constraints: false });
Survey.hasOne(NewGPS, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'newGPS', constraints: false });
NewGPS.belongsTo(Survey, { foreignKey: 'session_id', targetKey: 'session_id', constraints: false });
// Health & Safety associations
Survey.hasOne(HealthSafetySiteAccess, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'healthSafetySiteAccess', constraints: false });
HealthSafetySiteAccess.belongsTo(Survey, { foreignKey: 'session_id', targetKey: 'session_id', constraints: false });
Survey.hasOne(HealthSafetyBTSAccess, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'healthSafetyBTSAccess', constraints: false });
HealthSafetyBTSAccess.belongsTo(Survey, { foreignKey: 'session_id', targetKey: 'session_id', constraints: false });

app.use('/api/sites', siteLocationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/site-visit-info', siteVisitInfoRoutes);
app.use('/api/site-access', siteAccessRoutes);
app.use('/api/site-area-info', siteAreaInfoRoutes);
app.use('/api/ac-connection-info', acConnectionInfoRoutes);
app.use('/api/power-meter', powerMeterRoutes);
app.use('/api/ac-panel', acPanelRoutes);
app.use('/api/outdoor-general-layout', outdoorGeneralLayoutRoutes);
app.use('/api/outdoor-cabinets', outdoorCabinetsRoutes);
app.use('/api/ran-equipment', ranEquipmentRoutes);
app.use('/api/transmission-mw', transmissionMWRoutes);
app.use('/api/dc-power-system', dcPowerSystemRoutes);
app.use('/api/antenna-structure', antennaStructureRoutes);
app.use('/api/mw-antennas', mwAntennasRoutes);
app.use('/api/external-dc-distribution', externalDCDistributionRoutes);
app.use('/api/antenna-configuration', antennaConfigurationRoutes);
app.use('/api/radio-units', radioUnitsRoutes);
app.use('/api/new-radio-installations', newRadioInstallationsRoutes);
app.use('/api/new-antennas', newAntennasRoutes);
app.use('/api/new-radio-units', newRadioUnitsRoutes);
app.use('/api/new-fpfh', newFPFHsRoutes);
app.use('/api/new-gps', newGPSRoutes);
app.use('/api/site-images', siteImagesRoutes);
app.use('/api/export', exportRoutes);
//reporting documents
app.use('api/report',reportRoutes);
// Health & Safety route registrations
app.use('/api/health-safety-site-access', healthSafetySiteAccessRoutes);
app.use('/api/health-safety-bts-access', healthSafetyBTSAccessRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Sync database and start server
sequelize.sync({ force: false, alter: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to sync database:', error);
  }); 