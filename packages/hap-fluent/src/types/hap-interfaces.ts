// Auto-generated HAP Service Interfaces




import { Enums } from './hap-enums.js';

import { Service } from 'homebridge';


export interface AccessCode {
	accessCodeControlPoint: Buffer;
	accessCodeSupportedConfiguration: Buffer;
	configurationState: number;
}

export interface AccessControl {
	accessControlLevel: number;
	passwordSetting?: Buffer;
}

export interface AccessoryInformation {
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
	active: Enums.Active;
	metricsBufferFullState: boolean;
	supportedMetrics: Buffer;
}

export interface AccessoryRuntimeInformation {
	ping: Buffer;
	activityInterval?: number;
	heartBeat?: number;
	sleepInterval?: number;
}

export interface AirPurifier {
	active: Enums.Active;
	currentAirPurifierState: Enums.CurrentAirPurifierState;
	targetAirPurifierState: Enums.TargetAirPurifierState;
	lockPhysicalControls?: Enums.LockPhysicalControls;
	name?: string;
	rotationSpeed?: number;
	swingMode?: Enums.SwingMode;
}

export interface AirQualitySensor {
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
	assetUpdateReadiness: number;
	supportedAssetTypes: number;
}

export interface Assistant {
	active: Enums.Active;
	identifier: number;
	name: string;
}

export interface AudioStreamManagement {
	supportedAudioStreamConfiguration: Buffer;
	selectedAudioStreamConfiguration: Buffer;
}

export interface Battery {
	statusLowBattery: Enums.StatusLowBattery;
	batteryLevel?: number;
	chargingState?: Enums.ChargingState;
	name?: string;
}

export interface CameraOperatingMode {
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
	active: Enums.Active;
	selectedCameraRecordingConfiguration: Buffer;
	supportedAudioRecordingConfiguration: Buffer;
	supportedCameraRecordingConfiguration: Buffer;
	supportedVideoRecordingConfiguration: Buffer;
	recordingAudioActive?: Enums.RecordingAudioActive;
}

export interface CameraRTPStreamManagement {
	selectedRtpStreamConfiguration: Buffer;
	setupEndpoints: Buffer;
	streamingStatus: Buffer;
	supportedAudioStreamConfiguration: Buffer;
	supportedRtpConfiguration: Buffer;
	supportedVideoStreamConfiguration: Buffer;
	active?: Enums.Active;
}

export interface CarbonDioxideSensor {
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
	relayControlPoint: Buffer;
	relayState: number;
	relayEnabled: boolean;
}

export interface ContactSensor {
	contactSensorState: Enums.ContactSensorState;
	name?: string;
	statusActive?: boolean;
	statusFault?: Enums.StatusFault;
	statusLowBattery?: Enums.StatusLowBattery;
	statusTampered?: Enums.StatusTampered;
}

export interface DataStreamTransportManagement {
	setupDataStreamTransport: Buffer;
	supportedDataStreamTransportConfiguration: Buffer;
	version: string;
}

export interface Diagnostics {
	supportedDiagnosticsSnapshot: Buffer;
	selectedDiagnosticsModes?: number;
	supportedDiagnosticsModes?: number;
}

export interface Door {
	currentPosition: number;
	positionState: Enums.PositionState;
	targetPosition: number;
	name?: string;
	obstructionDetected?: boolean;
	holdPosition?: boolean;
}

export interface Doorbell {
	programmableSwitchEvent: Enums.ProgrammableSwitchEvent;
	brightness?: number;
	mute?: boolean;
	name?: string;
	operatingStateResponse?: Buffer;
	volume?: number;
}

export interface Fan {
	on: boolean;
	name?: string;
	rotationDirection?: Enums.RotationDirection;
	rotationSpeed?: number;
}

export interface Fanv2 {
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
	active: Enums.Active;
	name?: string;
	statusFault?: Enums.StatusFault;
}

export interface FilterMaintenance {
	filterChangeIndication: Enums.FilterChangeIndication;
	filterLifeLevel?: number;
	resetFilterIndication?: number;
	name?: string;
}

export interface FirmwareUpdate {
	firmwareUpdateReadiness: Buffer;
	firmwareUpdateStatus: Buffer;
	matterFirmwareUpdateStatus?: Buffer;
	stagedFirmwareVersion?: string;
	supportedFirmwareUpdateConfiguration?: Buffer;
}

export interface GarageDoorOpener {
	currentDoorState: Enums.CurrentDoorState;
	targetDoorState: Enums.TargetDoorState;
	obstructionDetected: boolean;
	lockCurrentState?: Enums.LockCurrentState;
	lockTargetState?: Enums.LockTargetState;
	name?: string;
}

