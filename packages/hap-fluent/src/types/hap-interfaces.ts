// Auto-generated HAP Service Interfaces
import { Service } from "hap-nodejs";

import { Enums } from "./hap-enums.js";

export interface AccessCode {
  UUID: "00000260-0000-1000-8000-0026BB765291";
  serviceName: "AccessCode";
  accessCodeControlPoint: Buffer;
  accessCodeSupportedConfiguration: Buffer;
  configurationState: number;
}

export interface AccessControl {
  UUID: "000000DA-0000-1000-8000-0026BB765291";
  serviceName: "AccessControl";
  accessControlLevel: number;
  passwordSetting?: Buffer;
}

export interface AccessoryInformation {
  UUID: "0000003E-0000-1000-8000-0026BB765291";
  serviceName: "AccessoryInformation";
  identify: boolean;
  manufacturer: string;
  model: string;
  name: string;
  serialNumber: string;
  firmwareRevision: string;
  accessoryFlags?: Enums.AccessoryFlags;
  appMatchingIdentifier?: Buffer;
  configuredName?: string;
  matterFirmwareRevisionNumber?: number;
  hardwareFinish?: Buffer;
  hardwareRevision?: string;
  productData?: Buffer;
  softwareRevision?: string;
}

export interface AccessoryMetrics {
  UUID: "00000270-0000-1000-8000-0026BB765291";
  serviceName: "AccessoryMetrics";
  active: Enums.Active;
  metricsBufferFullState: boolean;
  supportedMetrics: Buffer;
}

export interface AccessoryRuntimeInformation {
  UUID: "00000239-0000-1000-8000-0026BB765291";
  serviceName: "AccessoryRuntimeInformation";
  ping: Buffer;
  activityInterval?: number;
  heartBeat?: number;
  sleepInterval?: number;
}

export interface AirPurifier {
  UUID: "000000BB-0000-1000-8000-0026BB765291";
  serviceName: "AirPurifier";
  active: Enums.Active;
  currentAirPurifierState: Enums.CurrentAirPurifierState;
  targetAirPurifierState: Enums.TargetAirPurifierState;
  lockPhysicalControls?: Enums.LockPhysicalControls;
  name?: string;
  rotationSpeed?: number;
  swingMode?: Enums.SwingMode;
}

