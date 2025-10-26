import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Calendar, TrendingUp, Activity, BarChart3 } from 'lucide-react';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorReading {
  _id: string;
  module_id: string;
  sensor_data: {
    ph?: { value: number; unit: string };
    npk?: { nitrogen: number; phosphorus: number; potassium: number };
    soil_moisture?: { value: number; unit: string };
    temperature?: { value: number; unit: string };
  };
  reading_timestamp: string;
  createdAt: string;
}

interface SensorChartsProps {
  sectorId: string | null;
}

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

const SensorCharts: React.FC<SensorChartsProps> = ({ sectorId }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar dados dos sensores
  const fetchSensorData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📊 Buscando dados dos sensores...');
      console.log('📊 SectorId:', sectorId);
      console.log('📊 TimeRange:', timeRange);

      // Buscar dados reais da API (mesmo sem sectorId)
      const url = sectorId
        ? `http://localhost:3000/api/v1/data-sensors/aggregated?sectorId=${sectorId}&timeRange=${timeRange}`
        : `http://localhost:3000/api/v1/data-sensors/aggregated?timeRange=${timeRange}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar dados');
      }

      const result = await response.json();

      console.log('📊 Resultado da API:', result);

      // Verificar se a resposta tem sucesso
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar dados');
      }

      const data = result.data;

      // Verificar se há dados
      const hasData = data.ph.some((v: number | null) => v !== null) ||
                      data.moisture.some((v: number | null) => v !== null) ||
                      data.temperature.some((v: number | null) => v !== null) ||
                      data.npk.some((v: number | null) => v !== null);

      if (!hasData) {
        console.log('⚠️ Nenhum dado encontrado no período');

        // Mensagem mais específica baseada na resposta do backend
        let errorMessage = 'Nenhum dado encontrado para o período selecionado.';

        if (result.message === "Nenhum módulo encontrado neste setor") {
          errorMessage = 'Nenhum hardware cadastrado neste setor. Cadastre um módulo WaterySoil para começar a visualizar dados.';
        } else if (result.message === "Nenhum módulo encontrado para este usuário") {
          errorMessage = 'Você ainda não possui módulos cadastrados. Vá em "Módulos" para cadastrar seu primeiro hardware.';
        } else {
          errorMessage = 'Nenhum dado encontrado para o período selecionado. Verifique se há leituras dos sensores no banco de dados.';
        }

        setError(errorMessage);
        setChartData(null);
        setLoading(false);
        return;
      }

      console.log('✅ Dados encontrados:', {
        labels: data.labels.length,
        ph: data.ph.filter((v: number | null) => v !== null).length,
        moisture: data.moisture.filter((v: number | null) => v !== null).length,
        temperature: data.temperature.filter((v: number | null) => v !== null).length,
        npk: data.npk.filter((v: number | null) => v !== null).length,
      });

      // Transformar dados da API para o formato do gráfico
      const chartDataFormatted = {
        labels: data.labels,
        datasets: [
          {
            label: 'pH do Solo',
            data: data.ph.map((v: number | null) => v || 0),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Umidade (%)',
            data: data.moisture.map((v: number | null) => v || 0),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Temperatura (°C)',
            data: data.temperature.map((v: number | null) => v || 0),
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'rgba(251, 146, 60, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'NPK Médio (%)',
            data: data.npk.map((v: number | null) => v || 0),
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      };

      setChartData(chartDataFormatted);
    } catch (err) {
      console.error('❌ Erro ao buscar dados dos sensores:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados';
      setError(errorMessage);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, [sectorId, timeRange]);

  // Configurações do gráfico de linha
  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // Dados para gráfico de barras (comparativo)
  const barData = chartData ? {
    labels: ['pH', 'Umidade', 'Temperatura', 'NPK'],
    datasets: [
      {
        label: 'Média Atual',
        data: [
          chartData.datasets[0].data.reduce((a: number, b: number) => a + b, 0) / chartData.datasets[0].data.length,
          chartData.datasets[1].data.reduce((a: number, b: number) => a + b, 0) / chartData.datasets[1].data.length,
          chartData.datasets[2].data.reduce((a: number, b: number) => a + b, 0) / chartData.datasets[2].data.length,
          chartData.datasets[3].data.reduce((a: number, b: number) => a + b, 0) / chartData.datasets[3].data.length,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(251, 146, 60)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
      },
      {
        label: 'Ideal',
        data: [7.0, 27, 25, 63],
        backgroundColor: 'rgba(156, 163, 175, 0.3)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 2,
      },
    ],
  } : null;

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value !== null ? value.toFixed(1) : 'N/A'}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'daily': return 'Últimas 24 Horas';
      case 'weekly': return 'Últimos 7 Dias';
      case 'monthly': return 'Últimos 30 Dias';
      case 'yearly': return 'Últimos 12 Meses';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com seletor de período */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Análise de Sensores
          </h2>
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTimeRange('daily')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === 'daily'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-1" />
            Diário
          </button>
          <button
            onClick={() => setTimeRange('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === 'weekly'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-1" />
            Semanal
          </button>
          <button
            onClick={() => setTimeRange('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === 'monthly'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-1" />
            Mensal
          </button>
          <button
            onClick={() => setTimeRange('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === 'yearly'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1" />
            Anual
          </button>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Activity className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900">Dados não encontrados</h4>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
              <p className="text-xs text-yellow-600 mt-2">
                💡 Dica: Verifique se há leituras dos sensores na coleção <code className="bg-yellow-100 px-1 rounded">data_sensors</code> do MongoDB.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Linha - Tendências */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Tendências - {getTimeRangeLabel()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhe a evolução dos parâmetros ao longo do tempo
          </p>
        </div>
        
        <div className="h-80">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : chartData ? (
            <Line data={chartData} options={lineOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Barras - Comparativo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Comparativo com Valores Ideais
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Média do período vs. valores recomendados
          </p>
        </div>
        
        <div className="h-64">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : barData ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorCharts;