export interface HeaterCooler {
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
	currentRelativeHumidity: number;
	name?: string;
	statusActive?: boolean;
	statusFault?: Enums.StatusFault;
	statusLowBattery?: Enums.StatusLowBattery;
	statusTampered?: Enums.StatusTampered;
}

export interface InputSource {
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
	active: Enums.Active;
	programMode: Enums.ProgramMode;
	inUse: Enums.InUse;
	remainingDuration?: number;
	name?: string;
	statusFault?: Enums.StatusFault;
}

export interface LeakSensor {
	leakDetected: Enums.LeakDetected;
	name?: string;
	statusActive?: boolean;
	statusFault?: Enums.StatusFault;
	statusLowBattery?: Enums.StatusLowBattery;
	statusTampered?: Enums.StatusTampered;
}

export interface Lightbulb {
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
	currentAmbientLightLevel: number;
	name?: string;
	statusActive?: boolean;
	statusFault?: Enums.StatusFault;
	statusLowBattery?: Enums.StatusLowBattery;
	statusTampered?: Enums.StatusTampered;
}

export interface LockManagement {
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
	lockCurrentState: Enums.LockCurrentState;
	lockTargetState: Enums.LockTargetState;
	name?: string;
}

export interface Microphone {
	mute: boolean;
	volume?: number;
}

export interface MotionSensor {
	motionDetected: boolean;
	name?: string;
	statusActive?: boolean;
	statusFault?: Enums.StatusFault;
	statusLowBattery?: Enums.StatusLowBattery;
	statusTampered?: Enums.StatusTampered;
}

export interface NFCAccess {
	configurationState: number;
	nfcAccessControlPoint: Buffer;
	nfcAccessSupportedConfiguration: Buffer;
}

export interface OccupancySensor {
	occupancyDetected: Enums.OccupancyDetected;
	name?: string;
	statusActive?: boolean;
	statusFault?: Enums.StatusFault;
	statusLowBattery?: Enums.StatusLowBattery;
	statusTampered?: Enums.StatusTampered;
}

export interface Outlet {
	on: boolean;
	name?: string;
	outletInUse?: boolean;
}

export interface Pairing {
	listPairings: Buffer;
	pairSetup: Buffer;
	pairVerify: Buffer;
	pairingFeatures: number;
}

export interface PowerManagement {
	wakeConfiguration: Buffer;
	selectedSleepConfiguration?: Buffer;
	supportedSleepConfiguration?: Buffer;
}

export interface ProtocolInformation {
	version: string;
}

export interface SecuritySystem {
	securitySystemCurrentState: Enums.SecuritySystemCurrentState;
	securitySystemTargetState: Enums.SecuritySystemTargetState;
	name?: string;
	securitySystemAlarmType?: Enums.SecuritySystemAlarmType;
	statusFault?: Enums.StatusFault;
	statusTampered?: Enums.StatusTampered;
}

export interface ServiceLabel {
	serviceLabelNamespace: Enums.ServiceLabelNamespace;
}

export interface Siri {
	siriInputType: Enums.SiriInputType;
	multifunctionButton?: number;
	siriEnable?: number;
	siriEngineVersion?: string;
	siriLightOnUse?: number;
	siriListening?: number;
	siriTouchToUse?: number;
}

export interface SiriEndpoint {
	siriEndpointSessionStatus: Buffer;
	version: string;
	activeIdentifier?: number;
	manuallyDisabled?: Enums.ManuallyDisabled;
}

export interface Slats {
	currentSlatState: Enums.CurrentSlatState;
	slatType: Enums.SlatType;
	name?: string;
	swingMode?: Enums.SwingMode;
	currentTiltAngle?: number;
	targetTiltAngle?: number;
}

export interface SmartSpeaker {
	currentMediaState: Enums.CurrentMediaState;
	targetMediaState: Enums.TargetMediaState;
	airPlayEnable?: number;
	configuredName?: string;
	mute?: boolean;
	name?: string;
	volume?: number;
}

export interface SmokeSensor {
	smokeDetected: Enums.SmokeDetected;
	name?: string;
	statusActive?: boolean;
	statusFault?: Enums.StatusFault;
	statusLowBattery?: Enums.StatusLowBattery;
	statusTampered?: Enums.StatusTampered;
}

export interface Speaker {
	mute: boolean;
	active?: Enums.Active;
	volume?: number;
}

export interface StatefulProgrammableSwitch {
	programmableSwitchEvent: Enums.ProgrammableSwitchEvent;
	programmableSwitchOutputState: number;
	name?: string;
}

export interface StatelessProgrammableSwitch {
	programmableSwitchEvent: Enums.ProgrammableSwitchEvent;
	name?: string;
	serviceLabelIndex?: number;
}