export interface AirQualitySensor {
  UUID: "0000008D-0000-1000-8000-0026BB765291";
  serviceName: "AirQualitySensor";
  airQuality: Enums.AirQuality;
  nitrogenDioxideDensity?: number;
  ozoneDensity?: number;
  pm10Density?: number;
  pm25Density?: number;
  sulphurDioxideDensity?: number;
  vocDensity?: number;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface AssetUpdate {
  UUID: "00000267-0000-1000-8000-0026BB765291";
  serviceName: "AssetUpdate";
  assetUpdateReadiness: number;
  supportedAssetTypes: number;
}

export interface Assistant {
  UUID: "0000026A-0000-1000-8000-0026BB765291";
  serviceName: "Assistant";
  active: Enums.Active;
  identifier: number;
  name: string;
}

export interface AudioStreamManagement {
  UUID: "00000127-0000-1000-8000-0026BB765291";
  serviceName: "AudioStreamManagement";
  supportedAudioStreamConfiguration: Buffer;
  selectedAudioStreamConfiguration: Buffer;
}

export interface Battery {
  UUID: "00000096-0000-1000-8000-0026BB765291";
  serviceName: "Battery";
  statusLowBattery: Enums.StatusLowBattery;
  batteryLevel?: number;
  chargingState?: Enums.ChargingState;
  name?: string;
}

export interface CameraOperatingMode {
  UUID: "0000021A-0000-1000-8000-0026BB765291";
  serviceName: "CameraOperatingMode";
  eventSnapshotsActive: Enums.EventSnapshotsActive;
  homeKitCameraActive: Enums.HomeKitCameraActive;
  cameraOperatingModeIndicator?: Enums.CameraOperatingModeIndicator;
  manuallyDisabled?: Enums.ManuallyDisabled;
  nightVision?: boolean;
  periodicSnapshotsActive?: Enums.PeriodicSnapshotsActive;
  thirdPartyCameraActive?: Enums.ThirdPartyCameraActive;
  diagonalFieldOfView?: number;
}

export interface CameraRecordingManagement {
  UUID: "00000204-0000-1000-8000-0026BB765291";
  serviceName: "CameraRecordingManagement";
  active: Enums.Active;
  selectedCameraRecordingConfiguration: Buffer;
  supportedAudioRecordingConfiguration: Buffer;
  supportedCameraRecordingConfiguration: Buffer;
  supportedVideoRecordingConfiguration: Buffer;
  recordingAudioActive?: Enums.RecordingAudioActive;
}

export interface CameraRTPStreamManagement {
  UUID: "00000110-0000-1000-8000-0026BB765291";
  serviceName: "CameraRTPStreamManagement";
  selectedRtpStreamConfiguration: Buffer;
  setupEndpoints: Buffer;
  streamingStatus: Buffer;
  supportedAudioStreamConfiguration: Buffer;
  supportedRtpConfiguration: Buffer;
  supportedVideoStreamConfiguration: Buffer;
  active?: Enums.Active;
}

export interface CarbonDioxideSensor {
  UUID: "00000097-0000-1000-8000-0026BB765291";
  serviceName: "CarbonDioxideSensor";
  carbonDioxideDetected: Enums.CarbonDioxideDetected;
  carbonDioxideLevel?: number;
  carbonDioxidePeakLevel?: number;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface CarbonMonoxideSensor {
  UUID: "0000007F-0000-1000-8000-0026BB765291";
  serviceName: "CarbonMonoxideSensor";
  carbonMonoxideDetected: Enums.CarbonMonoxideDetected;
  carbonMonoxideLevel?: number;
  carbonMonoxidePeakLevel?: number;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface CloudRelay {
  UUID: "0000005A-0000-1000-8000-0026BB765291";
  serviceName: "CloudRelay";
  relayControlPoint: Buffer;
  relayState: number;
  relayEnabled: boolean;
}

export interface ContactSensor {
  UUID: "00000080-0000-1000-8000-0026BB765291";
  serviceName: "ContactSensor";
  contactSensorState: Enums.ContactSensorState;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface DataStreamTransportManagement {
  UUID: "00000129-0000-1000-8000-0026BB765291";
  serviceName: "DataStreamTransportManagement";
  setupDataStreamTransport: Buffer;
  supportedDataStreamTransportConfiguration: Buffer;
  version: string;
}

export interface Diagnostics {
  UUID: "00000237-0000-1000-8000-0026BB765291";
  serviceName: "Diagnostics";
  supportedDiagnosticsSnapshot: Buffer;
  selectedDiagnosticsModes?: number;
  supportedDiagnosticsModes?: number;
}

export interface Door {
  UUID: "00000081-0000-1000-8000-0026BB765291";
  serviceName: "Door";
  currentPosition: number;
  positionState: Enums.PositionState;
  targetPosition: number;
  name?: string;
  obstructionDetected?: boolean;
  holdPosition?: boolean;
}

export interface Doorbell {
  UUID: "00000121-0000-1000-8000-0026BB765291";
  serviceName: "Doorbell";
  programmableSwitchEvent: Enums.ProgrammableSwitchEvent;
  brightness?: number;
  mute?: boolean;
  name?: string;
  operatingStateResponse?: Buffer;
  volume?: number;
}

export interface Fan {
  UUID: "00000040-0000-1000-8000-0026BB765291";
  serviceName: "Fan";
  on: boolean;
  name?: string;
  rotationDirection?: Enums.RotationDirection;
  rotationSpeed?: number;
}

export interface Fanv2 {
  UUID: "000000B7-0000-1000-8000-0026BB765291";
  serviceName: "Fanv2";
  active: Enums.Active;
  currentFanState?: Enums.CurrentFanState;
  targetFanState?: Enums.TargetFanState;
  lockPhysicalControls?: Enums.LockPhysicalControls;
  name?: string;
  rotationDirection?: Enums.RotationDirection;
  rotationSpeed?: number;
  swingMode?: Enums.SwingMode;
}

export interface Faucet {
  UUID: "000000D7-0000-1000-8000-0026BB765291";
  serviceName: "Faucet";
  active: Enums.Active;
  name?: string;
  statusFault?: Enums.StatusFault;
}

export interface FilterMaintenance {
  UUID: "000000BA-0000-1000-8000-0026BB765291";
  serviceName: "FilterMaintenance";
  filterChangeIndication: Enums.FilterChangeIndication;
  filterLifeLevel?: number;
  resetFilterIndication?: number;
  name?: string;
}

export interface FirmwareUpdate {
  UUID: "00000236-0000-1000-8000-0026BB765291";
  serviceName: "FirmwareUpdate";
  firmwareUpdateReadiness: Buffer;
  firmwareUpdateStatus: Buffer;
  matterFirmwareUpdateStatus?: Buffer;
  stagedFirmwareVersion?: string;
  supportedFirmwareUpdateConfiguration?: Buffer;
}

export interface GarageDoorOpener {
  UUID: "00000041-0000-1000-8000-0026BB765291";
  serviceName: "GarageDoorOpener";
  currentDoorState: Enums.CurrentDoorState;
  targetDoorState: Enums.TargetDoorState;
  obstructionDetected: boolean;
  lockCurrentState?: Enums.LockCurrentState;
  lockTargetState?: Enums.LockTargetState;
  name?: string;
}

export interface HeaterCooler {
  UUID: "000000BC-0000-1000-8000-0026BB765291";
  serviceName: "HeaterCooler";
  active: Enums.Active;
  currentHeaterCoolerState: Enums.CurrentHeaterCoolerState;
  targetHeaterCoolerState: Enums.TargetHeaterCoolerState;
  currentTemperature: number;
  lockPhysicalControls?: Enums.LockPhysicalControls;
  name?: string;
  rotationSpeed?: number;
  swingMode?: Enums.SwingMode;
  coolingThresholdTemperature?: number;
  heatingThresholdTemperature?: number;
  temperatureDisplayUnits?: Enums.TemperatureDisplayUnits;
}

export interface HumidifierDehumidifier {
  UUID: "000000BD-0000-1000-8000-0026BB765291";
  serviceName: "HumidifierDehumidifier";
  active: Enums.Active;
  currentHumidifierDehumidifierState: Enums.CurrentHumidifierDehumidifierState;
  targetHumidifierDehumidifierState: Enums.TargetHumidifierDehumidifierState;
  currentRelativeHumidity: number;
  lockPhysicalControls?: Enums.LockPhysicalControls;
  name?: string;
  relativeHumidityDehumidifierThreshold?: number;
  relativeHumidityHumidifierThreshold?: number;
  rotationSpeed?: number;
  swingMode?: Enums.SwingMode;
  waterLevel?: number;
}

export interface HumiditySensor {
  UUID: "00000082-0000-1000-8000-0026BB765291";
  serviceName: "HumiditySensor";
  currentRelativeHumidity: number;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface InputSource {
  UUID: "000000D9-0000-1000-8000-0026BB765291";
  serviceName: "InputSource";
  configuredName: string;
  inputSourceType: Enums.InputSourceType;
  isConfigured: Enums.IsConfigured;
  name: string;
  currentVisibilityState: Enums.CurrentVisibilityState;
  identifier?: number;
  inputDeviceType?: Enums.InputDeviceType;
  targetVisibilityState?: Enums.TargetVisibilityState;
}

export interface IrrigationSystem {
  UUID: "000000CF-0000-1000-8000-0026BB765291";
  serviceName: "IrrigationSystem";
  active: Enums.Active;
  programMode: Enums.ProgramMode;
  inUse: Enums.InUse;
  remainingDuration?: number;
  name?: string;
  statusFault?: Enums.StatusFault;
}

export interface LeakSensor {
  UUID: "00000083-0000-1000-8000-0026BB765291";
  serviceName: "LeakSensor";
  leakDetected: Enums.LeakDetected;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface Lightbulb {
  UUID: "00000043-0000-1000-8000-0026BB765291";
  serviceName: "Lightbulb";
  on: boolean;
  brightness?: number;
  characteristicValueActiveTransitionCount?: number;
  characteristicValueTransitionControl?: Buffer;
  colorTemperature?: number;
  hue?: number;
  name?: string;
  saturation?: number;
  supportedCharacteristicValueTransitionConfiguration?: Buffer;
}

export interface LightSensor {
  UUID: "00000084-0000-1000-8000-0026BB765291";
  serviceName: "LightSensor";
  currentAmbientLightLevel: number;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface LockManagement {
  UUID: "00000044-0000-1000-8000-0026BB765291";
  serviceName: "LockManagement";
  lockControlPoint: Buffer;
  version: string;
  administratorOnlyAccess?: boolean;
  audioFeedback?: boolean;
  currentDoorState?: Enums.CurrentDoorState;
  lockManagementAutoSecurityTimeout?: number;
  lockLastKnownAction?: Enums.LockLastKnownAction;
  logs?: Buffer;
  motionDetected?: boolean;
}

export interface LockMechanism {
  UUID: "00000045-0000-1000-8000-0026BB765291";
  serviceName: "LockMechanism";
  lockCurrentState: Enums.LockCurrentState;
  lockTargetState: Enums.LockTargetState;
  name?: string;
}

export interface Microphone {
  UUID: "00000112-0000-1000-8000-0026BB765291";
  serviceName: "Microphone";
  mute: boolean;
  volume?: number;
}

export interface MotionSensor {
  UUID: "00000085-0000-1000-8000-0026BB765291";
  serviceName: "MotionSensor";
  motionDetected: boolean;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface NFCAccess {
  UUID: "00000266-0000-1000-8000-0026BB765291";
  serviceName: "NFCAccess";
  configurationState: number;
  nfcAccessControlPoint: Buffer;
  nfcAccessSupportedConfiguration: Buffer;
}

export interface OccupancySensor {
  UUID: "00000086-0000-1000-8000-0026BB765291";
  serviceName: "OccupancySensor";
  occupancyDetected: Enums.OccupancyDetected;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface Outlet {
  UUID: "00000047-0000-1000-8000-0026BB765291";
  serviceName: "Outlet";
  on: boolean;
  name?: string;
  outletInUse?: boolean;
}

export interface Pairing {
  UUID: "00000055-0000-1000-8000-0026BB765291";
  serviceName: "Pairing";
  listPairings: Buffer;
  pairSetup: Buffer;
  pairVerify: Buffer;
  pairingFeatures: number;
}

export interface PowerManagement {
  UUID: "00000221-0000-1000-8000-0026BB765291";
  serviceName: "PowerManagement";
  wakeConfiguration: Buffer;
  selectedSleepConfiguration?: Buffer;
  supportedSleepConfiguration?: Buffer;
}

export interface ProtocolInformation {
  UUID: "000000A2-0000-1000-8000-0026BB765291";
  serviceName: "ProtocolInformation";
  version: string;
}

export interface SecuritySystem {
  UUID: "0000007E-0000-1000-8000-0026BB765291";
  serviceName: "SecuritySystem";
  securitySystemCurrentState: Enums.SecuritySystemCurrentState;
  securitySystemTargetState: Enums.SecuritySystemTargetState;
  name?: string;
  securitySystemAlarmType?: Enums.SecuritySystemAlarmType;
  statusFault?: Enums.StatusFault;
  statusTampered?: Enums.StatusTampered;
}

export interface ServiceLabel {
  UUID: "000000CC-0000-1000-8000-0026BB765291";
  serviceName: "ServiceLabel";
  serviceLabelNamespace: Enums.ServiceLabelNamespace;
}

export interface Siri {
  UUID: "00000133-0000-1000-8000-0026BB765291";
  serviceName: "Siri";
  siriInputType: Enums.SiriInputType;
  multifunctionButton?: number;
  siriEnable?: number;
  siriEngineVersion?: string;
  siriLightOnUse?: number;
  siriListening?: number;
  siriTouchToUse?: number;
}

export interface SiriEndpoint {
  UUID: "00000253-0000-1000-8000-0026BB765291";
  serviceName: "SiriEndpoint";
  siriEndpointSessionStatus: Buffer;
  version: string;
  activeIdentifier?: number;
  manuallyDisabled?: Enums.ManuallyDisabled;
}

export interface Slats {
  UUID: "000000B9-0000-1000-8000-0026BB765291";
  serviceName: "Slats";
  currentSlatState: Enums.CurrentSlatState;
  slatType: Enums.SlatType;
  name?: string;
  swingMode?: Enums.SwingMode;
  currentTiltAngle?: number;
  targetTiltAngle?: number;
}

export interface SmartSpeaker {
  UUID: "00000228-0000-1000-8000-0026BB765291";
  serviceName: "SmartSpeaker";
  currentMediaState: Enums.CurrentMediaState;
  targetMediaState: Enums.TargetMediaState;
  airPlayEnable?: number;
  configuredName?: string;
  mute?: boolean;
  name?: string;
  volume?: number;
}

export interface SmokeSensor {
  UUID: "00000087-0000-1000-8000-0026BB765291";
  serviceName: "SmokeSensor";
  smokeDetected: Enums.SmokeDetected;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface Speaker {
  UUID: "00000113-0000-1000-8000-0026BB765291";
  serviceName: "Speaker";
  mute: boolean;
  active?: Enums.Active;
  volume?: number;
}

export interface StatefulProgrammableSwitch {
  UUID: "00000088-0000-1000-8000-0026BB765291";
  serviceName: "StatefulProgrammableSwitch";
  programmableSwitchEvent: Enums.ProgrammableSwitchEvent;
  programmableSwitchOutputState: number;
  name?: string;
}

export interface StatelessProgrammableSwitch {
  UUID: "00000089-0000-1000-8000-0026BB765291";
  serviceName: "StatelessProgrammableSwitch";
  programmableSwitchEvent: Enums.ProgrammableSwitchEvent;
  name?: string;
  serviceLabelIndex?: number;
}

export interface Switch {
  UUID: "00000049-0000-1000-8000-0026BB765291";
  serviceName: "Switch";
  on: boolean;
  name?: string;
}

export interface TapManagement {
  UUID: "0000022E-0000-1000-8000-0026BB765291";
  serviceName: "TapManagement";
  active: Enums.Active;
  cryptoHash: Buffer;
  tapType: number;
  token: Buffer;
}

export interface TargetControl {
  UUID: "00000125-0000-1000-8000-0026BB765291";
  serviceName: "TargetControl";
  active: Enums.Active;
  activeIdentifier: number;
  buttonEvent: Buffer;
  name?: string;
}

export interface TargetControlManagement {
  UUID: "00000122-0000-1000-8000-0026BB765291";
  serviceName: "TargetControlManagement";
  targetControlSupportedConfiguration: Buffer;
  targetControlList: Buffer;
}

export interface Television {
  UUID: "000000D8-0000-1000-8000-0026BB765291";
  serviceName: "Television";
  active: Enums.Active;
  activeIdentifier: number;
  configuredName: string;
  remoteKey: Enums.RemoteKey;
  sleepDiscoveryMode: Enums.SleepDiscoveryMode;
  brightness?: number;
  closedCaptions?: Enums.ClosedCaptions;
  displayOrder?: Buffer;
  currentMediaState?: Enums.CurrentMediaState;
  targetMediaState?: Enums.TargetMediaState;
  name?: string;
  pictureMode?: Enums.PictureMode;
  powerModeSelection?: Enums.PowerModeSelection;
}

export interface TelevisionSpeaker {
  UUID: "00000113-0000-1000-8000-0026BB765291";
  serviceName: "TelevisionSpeaker";
  mute: boolean;
  active?: Enums.Active;
  volume?: number;
  volumeControlType?: Enums.VolumeControlType;
  volumeSelector?: Enums.VolumeSelector;
}

export interface TemperatureSensor {
  UUID: "0000008A-0000-1000-8000-0026BB765291";
  serviceName: "TemperatureSensor";
  currentTemperature: number;
  name?: string;
  statusActive?: boolean;
  statusFault?: Enums.StatusFault;
  statusLowBattery?: Enums.StatusLowBattery;
  statusTampered?: Enums.StatusTampered;
}

export interface Thermostat {
  UUID: "0000004A-0000-1000-8000-0026BB765291";
  serviceName: "Thermostat";
  currentHeatingCoolingState: Enums.CurrentHeatingCoolingState;
  targetHeatingCoolingState: Enums.TargetHeatingCoolingState;
  currentTemperature: number;
  targetTemperature: number;
  temperatureDisplayUnits: Enums.TemperatureDisplayUnits;
  name?: string;
  currentRelativeHumidity?: number;
  targetRelativeHumidity?: number;
  coolingThresholdTemperature?: number;
  heatingThresholdTemperature?: number;
}

export interface ThreadTransport {
  UUID: "00000701-0000-1000-8000-0026BB765291";
  serviceName: "ThreadTransport";
  currentTransport: boolean;
  threadControlPoint: Buffer;
  threadNodeCapabilities: number;
  threadStatus: number;
  ccaEnergyDetectThreshold?: number;
  ccaSignalDetectThreshold?: number;
  eventRetransmissionMaximum?: number;
  eventTransmissionCounters?: number;
  macRetransmissionMaximum?: number;
  macTransmissionCounters?: Buffer;
  receiverSensitivity?: number;
  receivedSignalStrengthIndication?: number;
  signalToNoiseRatio?: number;
  threadOpenThreadVersion?: string;
  transmitPower?: number;
  maximumTransmitPower?: number;
}

export interface TransferTransportManagement {
  UUID: "00000203-0000-1000-8000-0026BB765291";
  serviceName: "TransferTransportManagement";
  supportedTransferTransportConfiguration: Buffer;
  setupTransferTransport: Buffer;
}

export interface Tunnel {
  UUID: "00000056-0000-1000-8000-0026BB765291";
  serviceName: "Tunnel";
  accessoryIdentifier: string;
  tunnelConnectionTimeout: number;
  tunneledAccessoryAdvertising: boolean;
  tunneledAccessoryConnected: boolean;
  tunneledAccessoryStateNumber: number;
}

export interface Valve {
  UUID: "000000D0-0000-1000-8000-0026BB765291";
  serviceName: "Valve";
  active: Enums.Active;
  inUse: Enums.InUse;
  valveType: Enums.ValveType;
  isConfigured?: Enums.IsConfigured;
  name?: string;
  remainingDuration?: number;
  serviceLabelIndex?: number;
  setDuration?: number;
  statusFault?: Enums.StatusFault;
}

export interface WiFiRouter {
  UUID: "0000020A-0000-1000-8000-0026BB765291";
  serviceName: "WiFiRouter";
  configuredName: string;
  managedNetworkEnable: Enums.ManagedNetworkEnable;
  networkAccessViolationControl: Buffer;
  networkClientProfileControl: Buffer;
  networkClientStatusControl: Buffer;
  routerStatus: Enums.RouterStatus;
  supportedRouterConfiguration: Buffer;
  wanConfigurationList: Buffer;
  wanStatusList: Buffer;
}

export interface WiFiSatellite {
  UUID: "0000020F-0000-1000-8000-0026BB765291";
  serviceName: "WiFiSatellite";
  wiFiSatelliteStatus: Enums.WiFiSatelliteStatus;
}

export interface WiFiTransport {
  UUID: "0000022A-0000-1000-8000-0026BB765291";
  serviceName: "WiFiTransport";
  currentTransport: boolean;
  wiFiCapabilities: number;
  wiFiConfigurationControl?: Buffer;
}

export interface Window {
  UUID: "0000008B-0000-1000-8000-0026BB765291";
  serviceName: "Window";
  currentPosition: number;
  positionState: Enums.PositionState;
  targetPosition: number;
  name?: string;
  obstructionDetected?: boolean;
  holdPosition?: boolean;
}

export interface WindowCovering {
  UUID: "0000008C-0000-1000-8000-0026BB765291";
  serviceName: "WindowCovering";
  currentPosition: number;
  positionState: Enums.PositionState;
  targetPosition: number;
  currentHorizontalTiltAngle?: number;
  targetHorizontalTiltAngle?: number;
  name?: string;
  obstructionDetected?: boolean;
  holdPosition?: boolean;
  currentVerticalTiltAngle?: number;
  targetVerticalTiltAngle?: number;
}

export type InterfaceMap = {
  AccessCode: AccessCode;
  AccessControl: AccessControl;
  AccessoryInformation: AccessoryInformation;
  AccessoryMetrics: AccessoryMetrics;
  AccessoryRuntimeInformation: AccessoryRuntimeInformation;
  AirPurifier: AirPurifier;
  AirQualitySensor: AirQualitySensor;
  AssetUpdate: AssetUpdate;
  Assistant: Assistant;
  AudioStreamManagement: AudioStreamManagement;
  Battery: Battery;
  CameraOperatingMode: CameraOperatingMode;
  CameraRecordingManagement: CameraRecordingManagement;
  CameraRTPStreamManagement: CameraRTPStreamManagement;
  CarbonDioxideSensor: CarbonDioxideSensor;
  CarbonMonoxideSensor: CarbonMonoxideSensor;
  CloudRelay: CloudRelay;
  ContactSensor: ContactSensor;
  DataStreamTransportManagement: DataStreamTransportManagement;
  Diagnostics: Diagnostics;
  Door: Door;
  Doorbell: Doorbell;
  Fan: Fan;
  Fanv2: Fanv2;
  Faucet: Faucet;
  FilterMaintenance: FilterMaintenance;
  FirmwareUpdate: FirmwareUpdate;
  GarageDoorOpener: GarageDoorOpener;
  HeaterCooler: HeaterCooler;
  HumidifierDehumidifier: HumidifierDehumidifier;
  HumiditySensor: HumiditySensor;
  InputSource: InputSource;
  IrrigationSystem: IrrigationSystem;
  LeakSensor: LeakSensor;
  Lightbulb: Lightbulb;
  LightSensor: LightSensor;
  LockManagement: LockManagement;
  LockMechanism: LockMechanism;
  Microphone: Microphone;
  MotionSensor: MotionSensor;
  NFCAccess: NFCAccess;
  OccupancySensor: OccupancySensor;
  Outlet: Outlet;
  Pairing: Pairing;
  PowerManagement: PowerManagement;
  ProtocolInformation: ProtocolInformation;
  SecuritySystem: SecuritySystem;
  ServiceLabel: ServiceLabel;
  Siri: Siri;
  SiriEndpoint: SiriEndpoint;
  Slats: Slats;
  SmartSpeaker: SmartSpeaker;
  SmokeSensor: SmokeSensor;
  Speaker: Speaker;
  StatefulProgrammableSwitch: StatefulProgrammableSwitch;
  StatelessProgrammableSwitch: StatelessProgrammableSwitch;
  Switch: Switch;
  TapManagement: TapManagement;
  TargetControl: TargetControl;
  TargetControlManagement: TargetControlManagement;
  Television: Television;
  TelevisionSpeaker: TelevisionSpeaker;
  TemperatureSensor: TemperatureSensor;
  Thermostat: Thermostat;
  ThreadTransport: ThreadTransport;
  TransferTransportManagement: TransferTransportManagement;
  Tunnel: Tunnel;
  Valve: Valve;
  WiFiRouter: WiFiRouter;
  WiFiSatellite: WiFiSatellite;
  WiFiTransport: WiFiTransport;
  Window: Window;
  WindowCovering: WindowCovering;
};

export type ServiceMap = {
  AccessCode: typeof Service.AccessCode;
  AccessControl: typeof Service.AccessControl;
  AccessoryInformation: typeof Service.AccessoryInformation;
  AccessoryMetrics: typeof Service.AccessoryMetrics;
  AccessoryRuntimeInformation: typeof Service.AccessoryRuntimeInformation;
  AirPurifier: typeof Service.AirPurifier;
  AirQualitySensor: typeof Service.AirQualitySensor;
  AssetUpdate: typeof Service.AssetUpdate;
  Assistant: typeof Service.Assistant;
  AudioStreamManagement: typeof Service.AudioStreamManagement;
  Battery: typeof Service.Battery;
  CameraOperatingMode: typeof Service.CameraOperatingMode;
  CameraRecordingManagement: typeof Service.CameraRecordingManagement;
  CameraRTPStreamManagement: typeof Service.CameraRTPStreamManagement;
  CarbonDioxideSensor: typeof Service.CarbonDioxideSensor;
  CarbonMonoxideSensor: typeof Service.CarbonMonoxideSensor;
  CloudRelay: typeof Service.CloudRelay;
  ContactSensor: typeof Service.ContactSensor;
  DataStreamTransportManagement: typeof Service.DataStreamTransportManagement;
  Diagnostics: typeof Service.Diagnostics;
  Door: typeof Service.Door;
  Doorbell: typeof Service.Doorbell;
  Fan: typeof Service.Fan;
  Fanv2: typeof Service.Fanv2;
  Faucet: typeof Service.Faucet;
  FilterMaintenance: typeof Service.FilterMaintenance;
  FirmwareUpdate: typeof Service.FirmwareUpdate;
  GarageDoorOpener: typeof Service.GarageDoorOpener;
  HeaterCooler: typeof Service.HeaterCooler;
  HumidifierDehumidifier: typeof Service.HumidifierDehumidifier;
  HumiditySensor: typeof Service.HumiditySensor;
  InputSource: typeof Service.InputSource;
  IrrigationSystem: typeof Service.IrrigationSystem;
  LeakSensor: typeof Service.LeakSensor;
  Lightbulb: typeof Service.Lightbulb;
  LightSensor: typeof Service.LightSensor;
  LockManagement: typeof Service.LockManagement;
  LockMechanism: typeof Service.LockMechanism;
  Microphone: typeof Service.Microphone;
  MotionSensor: typeof Service.MotionSensor;
  NFCAccess: typeof Service.NFCAccess;
  OccupancySensor: typeof Service.OccupancySensor;
  Outlet: typeof Service.Outlet;
  Pairing: typeof Service.Pairing;
  PowerManagement: typeof Service.PowerManagement;
  ProtocolInformation: typeof Service.ProtocolInformation;
  SecuritySystem: typeof Service.SecuritySystem;
  ServiceLabel: typeof Service.ServiceLabel;
  Siri: typeof Service.Siri;
  SiriEndpoint: typeof Service.SiriEndpoint;
  Slats: typeof Service.Slats;
  SmartSpeaker: typeof Service.SmartSpeaker;
  SmokeSensor: typeof Service.SmokeSensor;
  Speaker: typeof Service.Speaker;
  StatefulProgrammableSwitch: typeof Service.StatefulProgrammableSwitch;
  StatelessProgrammableSwitch: typeof Service.StatelessProgrammableSwitch;
  Switch: typeof Service.Switch;
  TapManagement: typeof Service.TapManagement;
  TargetControl: typeof Service.TargetControl;
  TargetControlManagement: typeof Service.TargetControlManagement;
  Television: typeof Service.Television;
  TelevisionSpeaker: typeof Service.TelevisionSpeaker;
  TemperatureSensor: typeof Service.TemperatureSensor;
  Thermostat: typeof Service.Thermostat;
  ThreadTransport: typeof Service.ThreadTransport;
  TransferTransportManagement: typeof Service.TransferTransportManagement;
  Tunnel: typeof Service.Tunnel;
  Valve: typeof Service.Valve;
  WiFiRouter: typeof Service.WiFiRouter;
  WiFiSatellite: typeof Service.WiFiSatellite;
  WiFiTransport: typeof Service.WiFiTransport;
  Window: typeof Service.Window;
  WindowCovering: typeof Service.WindowCovering;
};
