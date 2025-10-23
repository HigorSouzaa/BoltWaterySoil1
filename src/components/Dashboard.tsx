import React, { useState, useEffect, useCallback } from "react";
import {
  Droplets,
  Leaf,
  Thermometer,
  BarChart3,
  Settings,
  User,
  LogOut,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  MapPin,
  Calendar,
  Cpu,
  Home,
  Edit,
} from "lucide-react";
import { EnvironmentManager } from "./EnvironmentManager";
import { UserSettings } from "./UserSettings";
import { WaterySoilModules } from "./WaterySoilModules";
import { MaintenanceSchedule } from "./MaintenanceSchedule";
import SensorCharts from "./SensorCharts";
import environmentService from "../services/environmentService";
import sectorService from "../services/sectorService";
import waterySoilModuleService, {
  WaterySoilModule,
} from "../services/waterySoilModuleService";
import {
  classifyVWC,
  classifyTemperature,
  classifyPH,
  classifyPhosphorus,
  classifyPotassium,
  getStatusColor,
  getStatusTip,
  type SoilType,
  type ParameterStatus
} from "../services/parameterClassification";

interface DashboardProps {
  onLogout: () => void;
}

interface UserPreferences {
  active_environment_id: string | null;
  active_sector_id: string | null;
}

interface DashboardEnvironment {
  _id: string;
  name: string;
}

