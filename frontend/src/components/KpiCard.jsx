import React from 'react';
import { Card, Box, Typography } from '@mui/material';

function KpiCard({ label, value, foot, icon, tone = 'primary' }) {
  const toneClass = tone && tone !== 'primary' ? `kpi-card--${tone}` : '';

  return (
    <Card className={`kpi-card ${toneClass}`}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography className="kpi-label">{label}</Typography>
          <Typography className="kpi-value">{value}</Typography>
        </Box>
        {icon && (
          <Box className="kpi-icon">
            {icon}
          </Box>
        )}
      </Box>
      {foot && <Typography className="kpi-foot">{foot}</Typography>}
    </Card>
  );
}

export default KpiCard;
