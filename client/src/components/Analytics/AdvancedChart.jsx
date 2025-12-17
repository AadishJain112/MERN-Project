// frontend/src/components/Analytics/AdvancedChart.jsx
import { useEffect, useRef } from 'react';

const AdvancedChart = ({ type, data, options = {} }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    if (type === 'line') {
      drawLineChart(ctx, data, width, height, padding);
    } else if (type === 'bar') {
      drawBarChart(ctx, data, width, height, padding);
    } else if (type === 'pie' || type === 'doughnut') {
      drawPieChart(ctx, data, width, height, type === 'doughnut');
    }
  }, [type, data]);

  const drawLineChart = (ctx, data, width, height, padding) => {
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const labels = data.labels || [];
    const datasets = data.datasets || [];

    if (labels.length === 0) return;

    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw datasets
    datasets.forEach((dataset, idx) => {
      ctx.strokeStyle = dataset.borderColor || '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const maxValue = Math.max(
        ...dataset.data.map((d) => (typeof d === 'number' ? d : 0))
      );

      dataset.data.forEach((value, i) => {
        const x = padding + (chartWidth / (labels.length - 1 || 1)) * i;
        const normalizedValue = (value / maxValue) * chartHeight;
        const y = height - padding - normalizedValue;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points
      ctx.fillStyle = dataset.borderColor || '#6366f1';
      dataset.data.forEach((value, i) => {
        const x = padding + (chartWidth / (labels.length - 1 || 1)) * i;
        const normalizedValue = (value / maxValue) * chartHeight;
        const y = height - padding - normalizedValue;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  };

  const drawBarChart = (ctx, data, width, height, padding) => {
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const labels = data.labels || [];
    const dataset = data.datasets?.[0];

    if (!dataset || labels.length === 0) return;

    const maxValue = Math.max(...dataset.data.map((d) => (typeof d === 'number' ? d : 0)));
    const barWidth = chartWidth / labels.length - 10;

    dataset.data.forEach((value, i) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + (chartWidth / labels.length) * i + 5;
      const y = height - padding - barHeight;

      ctx.fillStyle = dataset.backgroundColor || 'rgba(99, 102, 241, 0.8)';
      ctx.fillRect(x, y, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barWidth / 2, height - padding + 15);
    });
  };

  const drawPieChart = (ctx, data, width, height, isDoughnut) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const innerRadius = isDoughnut ? radius * 0.6 : 0;

    const dataset = data.datasets?.[0];
    if (!dataset) return;

    const total = dataset.data.reduce((a, b) => a + b, 0);
    let currentAngle = -Math.PI / 2;

    dataset.data.forEach((value, i) => {
      const sliceAngle = (value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = dataset.backgroundColor?.[i] || `hsl(${(i * 360) / dataset.data.length}, 70%, 50%)`;
      ctx.fill();

      if (isDoughnut) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          innerRadius,
          currentAngle + sliceAngle,
          currentAngle,
          true
        );
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // Label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${((value / total) * 100).toFixed(1)}%`,
        labelX,
        labelY
      );

      currentAngle += sliceAngle;
    });
  };

  return (
    <div className="w-full">
      <canvas ref={canvasRef} width={600} height={300} className="w-full max-w-full" />
    </div>
  );
};

export default AdvancedChart;

