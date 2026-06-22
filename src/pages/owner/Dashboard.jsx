import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  TrendingUp,
  Calendar,
  BarChart3,
  PackageSearch
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const { get, loading, error } = useApi();
  const [data, setData] = useState(null);
  const [salesChartMode, setSalesChartMode] = useState('daily');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await get('/dashboard');
        setData(result);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchData();
  }, [get]);

  if (loading && !data) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="p-8 text-center text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">{error}</div>;
  if (!data) return null;

  const stats = [
    {
      label: 'ยอดขายวันนี้',
      value: data.today_sales,
      icon: <Calendar className="text-blue-600" />,
      color: 'bg-blue-50'
    },
    {
      label: 'ยอดขายเดือนนี้',
      value: data.month_sales,
      icon: <TrendingUp className="text-indigo-600" />,
      color: 'bg-indigo-50',
      chartMode: 'daily'
    },
    {
      label: 'ยอดขายปีนี้',
      value: data.year_sales,
      icon: <BarChart3 className="text-violet-600" />,
      color: 'bg-violet-50',
      chartMode: 'monthly'
    },
  ];

  const chartData = {
    labels: data.stock_chart.map(item => item.category_name),
    datasets: [
      {
        data: data.stock_chart.map(item => item.total_value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const salesSource = salesChartMode === 'monthly'
    ? data.sales_monthly || []
    : data.sales_daily || [];

  const salesBarData = {
    labels: salesSource.map(item => salesChartMode === 'monthly' ? `เดือน ${item.label}` : `วันที่ ${item.label}`),
    datasets: [
      {
        label: salesChartMode === 'monthly' ? 'ยอดขายรายเดือน' : 'ยอดขายรายวัน',
        data: salesSource.map(item => item.total_value),
        backgroundColor: salesChartMode === 'monthly'
          ? 'rgba(15, 118, 110, 0.82)'
          : 'rgba(214, 161, 29, 0.82)',
        borderColor: salesChartMode === 'monthly' ? '#0f766e' : '#d6a11d',
        borderWidth: 1,
        borderRadius: 10,
        maxBarThickness: 34
      },
    ],
  };

  const salesChartTitle = salesChartMode === 'monthly'
    ? 'กราฟยอดขายรายเดือน'
    : 'กราฟยอดขายรายวัน';

  const salesChartSubtitle = salesChartMode === 'monthly'
    ? 'แสดงยอดขายแต่ละเดือนในปีนี้'
    : 'แสดงยอดขายแต่ละวันในเดือนนี้';

  return (
    <div className="animate-slide-up space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ภาพรวมระบบ</h1>
        <p className="text-slate-500 mt-2 font-medium">ยินดีต้อนรับกลับสู่ SATHANEEMHALA Management System</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => stat.chartMode && setSalesChartMode(stat.chartMode)}
            className={`card group text-left ${stat.chartMode ? 'cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-200' : 'cursor-default'} ${stat.chartMode === salesChartMode ? 'border-blue-500 ring-4 ring-blue-100' : ''}`}
          >
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                  {Number(stat.value).toLocaleString()} <span className="text-lg font-bold text-slate-400">฿</span>
                </p>
              </div>
            </div>
            {stat.chartMode && (
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-5">
                กดเพื่อดูกราฟ{stat.chartMode === 'daily' ? 'รายวัน' : 'รายเดือน'}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={24} />
              สัดส่วนยอดขายตามหมวดหมู่
            </h2>
          </div>
          <div className="h-[400px] flex items-center justify-center p-4">
            {data.stock_chart.length > 0 ? (
              <Pie
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { family: 'Outfit', size: 13, weight: '600' }
                      }
                    }
                  }
                }}
              />
            ) : (
              <p className="text-slate-400 font-medium">ไม่มีข้อมูลสต็อก</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} />
                {salesChartTitle}
              </h2>
              <p className="text-sm font-bold text-slate-400 mt-1">{salesChartSubtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setSalesChartMode('daily')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${salesChartMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                รายวัน
              </button>
              <button
                type="button"
                onClick={() => setSalesChartMode('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${salesChartMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                รายเดือน
              </button>
            </div>
          </div>

          <div className="h-[400px] p-2">
            {salesSource.length > 0 ? (
              <Bar
                data={salesBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${Number(context.raw).toLocaleString()} บาท`
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { maxRotation: 0, autoSkip: true, font: { family: 'Outfit', size: 11, weight: '600' } }
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => Number(value).toLocaleString(),
                        font: { family: 'Outfit', size: 11, weight: '600' }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                ไม่มีข้อมูลยอดขาย
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
