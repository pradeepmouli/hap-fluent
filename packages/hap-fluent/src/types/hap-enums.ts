// Auto-generated HAP Enums

import { Characteristic } from 'hap-nodejs';

export namespace Enums {
	export const enum AccessoryFlags {
		RequiresAdditionalSetupBitMask = 1
	}

	export const enum Active {
		Inactive = 0,
		Active = 1
	}

	export const enum AirParticulateSize {
		'2.5M' = 0,
		'10M' = 1
	}

	export const enum AirQuality {
		Unknown = 0,
		Excellent = 1,
		Good = 2,
		Fair = 3,
		Inferior = 4,
		Poor = 5
	}

	export const enum CameraOperatingModeIndicator {
		Disable = 0,
		Enable = 1
	}

	export const enum CarbonDioxideDetected {
		Co2LevelsNormal = 0,
		Co2LevelsAbnormal = 1
	}

	export const enum CarbonMonoxideDetected {
		CoLevelsNormal = 0,
		CoLevelsAbnormal = 1
	}

	export const enum ChargingState {
		NotCharging = 0,
		Charging = 1,
		NotChargeable = 2
	}

	export const enum ClosedCaptions {
		Disabled = 0,
		Enabled = 1
	}

	export const enum ContactSensorState {
		ContactDetected = 0,
		ContactNotDetected = 1
	}

	export const enum CurrentAirPurifierState {
		Inactive = 0,
		Idle = 1,
		PurifyingAir = 2
	}

	export const enum CurrentDoorState {
		Open = 0,
		Closed = 1,
		Opening = 2,
		Closing = 3,
		Stopped = 4
	}

	export const enum CurrentFanState {
		Inactive = 0,
		Idle = 1,
		BlowingAir = 2
	}

	export const enum CurrentHeaterCoolerState {
		Inactive = 0,
		Idle = 1,
		Heating = 2,
		Cooling = 3
	}

	export const enum CurrentHeatingCoolingState {
		Off = 0,
		Heat = 1,
		Cool = 2
	}

	export const enum CurrentHumidifierDehumidifierState {
		Inactive = 0,
		Idle = 1,
		Humidifying = 2,
		Dehumidifying = 3
	}

	export const enum CurrentMediaState {
		Play = 0,
		Pause = 1,
		Stop = 2,
		Loading = 4,
		Interrupted = 5
	}

	export const enum CurrentSlatState {
		Fixed = 0,
		Jammed = 1,
		Swinging = 2
	}

	export const enum CurrentVisibilityState {
		Shown = 0,
		Hidden = 1
	}

	export const enum EventSnapshotsActive {
		Disable = 0,
		Enable = 1
	}

	export const enum FilterChangeIndication {
		FilterOk = 0,
		ChangeFilter = 1
	}

	export const enum HomeKitCameraActive {
		Off = 0,
		On = 1
	}

	export const enum InputDeviceType {
		Other = 0,
		Tv = 1,
		Recording = 2,
		Tuner = 3,
		Playback = 4,
		AudioSystem = 5
	}

	export const enum InputSourceType {
		Other = 0,
		HomeScreen = 1,
		Tuner = 2,
		Hdmi = 3,
		CompositeVideo = 4,
		SVideo = 5,
		ComponentVideo = 6,
		Dvi = 7,
		Airplay = 8,
		Usb = 9,
		Application = 10
	}

	export const enum InUse {
		NotInUse = 0,
		InUse = 1
	}

	export const enum IsConfigured {
		NotConfigured = 0,
		Configured = 1
	}

	export const enum LeakDetected {
		LeakNotDetected = 0,
		LeakDetected = 1
	}

	export const enum LockCurrentState {
		Unsecured = 0,
		Secured = 1,
		Jammed = 2,
		Unknown = 3
	}

	export const enum LockLastKnownAction {
		SecuredPhysicallyInterior = 0,
		UnsecuredPhysicallyInterior = 1,
		SecuredPhysicallyExterior = 2,
		UnsecuredPhysicallyExterior = 3,
		SecuredByKeypad = 4,
		UnsecuredByKeypad = 5,
		SecuredRemotely = 6,
		UnsecuredRemotely = 7,
		SecuredByAutoSecureTimeout = 8,
		SecuredPhysically = 9,
		UnsecuredPhysically = 10
	}

	export const enum LockPhysicalControls {
		ControlLockDisabled = 0,
		ControlLockEnabled = 1
	}

	export const enum LockTargetState {
		Unsecured = 0,
		Secured = 1
	}

	export const enum ManagedNetworkEnable {
		Disabled = 0,
		Enabled = 1
	}

	export const enum ManuallyDisabled {
		Enabled = 0,
		Disabled = 1
	}