interface DashboardSector {
  _id: string;
  name: string;
  environment_id: string;
}

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  parameterStatus?: ParameterStatus; // Novo: Ideal/Bom/Ruim
  statusTip?: string; // Novo: Dica contextual
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "environments"
    | "modules"
    | "maintenance"
    | "settings"
  >("dashboard");
  const [activeEnvironment, setActiveEnvironment] =
    useState<DashboardEnvironment | null>(null);
  const [activeSector, setActiveSector] = useState<DashboardSector | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [availableEnvironments, setAvailableEnvironments] = useState<any[]>([]);
  const [availableSectors, setAvailableSectors] = useState<any[]>([]);
  const [selectedEnvironmentId, setSelectedEnvironmentId] =
    useState<string>("");
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");
  const [modules, setModules] = useState<WaterySoilModule[]>([]);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [allUserModules, setAllUserModules] = useState<WaterySoilModule[]>([]);
  const [onlineSensorsCount, setOnlineSensorsCount] = useState({
    online: 0,
    total: 0,
  });

  const [alerts] = useState([
    {
      id: 1,
      type: "warning",
      message: "Sensor 3 precisa de calibração",
      time: "2h atrás",
    },
    {
      id: 2,
      type: "info",
      message: "Irrigação programada para 14:00",
      time: "4h atrás",
    },
    {
      id: 3,
      type: "success",
      message: "pH otimizado com sucesso",
      time: "1 dia atrás",
    },
  ]);

  useEffect(() => {
    loadActiveLocation();
  }, []);

  // Função auxiliar para calcular tendência comparando valor atual com anterior
  const calculateTrend = (currentValue: number, previousValue: number | undefined): "up" | "down" | "stable" => {
    if (previousValue === undefined) return "stable";

    const diff = currentValue - previousValue;
    const threshold = Math.abs(previousValue) * 0.02; // 2% de variação

    if (Math.abs(diff) < threshold) return "stable";
    return diff > 0 ? "up" : "down";
  };

  // Função para converter módulos WaterySoil em dados de sensores para exibição
  // Agora mostra os 4 sensores do Eco-Soil Pro de cada módulo com classificação
  const modulesToSensorData = useCallback(
    (modules: WaterySoilModule[]): SensorData[] => {
      const allSensors: SensorData[] = [];

      modules.forEach((module) => {
        // Obter tipo de solo (prioriza módulo, depois setor, padrão loam)
        const soilType: SoilType = (module.soil_type as SoilType) || 'loam';

        // Determina o status baseado no status do módulo
        let status: "good" | "warning" | "critical" = "good";
        if (module.status === "offline") status = "critical";
        else if (module.status === "error" || module.status === "maintenance")
          status = "warning";

        // Obter valores anteriores para calcular tendência
        const previousPh = (module.sensor_data?.ph as any)?.previous_value;
        const previousMoisture = (module.sensor_data?.soil_moisture as any)?.previous_value;
        const previousTemp = (module.sensor_data?.temperature as any)?.previous_value;
        const previousP = (module.sensor_data?.npk as any)?.previous_phosphorus;
        const previousK = (module.sensor_data?.npk as any)?.previous_potassium;

        // 1. pH do Solo
        if (module.sensor_data?.ph?.value !== undefined) {
          const phValue = module.sensor_data.ph.value;
          const parameterStatus = classifyPH(phValue);
          const statusTip = getStatusTip('ph', parameterStatus);
          const trend = calculateTrend(phValue, previousPh);

          allSensors.push({
            id: `${module._id}-ph`,
            name: "pH do Solo",
            value: phValue,
            unit: "pH",
            status,
            parameterStatus,
            statusTip,
            trend,
            icon: <Leaf className="h-8 w-8" />,
            color: "text-green-600",
            bgColor: "bg-green-50",
          });
        }

        // 2. Nutrientes NPK (mostra P e K separadamente)
        if (module.sensor_data?.npk) {
          const phosphorus = module.sensor_data.npk.phosphorus;
          const potassium = module.sensor_data.npk.potassium;

          if (phosphorus !== undefined && potassium !== undefined) {
            // Classificar P e K
            const pStatus = classifyPhosphorus(phosphorus);
            const kStatus = classifyPotassium(potassium);

            // Status global: pior dos dois
            const parameterStatus = pStatus === 'Ruim' || kStatus === 'Ruim' ? 'Ruim' :
                                   pStatus === 'Bom' || kStatus === 'Bom' ? 'Bom' : 'Ideal';

            // Mostrar faixas ideais de referência ao invés dos valores atuais
            const statusTip = `P: ideal (20-40 ppm), K: ideal (100-150 ppm)`;

            // Mostrar média para visualização
            const npkAvg = (phosphorus + potassium) / 2;
            const previousNpkAvg = (previousP !== undefined && previousK !== undefined)
              ? (previousP + previousK) / 2
              : undefined;
            const trend = calculateTrend(npkAvg, previousNpkAvg);

            allSensors.push({
              id: `${module._id}-npk`,
              name: "Nutrientes P/K",
              value: npkAvg,
              unit: "ppm",
              status,
              parameterStatus,
              statusTip,
              trend,
              icon: <Activity className="h-8 w-8" />,
              color: "text-purple-600",
              bgColor: "bg-purple-50",
            });
          }
        }

        // 3. Umidade do Solo
        if (module.sensor_data?.soil_moisture?.value !== undefined) {
          const moistureValue = module.sensor_data.soil_moisture.value;
          const parameterStatus = classifyVWC(moistureValue, soilType);
          const statusTip = getStatusTip('moisture', parameterStatus, soilType);
          const trend = calculateTrend(moistureValue, previousMoisture);

          allSensors.push({
            id: `${module._id}-moisture`,
            name: "Umidade do Solo",
            value: moistureValue,
            unit: "%",
            status,
            parameterStatus,
            statusTip,
            trend,
            icon: <Droplets className="h-8 w-8" />,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          });
        }

        // 4. Temperatura
        if (module.sensor_data?.temperature?.value !== undefined) {
          const tempValue = module.sensor_data.temperature.value;
          const parameterStatus = classifyTemperature(tempValue);
          const statusTip = getStatusTip('temperature', parameterStatus);
          const trend = calculateTrend(tempValue, previousTemp);

          allSensors.push({
            id: `${module._id}-temp`,
            name: "Temperatura",
            value: tempValue,
            unit: "°C",
            status,
            parameterStatus,
            statusTip,
            trend,
            icon: <Thermometer className="h-8 w-8" />,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
          });
        }
      });

      return allSensors;
    },
    []
  );

  // Função para carregar TODOS os módulos do usuário (para contar sensores online/total)
  const loadAllUserModules = useCallback(async () => {
    try {
      const modulesData = await waterySoilModuleService.getWaterySoilModules();
      setAllUserModules(modulesData || []);

      // Calcular sensores online/total de TODOS os módulos do usuário
      const online =
        modulesData?.filter((m) => m.status === "operational").length || 0;
      const total = modulesData?.length || 0;
      setOnlineSensorsCount({ online, total });
    } catch (error) {
      console.error("Erro ao carregar módulos do usuário:", error);
    }
  }, []);

  // Função para carregar os módulos do setor ativo
  const loadModules = useCallback(async () => {
    if (!activeSector?._id) return;

    try {
      const modulesData = await waterySoilModuleService.getWaterySoilModules(
        activeSector._id
      );
      setModules(modulesData || []);

      // Converte módulos em dados de sensores para o dashboard
      const sensors = modulesToSensorData(modulesData || []);
      setSensorData(sensors);
    } catch (error) {
      console.error("Error loading modules:", error);
    }
  }, [activeSector, modulesToSensorData]);

  // Carregar módulos quando o setor ativo mudar
  useEffect(() => {
    if (activeSector?._id) {
      loadModules();
      const interval = setInterval(loadModules, 2000); // ⚡ Atualiza a cada 2 segundos
      return () => clearInterval(interval);
    }
  }, [activeSector, loadModules]);

  // Carregar todos os módulos do usuário quando o componente montar
  useEffect(() => {
    loadAllUserModules();
    const interval = setInterval(loadAllUserModules, 2000); // ⚡ Atualiza a cada 2 segundos
    return () => clearInterval(interval);
  }, [loadAllUserModules]);

  const loadActiveLocation = async () => {
    try {
      // Por enquanto, vamos carregar o primeiro ambiente e setor disponível
      const environments = await environmentService.getEnvironments();
      if (environments && environments.length > 0) {
        const firstEnv = environments[0];
        setActiveEnvironment({ _id: firstEnv._id, name: firstEnv.name });

        const sectors = await sectorService.getSectors(firstEnv._id);
        if (sectors && sectors.length > 0) {
          const firstSector = sectors[0];
          // Extrai o ID do environment_id, seja ele string ou objeto
          const environmentId =
            typeof firstSector.environment_id === "string"
              ? firstSector.environment_id
              : firstSector.environment_id._id;

          setActiveSector({
            _id: firstSector._id,
            name: firstSector.name,
            environment_id: environmentId,
          });
        }
      }
    } catch (error) {
      console.error("Error loading active location:", error);
    }
  };

  // SIMULAÇÃO DE VALORES DESABILITADA - Agora usa valores reais do banco
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setSensorData(prevData =>
  //       prevData.map(sensor => ({
  //         ...sensor,
  //         value: sensor.value + (Math.random() - 0.5) * 2
  //       }))
  //     );
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  // Função para carregar ambientes e setores disponíveis
  const loadAvailableData = async () => {
    try {
      const environments = await environmentService.getEnvironments();
      setAvailableEnvironments(environments);

      if (environments.length > 0) {
        const firstEnvId = selectedEnvironmentId || environments[0]._id;
        setSelectedEnvironmentId(firstEnvId);

        const sectors = await sectorService.getSectors(firstEnvId);
        setAvailableSectors(sectors);

        if (!selectedSectorId && sectors.length > 0) {
          setSelectedSectorId(sectors[0]._id);
        }
      }
    } catch (error) {
      console.error("Error loading available data:", error);
    }
  };

  // Função para abrir o modal de edição
  const openEditModal = async () => {
    setSelectedEnvironmentId(activeEnvironment?._id || "");
    setSelectedSectorId(activeSector?._id || "");
    await loadAvailableData();
    setShowEditModal(true);
  };

  // Função para salvar as alterações
  const saveChanges = async () => {
    try {
      if (selectedEnvironmentId && selectedSectorId) {
        const environment = availableEnvironments.find(
          (env) => env._id === selectedEnvironmentId
        );
        const sector = availableSectors.find(
          (sec) => sec._id === selectedSectorId
        );

        if (environment && sector) {
          setActiveEnvironment({
            _id: environment._id,
            name: environment.name,
          });
          setActiveSector({
            _id: sector._id,
            name: sector.name,
            environment_id: sector.environment_id,
          });
        }
      }
      setShowEditModal(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  // Função para carregar setores quando o ambiente muda
  const handleEnvironmentChange = async (environmentId: string) => {
    setSelectedEnvironmentId(environmentId);
    try {
      const sectors = await sectorService.getSectors(environmentId);
      setAvailableSectors(sectors);
      if (sectors.length > 0) {
        setSelectedSectorId(sectors[0]._id);
      }
    } catch (error) {
      console.error("Error loading sectors:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />; // ⬆️ Verde quando aumenta
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />; // ⬇️ Vermelho quando diminui
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Logo clicável */}
              <button
                onClick={() => setCurrentView("dashboard")}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Droplets className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  WaterySoil
                </span>
              </button>

              {/* Informações do ambiente/setor com botão de editar */}
              <div className="hidden sm:flex items-center space-x-2 ml-6">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {activeEnvironment && activeSector
                    ? `${activeEnvironment.name} - ${activeSector.name}`
                    : "Nenhum setor ativo"}
                </span>
                <button
                  onClick={openEditModal}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Editar ambiente e setor"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView("environments")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ambientes e Setores"
              >
                <Home className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentView("modules")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Módulos WaterySoil"
              >
                <Cpu className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentView("maintenance")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Manutenção"
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentView("settings")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configurações"
              >
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:block">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {currentView === "environments" ? (
        <EnvironmentManager />
      ) : currentView === "modules" ? (
        <WaterySoilModules />
      ) : currentView === "maintenance" ? (
        <MaintenanceSchedule />
      ) : currentView === "settings" ? (
        <UserSettings />
      ) : (
        // O bloco 'else' (renderização do dashboard)
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard de Monitoramento
            </h1>
            <p className="text-gray-600">
              {modules.length > 0
                ? modules[0].name
                : "Acompanhe seus sensores em tempo real e otimize sua produção"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {sensorData.map((sensor) => (
              <div
                key={sensor.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${sensor.bgColor}`}>
                    <div className={sensor.color}>{sensor.icon}</div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getStatusIcon(sensor.status)}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {sensor.name}
                </h3>
                <div className="flex items-end space-x-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {sensor.value.toFixed(1)}
                  </span>
                  <span className="text-lg text-gray-500 mb-1">
                    {sensor.unit}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {/* Status agronômico (Ideal/Bom/Ruim) */}
                  {sensor.parameterStatus && (
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium border ${
                          sensor.parameterStatus === "Ideal"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : sensor.parameterStatus === "Bom"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {sensor.parameterStatus === "Ideal" && "✓ "}
                        {sensor.parameterStatus === "Bom" && "⚠ "}
                        {sensor.parameterStatus === "Ruim" && "✗ "}
                        {sensor.parameterStatus}
                      </span>
                      <span className="text-xs text-gray-500">
                        Agora
                      </span>
                    </div>
                  )}

                  {/* Dica contextual */}
                  {sensor.statusTip && (
                    <p className="text-xs text-gray-500 italic">
                      {sensor.statusTip}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <div className="lg:col-span-2">
              <SensorCharts sectorId={activeSector?._id || null} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* System Status */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status do Sistema
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          onlineSensorsCount.online ===
                            onlineSensorsCount.total &&
                          onlineSensorsCount.total > 0
                            ? "bg-green-500"
                            : onlineSensorsCount.online > 0
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        Sensores Online
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        onlineSensorsCount.online ===
                          onlineSensorsCount.total &&
                        onlineSensorsCount.total > 0
                          ? "text-green-600"
                          : onlineSensorsCount.online > 0
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {onlineSensorsCount.online}/{onlineSensorsCount.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Sistema de Irrigação
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      Ativo
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Próxima Manutenção
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-amber-600">
                      5 dias
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Alertas Recentes
                </h3>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          alert.type === "success"
                            ? "bg-green-500"
                            : alert.type === "warning"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">
                        Ativar Irrigação
                      </span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        Ver Relatório
                      </span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-amber-600" />
                      <span className="text-sm text-amber-700 font-medium">
                        Configurar Alertas
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Ambiente e Setor */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Editar Ambiente e Setor
            </h3>

            <div className="space-y-4">
              {/* Seleção de Ambiente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ambiente
                </label>
                <select
                  value={selectedEnvironmentId}
                  onChange={(e) => handleEnvironmentChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableEnvironments.map((env) => (
                    <option key={env._id} value={env._id}>
                      {env.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Setor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setor
                </label>
                <select
                  value={selectedSectorId}
                  onChange={(e) => setSelectedSectorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={availableSectors.length === 0}
                >
                  {availableSectors.map((sector) => (
                    <option key={sector._id} value={sector._id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
                {availableSectors.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nenhum setor disponível para este ambiente
                  </p>
                )}
              </div>
            </div>

            {/* Botões do Modal */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveChanges}
                disabled={!selectedEnvironmentId || !selectedSectorId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
