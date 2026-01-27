import type { InterfaceMap } from "./hap-interfaces.ts";

declare module "hap-nodejs" {
  namespace _definitions {
    namespace Services {
      namespace AccessCode {
        export const interface: InterfaceMap["AccessCode"];

        export const serviceName: "AccessCode";
      }
      namespace AccessControl {
        export const interface: InterfaceMap["AccessControl"];

        export const serviceName: "AccessControl";
      }
      namespace AccessoryInformation {
        export const interface: InterfaceMap["AccessoryInformation"];

        export const serviceName: "AccessoryInformation";
      }
      namespace AccessoryMetrics {
        export const interface: InterfaceMap["AccessoryMetrics"];

        export const serviceName: "AccessoryMetrics";
      }
      namespace AccessoryRuntimeInformation {
        export const interface: InterfaceMap["AccessoryRuntimeInformation"];

        export const serviceName: "AccessoryRuntimeInformation";
      }
      namespace AirPurifier {
        export const interface: InterfaceMap["AirPurifier"];

        export const serviceName: "AirPurifier";
      }
      namespace AirQualitySensor {
        export const interface: InterfaceMap["AirQualitySensor"];

        export const serviceName: "AirQualitySensor";
      }
      namespace AssetUpdate {
        export const interface: InterfaceMap["AssetUpdate"];

        export const serviceName: "AssetUpdate";
      }
      namespace Assistant {
        export const interface: InterfaceMap["Assistant"];

        export const serviceName: "Assistant";
      }
      namespace AudioStreamManagement {
        export const interface: InterfaceMap["AudioStreamManagement"];

        export const serviceName: "AudioStreamManagement";
      }
      namespace Battery {
        export const interface: InterfaceMap["Battery"];

        export const serviceName: "Battery";
      }
      namespace CameraOperatingMode {
        export const interface: InterfaceMap["CameraOperatingMode"];

        export const serviceName: "CameraOperatingMode";
      }
      namespace CameraRecordingManagement {
        export const interface: InterfaceMap["CameraRecordingManagement"];

        export const serviceName: "CameraRecordingManagement";
      }
      namespace CameraRTPStreamManagement {
        export const interface: InterfaceMap["CameraRTPStreamManagement"];

        export const serviceName: "CameraRTPStreamManagement";
      }
      namespace CarbonDioxideSensor {
        export const interface: InterfaceMap["CarbonDioxideSensor"];

        export const serviceName: "CarbonDioxideSensor";
      }
      namespace CarbonMonoxideSensor {
        export const interface: InterfaceMap["CarbonMonoxideSensor"];

        export const serviceName: "CarbonMonoxideSensor";
      }
      namespace CloudRelay {
        export const interface: InterfaceMap["CloudRelay"];

        export const serviceName: "CloudRelay";
      }
      namespace ContactSensor {
        export const interface: InterfaceMap["ContactSensor"];

        export const serviceName: "ContactSensor";
      }
      namespace DataStreamTransportManagement {
        export const interface: InterfaceMap["DataStreamTransportManagement"];

        export const serviceName: "DataStreamTransportManagement";
      }
      namespace Diagnostics {
        export const interface: InterfaceMap["Diagnostics"];

        export const serviceName: "Diagnostics";
      }
      namespace Door {
        export const interface: InterfaceMap["Door"];

        export const serviceName: "Door";
      }
      namespace Doorbell {
        export const interface: InterfaceMap["Doorbell"];

        export const serviceName: "Doorbell";
      }
      namespace Fan {
        export const interface: InterfaceMap["Fan"];

        export const serviceName: "Fan";
      }
      namespace Fanv2 {
        export const interface: InterfaceMap["Fanv2"];

        export const serviceName: "Fanv2";
      }
      namespace Faucet {
        export const interface: InterfaceMap["Faucet"];

        export const serviceName: "Faucet";
      }
      namespace FilterMaintenance {
        export const interface: InterfaceMap["FilterMaintenance"];

        export const serviceName: "FilterMaintenance";
      }
      namespace FirmwareUpdate {
        export const interface: InterfaceMap["FirmwareUpdate"];

        export const serviceName: "FirmwareUpdate";
      }
      namespace GarageDoorOpener {
        export const interface: InterfaceMap["GarageDoorOpener"];

        export const serviceName: "GarageDoorOpener";
      }
      namespace HeaterCooler {
        export const interface: InterfaceMap["HeaterCooler"];

        export const serviceName: "HeaterCooler";
      }
      namespace HumidifierDehumidifier {
        export const interface: InterfaceMap["HumidifierDehumidifier"];

        export const serviceName: "HumidifierDehumidifier";
      }
      namespace HumiditySensor {
        export const interface: InterfaceMap["HumiditySensor"];

        export const serviceName: "HumiditySensor";
      }
      namespace InputSource {
        export const interface: InterfaceMap["InputSource"];

        export const serviceName: "InputSource";
      }
      namespace IrrigationSystem {
        export const interface: InterfaceMap["IrrigationSystem"];

        export const serviceName: "IrrigationSystem";
      }
      namespace LeakSensor {
        export const interface: InterfaceMap["LeakSensor"];

        export const serviceName: "LeakSensor";
      }
      namespace Lightbulb {
        export const interface: InterfaceMap["Lightbulb"];

