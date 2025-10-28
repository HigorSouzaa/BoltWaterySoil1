import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Bell,
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
import alertService, { Alert, CreateAlertData } from "../services/alertService";
import {
  classifyVWC,
  classifyTemperature,
  classifyPH,
  classifyPhosphorus,
  classifyPotassium,
  getStatusColor,
  getStatusTip,
  type SoilType,
  type ParameterStatus,
} from "../services/parameterClassification";

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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<
    "dashboard" | "environments" | "modules" | "maintenance" | "settings"
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

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState<CreateAlertData>({
    type: "info",
    message: "",
    sector_id: "",
    source: "manual",
  });
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [showAlertSettingsModal, setShowAlertSettingsModal] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    humidity: { min: 20, max: 80, enabled: false },
    temperature: { min: 15, max: 35, enabled: false },
    ph: { min: 5.5, max: 7.5, enabled: false },
    emailNotifications: true,
    systemNotifications: true,
  });
  const [activeIrrigation, setActiveIrrigation] = useState<any>(null);
  const [irrigationTimer, setIrrigationTimer] = useState<number>(0);
  const [showIrrigationModal, setShowIrrigationModal] = useState(false);
  const [irrigationDuration, setIrrigationDuration] = useState(30);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Carregar alertas
  const loadAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const alertsData = await alertService.getAlerts({
        status: "active",
        limit: 5,
      });
      setAlerts(alertsData);

      // Contar alertas automáticos não lidos (criados nas últimas 24h)
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentAutoAlerts = alertsData.filter(
        (alert: Alert) =>
          alert.isAutomatic &&
          alert.status === "active" &&
          new Date(alert.createdAt).getTime() > oneDayAgo
      );
      setUnreadNotifications(recentAutoAlerts.length);
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Criar novo alerta
  const handleCreateAlert = async () => {
    if (!alertForm.message.trim()) {
      alert("Por favor, insira uma mensagem para o alerta");
      return;
    }

    try {
      await alertService.createAlert(alertForm);
      setShowCreateAlertModal(false);
      setAlertForm({
        type: "info",
        message: "",
        sector_id: "",
        source: "manual",
      });
      loadAlerts(); // Recarregar alertas
    } catch (error: any) {
      alert(error.message || "Erro ao criar alerta");
    }
  };

  // Resolver alerta
  const handleResolveAlert = async (alertId: string) => {
    try {
      await alertService.resolveAlert(alertId);
      loadAlerts(); // Recarregar alertas
    } catch (error: any) {
      alert(error.message || "Erro ao resolver alerta");
    }
  };

  // Deletar alerta
  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Tem certeza que deseja deletar este alerta?")) {
      return;
    }

    try {
      await alertService.deleteAlert(alertId);
      loadAlerts(); // Recarregar alertas
    } catch (error: any) {
      alert(error.message || "Erro ao deletar alerta");
    }
  };

  // Formatar tempo relativo
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return "1 dia atrás";
    return `${diffDays} dias atrás`;
  };

  // Carregar configurações de alertas
  const loadAlertSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/v1/users/alert-settings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAlertSettings(data.alertSettings);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de alertas:", error);
    }
  };

  // Salvar configurações de alertas
  const handleSaveAlertSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/v1/users/alert-settings",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ alertSettings }),
        }
      );

      if (response.ok) {
        alert("Configurações de alertas salvas com sucesso!");
        setShowAlertSettingsModal(false);
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao salvar configurações");
      }
    } catch (error: any) {
      alert(error.message || "Erro ao salvar configurações");
    }
  };

  // Carregar irrigação ativa
  const loadActiveIrrigation = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/v1/irrigation/active",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.irrigations && data.irrigations.length > 0) {
          setActiveIrrigation(data.irrigations[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar irrigação ativa:", error);
    }
  };

  // Iniciar irrigação
  const handleStartIrrigation = async () => {
    if (!activeSector?._id) {
      alert(
        "Por favor, selecione um setor primeiro. Clique no ícone de lápis no header para selecionar um ambiente e setor."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/v1/irrigation/start",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sector_id: activeSector._id,
            plannedDuration: irrigationDuration,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActiveIrrigation(data.irrigation);
        setShowIrrigationModal(false);
        setIrrigationTimer(0);
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao iniciar irrigação");
      }
    } catch (error: any) {
      alert(error.message || "Erro ao iniciar irrigação");
    }
  };

  // Parar irrigação
  const handleStopIrrigation = async () => {
    if (!activeIrrigation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/v1/irrigation/stop",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            irrigation_id: activeIrrigation._id,
          }),
        }
      );

      if (response.ok) {
        setActiveIrrigation(null);
        setIrrigationTimer(0);
        alert("Irrigação finalizada com sucesso!");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao parar irrigação");
      }
    } catch (error: any) {
      alert(error.message || "Erro ao parar irrigação");
    }
  };

  // Cancelar irrigação
  const handleCancelIrrigation = async () => {
    if (!activeIrrigation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/v1/irrigation/cancel",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            irrigation_id: activeIrrigation._id,
          }),
        }
      );

      if (response.ok) {
        setActiveIrrigation(null);
        setIrrigationTimer(0);
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao cancelar irrigação");
      }
    } catch (error: any) {
      alert(error.message || "Erro ao cancelar irrigação");
    }
  };

  // Formatar tempo de irrigação
  const formatIrrigationTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Buscar dados do relatório anual
  const handleFetchReport = async () => {
    if (!activeSector?._id) {
      alert(
        "Por favor, selecione um setor primeiro. Clique no ícone de lápis no header para selecionar um ambiente e setor."
      );
      return;
    }

    console.log("📊 Buscando relatório:", {
      sectorId: activeSector._id,
      sectorName: activeSector.name,
      year: reportYear,
    });

    setLoadingReport(true);
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:3000/api/v1/reports/annual/${activeSector._id}/${reportYear}`;
      console.log("🌐 URL da requisição:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Dados recebidos:", data);
        setReportData(data);
      } else {
        const error = await response.json();
        console.error("❌ Erro na resposta:", error);
        alert(error.message || "Erro ao buscar relatório");
      }
    } catch (error: any) {
      console.error("❌ Erro na requisição:", error);
      alert(error.message || "Erro ao buscar relatório");
    } finally {
      setLoadingReport(false);
    }
  };

  // Gerar PDF do relatório
  const handleGeneratePDF = async () => {
    if (!reportData) return;

    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      let yPos = 20;

      // Título
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235); // Azul
      doc.text("WaterySoil", 20, yPos);

      yPos += 10;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Relatório Anual ${reportData.year}`, 20, yPos);

      yPos += 8;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Setor: ${reportData.sector.name}`, 20, yPos);

      yPos += 8;
      doc.text(
        `Período: ${new Date(reportData.period.start).toLocaleDateString(
          "pt-BR"
        )} - ${new Date(reportData.period.end).toLocaleDateString("pt-BR")}`,
        20,
        yPos
      );

      yPos += 8;
      doc.text(`Total de Leituras: ${reportData.dataPoints}`, 20, yPos);

      yPos += 15;

      // Estatísticas Gerais
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Estatísticas Gerais", 20, yPos);
      yPos += 5;

      // Preparar dados da tabela de estatísticas gerais
      const statsTableBody = [
        [
          "Umidade (%)",
          reportData.statistics.humidity.min.toFixed(1),
          reportData.statistics.humidity.max.toFixed(1),
          reportData.statistics.humidity.avg.toFixed(1),
          reportData.statistics.humidity.count,
        ],
        [
          "Temperatura (°C)",
          reportData.statistics.temperature.min.toFixed(1),
          reportData.statistics.temperature.max.toFixed(1),
          reportData.statistics.temperature.avg.toFixed(1),
          reportData.statistics.temperature.count,
        ],
        [
          "pH",
          reportData.statistics.ph.min.toFixed(2),
          reportData.statistics.ph.max.toFixed(2),
          reportData.statistics.ph.avg.toFixed(2),
          reportData.statistics.ph.count,
        ],
      ];

      // Adicionar NPK se houver dados
      if (reportData.statistics.npk) {
        if (reportData.statistics.npk.nitrogen.count > 0) {
          statsTableBody.push([
            "Nitrogênio (mg/kg)",
            reportData.statistics.npk.nitrogen.min.toFixed(1),
            reportData.statistics.npk.nitrogen.max.toFixed(1),
            reportData.statistics.npk.nitrogen.avg.toFixed(1),
            reportData.statistics.npk.nitrogen.count,
          ]);
        }
        if (reportData.statistics.npk.phosphorus.count > 0) {
          statsTableBody.push([
            "Fósforo (mg/kg)",
            reportData.statistics.npk.phosphorus.min.toFixed(1),
            reportData.statistics.npk.phosphorus.max.toFixed(1),
            reportData.statistics.npk.phosphorus.avg.toFixed(1),
            reportData.statistics.npk.phosphorus.count,
          ]);
        }
        if (reportData.statistics.npk.potassium.count > 0) {
          statsTableBody.push([
            "Potássio (mg/kg)",
            reportData.statistics.npk.potassium.min.toFixed(1),
            reportData.statistics.npk.potassium.max.toFixed(1),
            reportData.statistics.npk.potassium.avg.toFixed(1),
            reportData.statistics.npk.potassium.count,
          ]);
        }
      }

      autoTable(doc, {
        startY: yPos,
        head: [["Parâmetro", "Mínimo", "Máximo", "Média", "Leituras"]],
        body: statsTableBody,
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Estatísticas de Alertas
      doc.setFontSize(14);
      doc.text("Estatísticas de Alertas", 20, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["Tipo", "Quantidade"]],
        body: [
          ["Total de Alertas", reportData.alerts.stats.total],
          ["Alertas Resolvidos", reportData.alerts.stats.resolved],
          ["Alertas Ativos", reportData.alerts.stats.active],
          ["Info", reportData.alerts.stats.byType.info],
          ["Avisos", reportData.alerts.stats.byType.warning],
          ["Erros", reportData.alerts.stats.byType.error],
          ["Sucesso", reportData.alerts.stats.byType.success],
        ],
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Nova página para dados mensais
      doc.addPage();
      yPos = 20;

      // ========== UMIDADE ==========
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246); // Azul
      doc.text("Dados Mensais - Umidade do Solo (%)", 20, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["Mês", "Média", "Mínimo", "Máximo", "Leituras"]],
        body: reportData.monthlyData.map((m: any) => [
          m.monthName,
          m.humidity.avg > 0 ? m.humidity.avg.toFixed(1) : "-",
          m.humidity.min > 0 ? m.humidity.min.toFixed(1) : "-",
          m.humidity.max > 0 ? m.humidity.max.toFixed(1) : "-",
          m.dataPoints,
        ]),
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // ========== TEMPERATURA ==========
      doc.setFontSize(14);
      doc.setTextColor(251, 146, 60); // Laranja
      doc.text("Dados Mensais - Temperatura (°C)", 20, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["Mês", "Média", "Mínimo", "Máximo", "Leituras"]],
        body: reportData.monthlyData.map((m: any) => [
          m.monthName,
          m.temperature.avg > 0 ? m.temperature.avg.toFixed(1) : "-",
          m.temperature.min > 0 ? m.temperature.min.toFixed(1) : "-",
          m.temperature.max > 0 ? m.temperature.max.toFixed(1) : "-",
          m.dataPoints,
        ]),
        theme: "grid",
        headStyles: { fillColor: [251, 146, 60] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Verificar se precisa de nova página
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      // ========== pH ==========
      doc.setFontSize(14);
      doc.setTextColor(34, 197, 94); // Verde
      doc.text("Dados Mensais - pH do Solo", 20, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["Mês", "Média", "Mínimo", "Máximo", "Leituras"]],
        body: reportData.monthlyData.map((m: any) => [
          m.monthName,
          m.ph.avg > 0 ? m.ph.avg.toFixed(2) : "-",
          m.ph.min > 0 ? m.ph.min.toFixed(2) : "-",
          m.ph.max > 0 ? m.ph.max.toFixed(2) : "-",
          m.dataPoints,
        ]),
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
      });

      // ========== NPK (se houver dados) ==========
      const hasNPKData = reportData.monthlyData.some(
        (m: any) =>
          m.npk &&
          ((m.npk.nitrogen && m.npk.nitrogen.avg > 0) ||
            (m.npk.phosphorus && m.npk.phosphorus.avg > 0) ||
            (m.npk.potassium && m.npk.potassium.avg > 0))
      );

      if (hasNPKData) {
        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Verificar se precisa de nova página
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        // Nitrogênio
        doc.setFontSize(14);
        doc.setTextColor(168, 85, 247); // Roxo
        doc.text("Dados Mensais - Nitrogênio (mg/kg)", 20, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [["Mês", "Média", "Mínimo", "Máximo", "Leituras"]],
          body: reportData.monthlyData.map((m: any) => [
            m.monthName,
            m.npk?.nitrogen?.avg > 0 ? m.npk.nitrogen.avg.toFixed(1) : "-",
            m.npk?.nitrogen?.min > 0 ? m.npk.nitrogen.min.toFixed(1) : "-",
            m.npk?.nitrogen?.max > 0 ? m.npk.nitrogen.max.toFixed(1) : "-",
            m.dataPoints,
          ]),
          theme: "grid",
          headStyles: { fillColor: [168, 85, 247] },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Verificar se precisa de nova página
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        // Fósforo
        doc.setFontSize(14);
        doc.setTextColor(236, 72, 153); // Rosa
        doc.text("Dados Mensais - Fósforo (mg/kg)", 20, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [["Mês", "Média", "Mínimo", "Máximo", "Leituras"]],
          body: reportData.monthlyData.map((m: any) => [
            m.monthName,
            m.npk?.phosphorus?.avg > 0 ? m.npk.phosphorus.avg.toFixed(1) : "-",
            m.npk?.phosphorus?.min > 0 ? m.npk.phosphorus.min.toFixed(1) : "-",
            m.npk?.phosphorus?.max > 0 ? m.npk.phosphorus.max.toFixed(1) : "-",
            m.dataPoints,
          ]),
          theme: "grid",
          headStyles: { fillColor: [236, 72, 153] },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Verificar se precisa de nova página
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        // Potássio
        doc.setFontSize(14);
        doc.setTextColor(245, 158, 11); // Amarelo/Dourado
        doc.text("Dados Mensais - Potássio (mg/kg)", 20, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [["Mês", "Média", "Mínimo", "Máximo", "Leituras"]],
          body: reportData.monthlyData.map((m: any) => [
            m.monthName,
            m.npk?.potassium?.avg > 0 ? m.npk.potassium.avg.toFixed(1) : "-",
            m.npk?.potassium?.min > 0 ? m.npk.potassium.min.toFixed(1) : "-",
            m.npk?.potassium?.max > 0 ? m.npk.potassium.max.toFixed(1) : "-",
            m.dataPoints,
          ]),
          theme: "grid",
          headStyles: { fillColor: [245, 158, 11] },
        });
      }

      // Salvar PDF
      doc.save(
        `WaterySoil_Relatorio_${reportData.sector.name}_${reportData.year}.pdf`
      );
      alert("PDF gerado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF: " + error.message);
    }
  };

  useEffect(() => {
    loadActiveLocation();
    loadAlerts();
    loadAlertSettings();
    loadActiveIrrigation();
  }, []);

  // Fechar dropdown de notificações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest(".notification-dropdown")) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  // Timer de irrigação
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (activeIrrigation) {
      interval = setInterval(() => {
        const startTime = new Date(activeIrrigation.startTime).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setIrrigationTimer(elapsedSeconds);

        // Auto-stop após duração planejada
        if (elapsedSeconds >= activeIrrigation.plannedDuration * 60) {
          handleStopIrrigation();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeIrrigation]);

  // Função auxiliar para calcular tendência comparando valor atual com anterior
  const calculateTrend = (
    currentValue: number,
    previousValue: number | undefined
  ): "up" | "down" | "stable" => {
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
        const soilType: SoilType = (module.soil_type as SoilType) || "loam";

        // Determina o status baseado no status do módulo
        let status: "good" | "warning" | "critical" = "good";
        if (module.status === "offline") status = "critical";
        else if (module.status === "error" || module.status === "maintenance")
          status = "warning";

        // Obter valores anteriores para calcular tendência
        const previousPh = (module.sensor_data?.ph as any)?.previous_value;
        const previousMoisture = (module.sensor_data?.soil_moisture as any)
          ?.previous_value;
        const previousTemp = (module.sensor_data?.temperature as any)
          ?.previous_value;
        const previousP = (module.sensor_data?.npk as any)?.previous_phosphorus;
        const previousK = (module.sensor_data?.npk as any)?.previous_potassium;

        // 1. pH do Solo
        if (module.sensor_data?.ph?.value !== undefined) {
          const phValue = module.sensor_data.ph.value;
          const parameterStatus = classifyPH(phValue);
          const statusTip = getStatusTip("ph", parameterStatus);
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
            const parameterStatus =
              pStatus === "Ruim" || kStatus === "Ruim"
                ? "Ruim"
                : pStatus === "Bom" || kStatus === "Bom"
                ? "Bom"
                : "Ideal";

            // Mostrar faixas ideais de referência ao invés dos valores atuais
            const statusTip = `P: ideal (20-40 ppm), K: ideal (100-150 ppm)`;

            // Mostrar média para visualização
            const npkAvg = (phosphorus + potassium) / 2;
            const previousNpkAvg =
              previousP !== undefined && previousK !== undefined
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
          const statusTip = getStatusTip("moisture", parameterStatus, soilType);
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
          const statusTip = getStatusTip("temperature", parameterStatus);
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
      // Carregar todos os ambientes disponíveis
      const environments = await environmentService.getEnvironments();
      setAvailableEnvironments(environments);

      if (environments && environments.length > 0) {
        const firstEnv = environments[0];
        setActiveEnvironment({ _id: firstEnv._id, name: firstEnv.name });
        setSelectedEnvironmentId(firstEnv._id);

        // Carregar todos os setores do ambiente
        const sectors = await sectorService.getSectors(firstEnv._id);
        setAvailableSectors(sectors);

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
          setSelectedSectorId(firstSector._id);
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
      {/* Notificação Persistente de Irrigação Ativa */}
      {activeIrrigation && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-3 px-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Droplets className="h-5 w-5 animate-pulse" />
              <div>
                <p className="font-semibold">Irrigação Ativa</p>
                <p className="text-sm text-blue-100">
                  Setor: {activeIrrigation.sector_id?.name || "N/A"} • Tempo:{" "}
                  {formatIrrigationTime(irrigationTimer)} /{" "}
                  {activeIrrigation.plannedDuration}min
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelIrrigation}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className={`bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 ${
          activeIrrigation ? "mt-16" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Logo clicável */}
              <button
                onClick={() => setCurrentView("dashboard")}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/images/logo.png"
                  alt="ECO-SOIL PRO - Vista frontal em campo"
                  className="w-10"
                ></img>
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
              {/* Botão de Notificações */}
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
                  title="Notificações"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Dropdown de Notificações */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Notificações
                        </h3>
                        {unreadNotifications > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            {unreadNotifications} novas
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {alerts.filter(
                        (alert) =>
                          alert.isAutomatic && alert.status === "active"
                      ).length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Nenhuma notificação</p>
                        </div>
                      ) : (
                        alerts
                          .filter(
                            (alert) =>
                              alert.isAutomatic && alert.status === "active"
                          )
                          .slice(0, 5)
                          .map((alert) => (
                            <div
                              key={alert._id}
                              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => {
                                setShowNotifications(false);
                                setCurrentView("dashboard");
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`mt-1 ${
                                    alert.type === "error"
                                      ? "text-red-500"
                                      : alert.type === "warning"
                                      ? "text-yellow-500"
                                      : alert.type === "success"
                                      ? "text-green-500"
                                      : "text-blue-500"
                                  }`}
                                >
                                  {alert.source === "humidity" && (
                                    <Droplets className="h-5 w-5" />
                                  )}
                                  {alert.source === "temperature" && (
                                    <Thermometer className="h-5 w-5" />
                                  )}
                                  {alert.source === "ph" && (
                                    <Leaf className="h-5 w-5" />
                                  )}
                                  {!["humidity", "temperature", "ph"].includes(
                                    alert.source
                                  ) && <AlertTriangle className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {alert.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(alert.createdAt).toLocaleString(
                                      "pt-BR"
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>

                    {alerts.filter(
                      (alert) => alert.isAutomatic && alert.status === "active"
                    ).length > 5 && (
                      <div className="p-3 border-t border-gray-200 text-center">
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            setCurrentView("dashboard");
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Ver todos os alertas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                  }}
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
                      <span className="text-xs text-gray-500">Agora</span>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Alertas Recentes
                  </h3>
                  <button
                    onClick={() => setShowCreateAlertModal(true)}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                  >
                    + Criar Alerta
                  </button>
                </div>
                <div className="space-y-3">
                  {loadingAlerts ? (
                    <div className="text-center py-4 text-gray-500">
                      Carregando alertas...
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Nenhum alerta ativo
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert._id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            alert.type === "success"
                              ? "bg-green-500"
                              : alert.type === "warning"
                              ? "bg-amber-500"
                              : alert.type === "error"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getRelativeTime(alert.createdAt)}
                            {alert.sector_id && ` • ${alert.sector_id.name}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleResolveAlert(alert._id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Resolver"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAlert(alert._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Deletar"
                          >
                            <AlertTriangle size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowIrrigationModal(true)}
                    disabled={!!activeIrrigation}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">
                        {activeIrrigation
                          ? "Irrigação Ativa"
                          : "Ativar Irrigação"}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        Ver Relatório Anual
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowAlertSettingsModal(true)}
                    className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                  >
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

      {/* Modal de Criar Alerta */}
      {showCreateAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Criar Novo Alerta
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Alerta
                </label>
                <select
                  value={alertForm.type}
                  onChange={(e) =>
                    setAlertForm({ ...alertForm, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="info">Informação</option>
                  <option value="warning">Aviso</option>
                  <option value="error">Erro</option>
                  <option value="success">Sucesso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={alertForm.message}
                  onChange={(e) =>
                    setAlertForm({ ...alertForm, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Digite a mensagem do alerta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setor (Opcional)
                </label>
                <select
                  value={alertForm.sector_id || ""}
                  onChange={(e) =>
                    setAlertForm({ ...alertForm, sector_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Nenhum setor específico</option>
                  {availableSectors.map((sector: any) => (
                    <option key={sector._id} value={sector._id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateAlertModal(false);
                  setAlertForm({
                    type: "info",
                    message: "",
                    sector_id: "",
                    source: "manual",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAlert}
                disabled={!alertForm.message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Criar Alerta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Alertas */}
      {showAlertSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Configurar Alertas Automáticos
            </h3>

            <div className="space-y-6">
              {/* Umidade */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    Umidade do Solo (%)
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertSettings.humidity.enabled}
                      onChange={(e) =>
                        setAlertSettings({
                          ...alertSettings,
                          humidity: {
                            ...alertSettings.humidity,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mínimo
                    </label>
                    <input
                      type="number"
                      value={alertSettings.humidity.min}
                      onChange={(e) =>
                        setAlertSettings({
                          ...alertSettings,
                          humidity: {
                            ...alertSettings.humidity,
                            min: parseFloat(e.target.value),
                          },
                        })
                      }
                      disabled={!alertSettings.humidity.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Máximo
                    </label>
                    <input
                      type="number"
                      value={alertSettings.humidity.max}
                      onChange={(e) =>
                        setAlertSettings({
                          ...alertSettings,
                          humidity: {
                            ...alertSettings.humidity,
                            max: parseFloat(e.target.value),
                          },
                        })
                      }
                      disabled={!alertSettings.humidity.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Temperatura */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-red-600" />
                    Temperatura (°C)
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertSettings.temperature.enabled}
                      onChange={(e) =>
                        setAlertSettings({
                          ...alertSettings,
                          temperature: {
                            ...alertSettings.temperature,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mínimo
                    </label>
                    <input
                      type="number"
                      value={alertSettings.temperature.min}
                      onChange={(e) =>
                        setAlertSettings({
                          ...alertSettings,
                          temperature: {
                            ...alertSettings.temperature,
                            min: parseFloat(e.target.value),
                          },
                        })
                      }
                      disabled={!alertSettings.temperature.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Máximo
                    </label>
                    <input
                      type="number"
                      value={alertSettings.temperature.max}
                      onChange={(e) =>
                        setAlertSettings({
                          ...alertSettings,
                          temperature: {
                            ...alertSettings.temperature,
                            max: parseFloat(e.target.value),
                          },
                        })
                      }
                      disabled={!alertSettings.temperature.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* pH */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    pH do Solo
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertSettings.ph.enabled}
                      onChange={(e) =>
                        setAlertSettings({
                          ...alertSettings,
                          ph: {
                            ...alertSettings.ph,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mínimo
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={alertSettings.ph.min}
                      onChange={(e) =>
                        setAlertSettings({
                          ...alertSettings,
                          ph: {
                            ...alertSettings.ph,
                            min: parseFloat(e.target.value),
                          },
                        })
                      }
                      disabled={!alertSettings.ph.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Máximo
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={alertSettings.ph.max}
                      onChange={(e) =>
                        setAlertSettings({
                          ...alertSettings,
                          ph: {
                            ...alertSettings.ph,
                            max: parseFloat(e.target.value),
                          },
                        })
                      }
                      disabled={!alertSettings.ph.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Notificações */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Notificações
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Notificações por Email
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertSettings.emailNotifications}
                        onChange={(e) =>
                          setAlertSettings({
                            ...alertSettings,
                            emailNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Notificações do Sistema
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertSettings.systemNotifications}
                        onChange={(e) =>
                          setAlertSettings({
                            ...alertSettings,
                            systemNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAlertSettingsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAlertSettings}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Iniciar Irrigação */}
      {showIrrigationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplets className="h-6 w-6 text-blue-600" />
              Iniciar Irrigação
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setor Selecionado
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {activeSector?.name || "Nenhum setor selecionado"}
                  </p>
                </div>
                {!activeSector && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Clique no ícone de lápis no header para selecionar um
                    setor
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={irrigationDuration}
                  onChange={(e) =>
                    setIrrigationDuration(parseInt(e.target.value))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 20-40 minutos
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Atenção:</strong> A irrigação será iniciada
                  imediatamente e você poderá acompanhar o progresso na barra
                  superior.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowIrrigationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartIrrigation}
                disabled={!activeSector?._id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Iniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Relatório Anual */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-green-600" />
              Relatório Anual
            </h3>

            {!reportData ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setor Selecionado
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900 font-medium">
                      {activeSector?.name || "Nenhum setor selecionado"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ano
                  </label>
                  <select
                    value={reportYear}
                    onChange={(e) => setReportYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {Array.from(
                      { length: 5 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleFetchReport}
                    disabled={!activeSector?._id || loadingReport}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingReport ? "Carregando..." : "Buscar Dados"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Informações do Relatório */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Informações do Relatório
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Setor:</p>
                      <p className="font-medium text-gray-900">
                        {reportData.sector.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ano:</p>
                      <p className="font-medium text-gray-900">
                        {reportData.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total de Leituras:</p>
                      <p className="font-medium text-gray-900">
                        {reportData.dataPoints}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Alertas:</p>
                      <p className="font-medium text-gray-900">
                        {reportData.alerts.stats.total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estatísticas Gerais */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Estatísticas Gerais
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        Umidade (%)
                      </p>
                      <p className="text-xs text-gray-600">
                        Média:{" "}
                        <span className="font-semibold">
                          {reportData.statistics.humidity.avg.toFixed(1)}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Min: {reportData.statistics.humidity.min.toFixed(1)} |
                        Max: {reportData.statistics.humidity.max.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <p className="text-sm text-red-600 font-medium mb-2">
                        Temperatura (°C)
                      </p>
                      <p className="text-xs text-gray-600">
                        Média:{" "}
                        <span className="font-semibold">
                          {reportData.statistics.temperature.avg.toFixed(1)}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Min: {reportData.statistics.temperature.min.toFixed(1)}{" "}
                        | Max:{" "}
                        {reportData.statistics.temperature.max.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-600 font-medium mb-2">
                        pH
                      </p>
                      <p className="text-xs text-gray-600">
                        Média:{" "}
                        <span className="font-semibold">
                          {reportData.statistics.ph.avg.toFixed(2)}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Min: {reportData.statistics.ph.min.toFixed(2)} | Max:{" "}
                        {reportData.statistics.ph.max.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estatísticas de Alertas */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Estatísticas de Alertas
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.alerts.stats.total}
                      </p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {reportData.alerts.stats.byType.info}
                      </p>
                      <p className="text-xs text-gray-600">Info</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {reportData.alerts.stats.byType.warning}
                      </p>
                      <p className="text-xs text-gray-600">Avisos</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {reportData.alerts.stats.byType.error}
                      </p>
                      <p className="text-xs text-gray-600">Erros</p>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setReportData(null);
                      setShowReportModal(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setReportData(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Nova Consulta
                  </button>
                  <button
                    onClick={handleGeneratePDF}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Gerar PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