export interface Switch {
	on: boolean;
	name?: string;
}

export interface TapManagement {
	active: Enums.Active;
	cryptoHash: Buffer;
	tapType: number;
	token: Buffer;
}

export interface TargetControl {
	active: Enums.Active;
	activeIdentifier: number;
	buttonEvent: Buffer;
	name?: string;
}

export interface TargetControlManagement {
	targetControlSupportedConfiguration: Buffer;
	targetControlList: Buffer;
}

export interface Television {
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
	mute: boolean;
	active?: Enums.Active;
	volume?: number;
	volumeControlType?: Enums.VolumeControlType;
	volumeSelector?: Enums.VolumeSelector;
}

export interface TemperatureSensor {
	currentTemperature: number;
	name?: string;
	statusActive?: boolean;
	statusFault?: Enums.StatusFault;
	statusLowBattery?: Enums.StatusLowBattery;
	statusTampered?: Enums.StatusTampered;
}

export interface Thermostat {
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
	supportedTransferTransportConfiguration: Buffer;
	setupTransferTransport: Buffer;
}

export interface Tunnel {
	accessoryIdentifier: string;
	tunnelConnectionTimeout: number;
	tunneledAccessoryAdvertising: boolean;
	tunneledAccessoryConnected: boolean;
	tunneledAccessoryStateNumber: number;
}

export interface Valve {
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
	wiFiSatelliteStatus: Enums.WiFiSatelliteStatus;
}

export interface WiFiTransport {
	currentTransport: boolean;
	wiFiCapabilities: number;
	wiFiConfigurationControl?: Buffer;
}

export interface Window {
	currentPosition: number;
	positionState: Enums.PositionState;
	targetPosition: number;
	name?: string;
	obstructionDetected?: boolean;
	holdPosition?: boolean;
}

export interface WindowCovering {
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


type IsKeyForService<T extends typeof Service, K extends keyof ServiceMap> =
	T extends ServiceMap[K] ? ServiceMap[K] extends T ? true : false : false;

//@ts-ignore
declare module 'hap-nodejs' {

	namespace _definitions {
		namespace Services {
			namespace AccessCode {
				export const interface: InterfaceMap['AccessCode'];
			}