        export const serviceName: "Lightbulb";
      }
      namespace LightSensor {
        export const interface: InterfaceMap["LightSensor"];

        export const serviceName: "LightSensor";
      }
      namespace LockManagement {
        export const interface: InterfaceMap["LockManagement"];

        export const serviceName: "LockManagement";
      }
      namespace LockMechanism {
        export const interface: InterfaceMap["LockMechanism"];

        export const serviceName: "LockMechanism";
      }
      namespace Microphone {
        export const interface: InterfaceMap["Microphone"];

        export const serviceName: "Microphone";
      }
      namespace MotionSensor {
        export const interface: InterfaceMap["MotionSensor"];

        export const serviceName: "MotionSensor";
      }
      namespace NFCAccess {
        export const interface: InterfaceMap["NFCAccess"];

        export const serviceName: "NFCAccess";
      }
      namespace OccupancySensor {
        export const interface: InterfaceMap["OccupancySensor"];

        export const serviceName: "OccupancySensor";
      }
      namespace Outlet {
        export const interface: InterfaceMap["Outlet"];

        export const serviceName: "Outlet";
      }
      namespace Pairing {
        export const interface: InterfaceMap["Pairing"];

        export const serviceName: "Pairing";
      }
      namespace PowerManagement {
        export const interface: InterfaceMap["PowerManagement"];

        export const serviceName: "PowerManagement";
      }
      namespace ProtocolInformation {
        export const interface: InterfaceMap["ProtocolInformation"];

        export const serviceName: "ProtocolInformation";
      }
      namespace SecuritySystem {
        export const interface: InterfaceMap["SecuritySystem"];

        export const serviceName: "SecuritySystem";
      }
      namespace ServiceLabel {
        export const interface: InterfaceMap["ServiceLabel"];

        export const serviceName: "ServiceLabel";
      }
      namespace Siri {
        export const interface: InterfaceMap["Siri"];

        export const serviceName: "Siri";
      }
      namespace SiriEndpoint {
        export const interface: InterfaceMap["SiriEndpoint"];

        export const serviceName: "SiriEndpoint";
      }
      namespace Slats {
        export const interface: InterfaceMap["Slats"];

        export const serviceName: "Slats";
      }
      namespace SmartSpeaker {
        export const interface: InterfaceMap["SmartSpeaker"];

        export const serviceName: "SmartSpeaker";
      }
      namespace SmokeSensor {
        export const interface: InterfaceMap["SmokeSensor"];

        export const serviceName: "SmokeSensor";
      }
      namespace Speaker {
        export const interface: InterfaceMap["Speaker"];

        export const serviceName: "Speaker";
      }
      namespace StatefulProgrammableSwitch {
        export const interface: InterfaceMap["StatefulProgrammableSwitch"];

        export const serviceName: "StatefulProgrammableSwitch";
      }
      namespace StatelessProgrammableSwitch {
        export const interface: InterfaceMap["StatelessProgrammableSwitch"];

        export const serviceName: "StatelessProgrammableSwitch";
      }
      namespace Switch {
        export const interface: InterfaceMap["Switch"];

        export const serviceName: "Switch";
      }
      namespace TapManagement {
        export const interface: InterfaceMap["TapManagement"];

        export const serviceName: "TapManagement";
      }
      namespace TargetControl {
        export const interface: InterfaceMap["TargetControl"];

        export const serviceName: "TargetControl";
      }
      namespace TargetControlManagement {
        export const interface: InterfaceMap["TargetControlManagement"];

        export const serviceName: "TargetControlManagement";
      }
      namespace Television {
        export const interface: InterfaceMap["Television"];

        export const serviceName: "Television";
      }
      namespace TelevisionSpeaker {
        export const interface: InterfaceMap["TelevisionSpeaker"];

        export const serviceName: "TelevisionSpeaker";
      }
      namespace TemperatureSensor {
        export const interface: InterfaceMap["TemperatureSensor"];

        export const serviceName: "TemperatureSensor";
      }
      namespace Thermostat {
        export const interface: InterfaceMap["Thermostat"];

        export const serviceName: "Thermostat";
      }
      namespace ThreadTransport {
        export const interface: InterfaceMap["ThreadTransport"];

        export const serviceName: "ThreadTransport";
      }
      namespace TransferTransportManagement {
        export const interface: InterfaceMap["TransferTransportManagement"];

        export const serviceName: "TransferTransportManagement";
      }
      namespace Tunnel {
        export const interface: InterfaceMap["Tunnel"];

        export const serviceName: "Tunnel";
      }
      namespace Valve {
        export const interface: InterfaceMap["Valve"];

        export const serviceName: "Valve";
      }
      namespace WiFiRouter {
        export const interface: InterfaceMap["WiFiRouter"];

        export const serviceName: "WiFiRouter";
      }
      namespace WiFiSatellite {
        export const interface: InterfaceMap["WiFiSatellite"];

        export const serviceName: "WiFiSatellite";
      }
      namespace WiFiTransport {
        export const interface: InterfaceMap["WiFiTransport"];

        export const serviceName: "WiFiTransport";
      }
      namespace Window {
        export const interface: InterfaceMap["Window"];

        export const serviceName: "Window";
      }
      namespace WindowCovering {
        export const interface: InterfaceMap["WindowCovering"];

        export const serviceName: "WindowCovering";
      }
    }
  }
}
