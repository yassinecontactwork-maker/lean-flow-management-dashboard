import React from 'react';
import { Box, Typography } from '@mui/material';

function PageHeader({ title, subtitle, actions, meta }) {
  return (
    <Box className="page-header">
      <Box>
        <Typography component="h1" variant="h4" className="page-title">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" className="page-subtitle">
            {subtitle}
          </Typography>
        )}
        {meta && (
          <Box className="page-meta" sx={{ mt: 1 }}>
            {meta}
          </Box>
        )}
      </Box>
      {actions && <Box className="page-actions">{actions}</Box>}
    </Box>
  );
}

export default PageHeader;