			namespace AccessControl {
				export const interface: InterfaceMap['AccessControl'];
			}
			namespace AccessoryInformation {
				export const interface: InterfaceMap['AccessoryInformation'];
			}
			namespace AccessoryMetrics {
				export const interface: InterfaceMap['AccessoryMetrics'];
			}
			namespace AccessoryRuntimeInformation {
				export const interface: InterfaceMap['AccessoryRuntimeInformation'];
			}
			namespace AirPurifier {
				export const interface: InterfaceMap['AirPurifier'];
			}
			namespace AirQualitySensor {
				export const interface: InterfaceMap['AirQualitySensor'];
			}
			namespace AssetUpdate {
				export const interface: InterfaceMap['AssetUpdate'];
			}
			namespace Assistant {
				export const interface: InterfaceMap['Assistant'];
			}
			namespace AudioStreamManagement {
				export const interface: InterfaceMap['AudioStreamManagement'];
			}
			namespace Battery {
				export const interface: InterfaceMap['Battery'];
			}
			namespace CameraOperatingMode {
				export const interface: InterfaceMap['CameraOperatingMode'];
			}
			namespace CameraRecordingManagement {
				export const interface: InterfaceMap['CameraRecordingManagement'];
			}
			namespace CameraRTPStreamManagement {
				export const interface: InterfaceMap['CameraRTPStreamManagement'];
			}
			namespace CarbonDioxideSensor {
				export const interface: InterfaceMap['CarbonDioxideSensor'];
			}
			namespace CarbonMonoxideSensor {
				export const interface: InterfaceMap['CarbonMonoxideSensor'];
			}
			namespace CloudRelay {
				export const interface: InterfaceMap['CloudRelay'];
			}
			namespace ContactSensor {
				export const interface: InterfaceMap['ContactSensor'];
			}
			namespace DataStreamTransportManagement {
				export const interface: InterfaceMap['DataStreamTransportManagement'];
			}
			namespace Diagnostics {
				export const interface: InterfaceMap['Diagnostics'];
			}
			namespace Door {
				export const interface: InterfaceMap['Door'];
			}
			namespace Doorbell {
				export const interface: InterfaceMap['Doorbell'];
			}
			namespace Fan {
				export const interface: InterfaceMap['Fan'];
			}
			namespace Fanv2 {
				export const interface: InterfaceMap['Fanv2'];
			}
			namespace Faucet {
				export const interface: InterfaceMap['Faucet'];
			}
			namespace FilterMaintenance {
				export const interface: InterfaceMap['FilterMaintenance'];
			}
			namespace FirmwareUpdate {
				export const interface: InterfaceMap['FirmwareUpdate'];
			}
			namespace GarageDoorOpener {
				export const interface: InterfaceMap['GarageDoorOpener'];
			}
			namespace HeaterCooler {
				export const interface: InterfaceMap['HeaterCooler'];
			}
			namespace HumidifierDehumidifier {
				export const interface: InterfaceMap['HumidifierDehumidifier'];
			}
			namespace HumiditySensor {
				export const interface: InterfaceMap['HumiditySensor'];
			}
			namespace InputSource {
				export const interface: InterfaceMap['InputSource'];
			}
			namespace IrrigationSystem {
				export const interface: InterfaceMap['IrrigationSystem'];
			}
			namespace LeakSensor {
				export const interface: InterfaceMap['LeakSensor'];
			}
			namespace Lightbulb {
				export const interface: InterfaceMap['Lightbulb'];
			}
			namespace LightSensor {
				export const interface: InterfaceMap['LightSensor'];
			}
			namespace LockManagement {
				export const interface: InterfaceMap['LockManagement'];
			}
			namespace LockMechanism {
				export const interface: InterfaceMap['LockMechanism'];
			}
			namespace Microphone {
				export const interface: InterfaceMap['Microphone'];
			}
			namespace MotionSensor {
				export const interface: InterfaceMap['MotionSensor'];
			}
			namespace NFCAccess {
				export const interface: InterfaceMap['NFCAccess'];
			}
			namespace OccupancySensor {
				export const interface: InterfaceMap['OccupancySensor'];
			}
			namespace Outlet {
				export const interface: InterfaceMap['Outlet'];
			}
			namespace Pairing {
				export const interface: InterfaceMap['Pairing'];
			}
			namespace PowerManagement {
				export const interface: InterfaceMap['PowerManagement'];
			}
			namespace ProtocolInformation {
				export const interface: InterfaceMap['ProtocolInformation'];
			}
			namespace SecuritySystem {
				export const interface: InterfaceMap['SecuritySystem'];
			}
			namespace ServiceLabel {
				export const interface: InterfaceMap['ServiceLabel'];
			}
			namespace Siri {
				export const interface: InterfaceMap['Siri'];
			}
			namespace SiriEndpoint {
				export const interface: InterfaceMap['SiriEndpoint'];
			}
			namespace Slats {
				export const interface: InterfaceMap['Slats'];
			}
			namespace SmartSpeaker {
				export const interface: InterfaceMap['SmartSpeaker'];
			}
			namespace SmokeSensor {
				export const interface: InterfaceMap['SmokeSensor'];
			}
			namespace Speaker {
				export const interface: InterfaceMap['Speaker'];
			}
			namespace StatefulProgrammableSwitch {
				export const interface: InterfaceMap['StatefulProgrammableSwitch'];
			}
			namespace StatelessProgrammableSwitch {
				export const interface: InterfaceMap['StatelessProgrammableSwitch'];
			}
			namespace Switch {
				export const interface: InterfaceMap['Switch'];
			}
			namespace TapManagement {
				export const interface: InterfaceMap['TapManagement'];
			}
			namespace TargetControl {
				export const interface: InterfaceMap['TargetControl'];
			}
			namespace TargetControlManagement {
				export const interface: InterfaceMap['TargetControlManagement'];
			}
			namespace Television {
				export const interface: InterfaceMap['Television'];
			}
			namespace TelevisionSpeaker {
				export const interface: InterfaceMap['TelevisionSpeaker'];
			}
			namespace TemperatureSensor {
				export const interface: InterfaceMap['TemperatureSensor'];
			}
			namespace Thermostat {
				export const interface: InterfaceMap['Thermostat'];
			}
			namespace ThreadTransport {
				export const interface: InterfaceMap['ThreadTransport'];
			}
			namespace TransferTransportManagement {
				export const interface: InterfaceMap['TransferTransportManagement'];
			}
			namespace Tunnel {
				export const interface: InterfaceMap['Tunnel'];
			}
			namespace Valve {
				export const interface: InterfaceMap['Valve'];
			}
			namespace WiFiRouter {
				export const interface: InterfaceMap['WiFiRouter'];
			}
			namespace WiFiSatellite {
				export const interface: InterfaceMap['WiFiSatellite'];
			}
			namespace WiFiTransport {
				export const interface: InterfaceMap['WiFiTransport'];
			}
			namespace Window {
				export const interface: InterfaceMap['Window'];
			}
			namespace WindowCovering {
				export const interface: InterfaceMap['WindowCovering'];
			}
		}
	}
}