	export const enum OccupancyDetected {
		OccupancyNotDetected = 0,
		OccupancyDetected = 1
	}

	export const enum PeriodicSnapshotsActive {
		Disable = 0,
		Enable = 1
	}

	export const enum PictureMode {
		Other = 0,
		Standard = 1,
		Calibrated = 2,
		CalibratedDark = 3,
		Vivid = 4,
		Game = 5,
		Computer = 6,
		Custom = 7
	}

	export const enum PositionState {
		Decreasing = 0,
		Increasing = 1,
		Stopped = 2
	}

	export const enum PowerModeSelection {
		Show = 0,
		Hide = 1
	}

	export const enum ProgrammableSwitchEvent {
		SinglePress = 0,
		DoublePress = 1,
		LongPress = 2
	}

	export const enum ProgramMode {
		NoProgramScheduled = 0,
		ProgramScheduled = 1,
		ProgramScheduledManualMode = 2
	}

	export const enum RecordingAudioActive {
		Disable = 0,
		Enable = 1
	}

	export const enum RemoteKey {
		Rewind = 0,
		FastForward = 1,
		NextTrack = 2,
		PreviousTrack = 3,
		ArrowUp = 4,
		ArrowDown = 5,
		ArrowLeft = 6,
		ArrowRight = 7,
		Select = 8,
		Back = 9,
		Exit = 10,
		PlayPause = 11,
		Information = 15
	}

	export const enum RotationDirection {
		Clockwise = 0,
		CounterClockwise = 1
	}

	export const enum RouterStatus {
		Ready = 0,
		NotReady = 1
	}

	export const enum SecuritySystemAlarmType {
		NoAlarm = 0,
		Unknown = 1
	}

	export const enum SecuritySystemCurrentState {
		StayArm = 0,
		AwayArm = 1,
		NightArm = 2,
		Disarmed = 3,
		AlarmTriggered = 4
	}

	export const enum SecuritySystemTargetState {
		StayArm = 0,
		AwayArm = 1,
		NightArm = 2,
		Disarm = 3
	}

	export const enum ServiceLabelNamespace {
		Dots = 0,
		ArabicNumerals = 1
	}

	export const enum SiriInputType {
		PushButtonTriggeredAppleTv = 0
	}

	export const enum SlatType {
		Horizontal = 0,
		Vertical = 1
	}

	export const enum SleepDiscoveryMode {
		NotDiscoverable = 0,
		AlwaysDiscoverable = 1
	}

	export const enum SmokeDetected {
		SmokeNotDetected = 0,
		SmokeDetected = 1
	}

	export const enum StatusFault {
		NoFault = 0,
		GeneralFault = 1
	}

	export const enum StatusJammed {
		NotJammed = 0,
		Jammed = 1
	}

	export const enum StatusLowBattery {
		BatteryLevelNormal = 0,
		BatteryLevelLow = 1
	}

	export const enum StatusTampered {
		NotTampered = 0,
		Tampered = 1
	}

	export const enum SwingMode {
		SwingDisabled = 0,
		SwingEnabled = 1
	}

	export const enum TargetAirPurifierState {
		Manual = 0,
		Auto = 1
	}

	export const enum TargetDoorState {
		Open = 0,
		Closed = 1
	}

	export const enum TargetFanState {
		Manual = 0,
		Auto = 1
	}

	export const enum TargetHeaterCoolerState {
		Auto = 0,
		Heat = 1,
		Cool = 2
	}

	export const enum TargetHeatingCoolingState {
		Off = 0,
		Heat = 1,
		Cool = 2,
		Auto = 3
	}

	export const enum TargetHumidifierDehumidifierState {
		HumidifierOrDehumidifier = 0,
		Humidifier = 1,
		Dehumidifier = 2
	}

	export const enum TargetMediaState {
		Play = 0,
		Pause = 1,
		Stop = 2
	}

	export const enum TargetVisibilityState {
		Shown = 0,
		Hidden = 1
	}

	export const enum TemperatureDisplayUnits {
		Celsius = 0,
		Fahrenheit = 1
	}

	export const enum ThirdPartyCameraActive {
		Off = 0,
		On = 1
	}

	export const enum ValveType {
		GenericValve = 0,
		Irrigation = 1,
		ShowerHead = 2,
		WaterFaucet = 3
	}

	export const enum VolumeControlType {
		None = 0,
		Relative = 1,
		RelativeWithCurrent = 2,
		Absolute = 3
	}

	export const enum VolumeSelector {
		Increment = 0,
		Decrement = 1
	}

	export const enum WiFiSatelliteStatus {
		Unknown = 0,
		Connected = 1,
		NotConnected = 2
	}
}
