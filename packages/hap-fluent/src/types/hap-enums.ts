// Auto-generated HAP Enums

import { Characteristic } from "hap-nodejs";

export namespace Enums {
  /** Accessory capability flags (requires additional setup, etc.) */
  export const enum AccessoryFlags {
    RequiresAdditionalSetupBitMask = 1,
  }

  /** Active/inactive state for accessories */
  export const enum Active {
    Inactive = 0,
    Active = 1,
  }

  /** Particulate matter size categories for air quality sensors */
  export const enum AirParticulateSize {
    "2.5M" = 0,
    "10M" = 1,
  }

  /** Air quality levels from excellent to poor */
  export const enum AirQuality {
    Unknown = 0,
    Excellent = 1,
    Good = 2,
    Fair = 3,
    Inferior = 4,
    Poor = 5,
  }

  /** Camera operating mode indicator enable/disable state */
  export const enum CameraOperatingModeIndicator {
    Disable = 0,
    Enable = 1,
  }

  /** Carbon dioxide detection state (normal or abnormal CO2 levels) */
  export const enum CarbonDioxideDetected {
    Co2LevelsNormal = 0,
    Co2LevelsAbnormal = 1,
  }

  /** Carbon monoxide detection state (normal or abnormal CO levels) */
  export const enum CarbonMonoxideDetected {
    CoLevelsNormal = 0,
    CoLevelsAbnormal = 1,
  }

  /** Battery charging states (not charging, charging, not chargeable) */
  export const enum ChargingState {
    NotCharging = 0,
    Charging = 1,
    NotChargeable = 2,
  }

  /** Closed captions enabled or disabled state */
  export const enum ClosedCaptions {
    Disabled = 0,
    Enabled = 1,
  }

  /** Contact sensor state (contact detected or not detected) */
  export const enum ContactSensorState {
    ContactDetected = 0,
    ContactNotDetected = 1,
  }

  /** Current operational state of an air purifier */
  export const enum CurrentAirPurifierState {
    Inactive = 0,
    Idle = 1,
    PurifyingAir = 2,
  }

  /** Door position states (open, closed, opening, closing, stopped) */
  export const enum CurrentDoorState {
    Open = 0,
    Closed = 1,
    Opening = 2,
    Closing = 3,
    Stopped = 4,
  }

  /** Current operational state of a fan */
  export const enum CurrentFanState {
    Inactive = 0,
    Idle = 1,
    BlowingAir = 2,
  }

  /** Current operational state of a heater/cooler (inactive, idle, heating, cooling) */
  export const enum CurrentHeaterCoolerState {
    Inactive = 0,
    Idle = 1,
    Heating = 2,
    Cooling = 3,
  }

  /** Current heating/cooling mode of a thermostat (off, heat, cool) */
  export const enum CurrentHeatingCoolingState {
    Off = 0,
    Heat = 1,
    Cool = 2,
  }

  /** Current operational state of a humidifier/dehumidifier */
  export const enum CurrentHumidifierDehumidifierState {
    Inactive = 0,
    Idle = 1,
    Humidifying = 2,
    Dehumidifying = 3,
  }

  /** Current playback state of a media device */
  export const enum CurrentMediaState {
    Play = 0,
    Pause = 1,
    Stop = 2,
    Loading = 4,
    Interrupted = 5,
  }

  /** Current position state of a slat (fixed, jammed, or swinging) */
  export const enum CurrentSlatState {
    Fixed = 0,
    Jammed = 1,
    Swinging = 2,
  }

  /** Current visibility state of a target (shown or hidden) */
  export const enum CurrentVisibilityState {
    Shown = 0,
    Hidden = 1,
  }

  /** Event snapshots active state (disable or enable) */
  export const enum EventSnapshotsActive {
    Disable = 0,
    Enable = 1,
  }

  /** Filter replacement indication state (OK or change required) */
  export const enum FilterChangeIndication {
    FilterOk = 0,
    ChangeFilter = 1,
  }

  /** HomeKit camera active state (off or on) */
  export const enum HomeKitCameraActive {
    Off = 0,
    On = 1,
  }

  /** Input device type categories for TV accessories */
  export const enum InputDeviceType {
    Other = 0,
    Tv = 1,
    Recording = 2,
    Tuner = 3,
    Playback = 4,
    AudioSystem = 5,
  }

