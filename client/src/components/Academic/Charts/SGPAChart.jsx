// frontend/src/components/Academic/Charts/SGPAChart.jsx
import { useEffect, useRef } from 'react';

const SGPAChart = ({ records }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !records || records.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort records by semester
    const sortedRecords = [...records].sort((a, b) => a.semester - b.semester);

    if (sortedRecords.length === 0) return;

    // Find min and max values
    const minSGPA = Math.min(...sortedRecords.map((r) => r.sgpa || 0));
    const maxSGPA = Math.max(...sortedRecords.map((r) => r.sgpa || 10));
    const range = maxSGPA - minSGPA || 10;

    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height + padding);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height + padding);
    ctx.lineTo(width + padding, height + padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width + padding, y);
      ctx.stroke();
    }

    // Draw data points and line
    if (sortedRecords.length > 0) {
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.beginPath();

      sortedRecords.forEach((record, index) => {
        const x = padding + (width / (sortedRecords.length - 1 || 1)) * index;
        const normalizedSGPA = (record.sgpa - minSGPA) / range;
        const y = padding + height - normalizedSGPA * height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points
      ctx.fillStyle = '#4f46e5';
      sortedRecords.forEach((record, index) => {
        const x = padding + (width / (sortedRecords.length - 1 || 1)) * index;
        const normalizedSGPA = (record.sgpa - minSGPA) / range;
        const y = padding + height - normalizedSGPA * height;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`S${record.semester}`, x, height + padding + 15);
        ctx.fillText(record.sgpa.toFixed(2), x, y - 8);
        ctx.fillStyle = '#4f46e5';
      });
    }

    // Y-axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minSGPA + (range / 5) * (5 - i);
      const y = padding + (height / 5) * i;
      ctx.fillText(value.toFixed(1), padding - 10, y + 3);
    }
  }, [records]);

  return (
    <div>
      <canvas ref={canvasRef} width={600} height={300} className="w-full max-w-full" />
    </div>
  );
};

export default SGPAChart;