  /** Input source type categories (HDMI, tuner, Airplay, USB, etc.) */
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
    Application = 10,
  }

  /** Resource in-use state (not in use or in use) */
  export const enum InUse {
    NotInUse = 0,
    InUse = 1,
  }

  /** Configuration state of an accessory or service (configured or not) */
  export const enum IsConfigured {
    NotConfigured = 0,
    Configured = 1,
  }

  /** Water leak detection state (leak detected or not detected) */
  export const enum LeakDetected {
    LeakNotDetected = 0,
    LeakDetected = 1,
  }

  /** Current lock mechanism state (unsecured, secured, jammed, unknown) */
  export const enum LockCurrentState {
    Unsecured = 0,
    Secured = 1,
    Jammed = 2,
    Unknown = 3,
  }

  /** Last known action that changed the lock state (physical, keypad, remote, etc.) */
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
    UnsecuredPhysically = 10,
  }

  /** Physical control lock state (control lock enabled or disabled) */
  export const enum LockPhysicalControls {
    ControlLockDisabled = 0,
    ControlLockEnabled = 1,
  }

  /** Target lock state (unsecured or secured) */
  export const enum LockTargetState {
    Unsecured = 0,
    Secured = 1,
  }

  /** Managed network enable state (disabled or enabled) */
  export const enum ManagedNetworkEnable {
    Disabled = 0,
    Enabled = 1,
  }

  /** Manually disabled state (note: 0=enabled, 1=disabled) */
  export const enum ManuallyDisabled {
    Enabled = 0,
    Disabled = 1,
  }

  /** Occupancy sensor detection state (occupancy detected or not detected) */
  export const enum OccupancyDetected {
    OccupancyNotDetected = 0,
    OccupancyDetected = 1,
  }

  /** Periodic snapshots active state (disable or enable) */
  export const enum PeriodicSnapshotsActive {
    Disable = 0,
    Enable = 1,
  }

  /** Display picture mode presets (standard, vivid, game, calibrated, etc.) */
  export const enum PictureMode {
    Other = 0,
    Standard = 1,
    Calibrated = 2,
    CalibratedDark = 3,
    Vivid = 4,
    Game = 5,
    Computer = 6,
    Custom = 7,
  }

  /** Movement direction and state of a motorized position accessory */
  export const enum PositionState {
    Decreasing = 0,
    Increasing = 1,
    Stopped = 2,
  }

  /** Power mode selection for TV-like accessories (show or hide) */
  export const enum PowerModeSelection {
    Show = 0,
    Hide = 1,
  }

  /** Programmable switch event types (single press, double press, long press) */
  export const enum ProgrammableSwitchEvent {
    SinglePress = 0,
    DoublePress = 1,
    LongPress = 2,
  }

  /** Irrigation program scheduling modes (none, scheduled, manual override) */
  export const enum ProgramMode {
    NoProgramScheduled = 0,
    ProgramScheduled = 1,
    ProgramScheduledManualMode = 2,
  }

  /** Recording audio active state (disable or enable) */
  export const enum RecordingAudioActive {
    Disable = 0,
    Enable = 1,
  }

  /** Remote control key commands for TV/media accessories */
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
    Information = 15,
  }

  /** Fan or motor rotation direction (clockwise or counter-clockwise) */
  export const enum RotationDirection {
    Clockwise = 0,
    CounterClockwise = 1,
  }

  /** Router operational readiness state (ready or not ready) */
  export const enum RouterStatus {
    Ready = 0,
    NotReady = 1,
  }

  /** Security system alarm type (no alarm or unknown alarm type) */
  export const enum SecuritySystemAlarmType {
    NoAlarm = 0,
    Unknown = 1,
  }

  /** Current security system arm state (stay, away, night, disarmed, or triggered) */
  export const enum SecuritySystemCurrentState {
    StayArm = 0,
    AwayArm = 1,
    NightArm = 2,
    Disarmed = 3,
    AlarmTriggered = 4,
  }

  /** Target security system arm state (stay, away, night, or disarm) */
  export const enum SecuritySystemTargetState {
    StayArm = 0,
    AwayArm = 1,
    NightArm = 2,
    Disarm = 3,
  }

  /** Labeling namespace for service label indices (dots or arabic numerals) */
  export const enum ServiceLabelNamespace {
    Dots = 0,
    ArabicNumerals = 1,
  }

  /** Siri input trigger type for Siri-enabled accessories */
  export const enum SiriInputType {
    PushButtonTriggeredAppleTv = 0,
  }

  /** Slat orientation type (horizontal or vertical) */
  export const enum SlatType {
    Horizontal = 0,
    Vertical = 1,
  }

  /** Accessory sleep discovery mode (not discoverable or always discoverable) */
  export const enum SleepDiscoveryMode {
    NotDiscoverable = 0,
    AlwaysDiscoverable = 1,
  }

  /** Smoke detection state (smoke detected or not detected) */
  export const enum SmokeDetected {
    SmokeNotDetected = 0,
    SmokeDetected = 1,
  }

  /** Accessory fault status (no fault or general fault) */
  export const enum StatusFault {
    NoFault = 0,
    GeneralFault = 1,
  }

  /** Jam status of a motorized accessory (not jammed or jammed) */
  export const enum StatusJammed {
    NotJammed = 0,
    Jammed = 1,
  }

  /** Battery level status (normal or low battery) */
  export const enum StatusLowBattery {
    BatteryLevelNormal = 0,
    BatteryLevelLow = 1,
  }

  /** Tamper detection status of an accessory (not tampered or tampered) */
  export const enum StatusTampered {
    NotTampered = 0,
    Tampered = 1,
  }

  /** Fan or air vent swing mode (swing disabled or enabled) */
  export const enum SwingMode {
    SwingDisabled = 0,
    SwingEnabled = 1,
  }

  /** Target operating mode for an air purifier (manual or auto) */
  export const enum TargetAirPurifierState {
    Manual = 0,
    Auto = 1,
  }

  /** Target door state to achieve (open or closed) */
  export const enum TargetDoorState {
    Open = 0,
    Closed = 1,
  }

  /** Target fan operating mode (manual or auto) */
  export const enum TargetFanState {
    Manual = 0,
    Auto = 1,
  }

  /** Target heater/cooler mode (auto, heat, or cool) */
  export const enum TargetHeaterCoolerState {
    Auto = 0,
    Heat = 1,
    Cool = 2,
  }

  /** Target thermostat heating/cooling mode (off, heat, cool, or auto) */
  export const enum TargetHeatingCoolingState {
    Off = 0,
    Heat = 1,
    Cool = 2,
    Auto = 3,
  }

  /** Target humidifier/dehumidifier operating mode */
  export const enum TargetHumidifierDehumidifierState {
    HumidifierOrDehumidifier = 0,
    Humidifier = 1,
    Dehumidifier = 2,
  }

  /** Target playback state for a media device (play, pause, or stop) */
  export const enum TargetMediaState {
    Play = 0,
    Pause = 1,
    Stop = 2,
  }

  /** Target visibility state to achieve (shown or hidden) */
  export const enum TargetVisibilityState {
    Shown = 0,
    Hidden = 1,
  }

  /** Temperature display unit preference (Celsius or Fahrenheit) */
  export const enum TemperatureDisplayUnits {
    Celsius = 0,
    Fahrenheit = 1,
  }

  /** Third-party camera active state (off or on) */
  export const enum ThirdPartyCameraActive {
    Off = 0,
    On = 1,
  }

  /** Valve type categories (generic, irrigation, shower head, water faucet) */
  export const enum ValveType {
    GenericValve = 0,
    Irrigation = 1,
    ShowerHead = 2,
    WaterFaucet = 3,
  }

  /** Volume control type supported by a speaker (none, relative, relative with current, absolute) */
  export const enum VolumeControlType {
    None = 0,
    Relative = 1,
    RelativeWithCurrent = 2,
    Absolute = 3,
  }

  /** Volume adjustment direction (increment or decrement) */
  export const enum VolumeSelector {
    Increment = 0,
    Decrement = 1,
  }

  /** Wi-Fi satellite node connection status (unknown, connected, not connected) */
  export const enum WiFiSatelliteStatus {
    Unknown = 0,
    Connected = 1,
    NotConnected = 2,
  }
}
