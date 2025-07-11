import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Snackbar, Alert, Box } from "@mui/material";
import { fetchUrls, addUrl, deleteUrl, updateUrl, startAnalysis, stopAnalysis } from "../api";
import type { UrlItem } from "../types";
import { UrlTable } from "../components/UrlTable";

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadUrls = useCallback(async () => {
    try {
      const response = await fetchUrls();
      setUrls(response.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load URLs');
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadUrls();
      setLoading(false);
    };
    initialLoad();
  }, [loadUrls]);

  // Auto-refresh only when there are URLs with "running" status
  useEffect(() => {
    const hasRunningUrls = urls.some(url => url.status === "running");
    
    if (!hasRunningUrls) return;

    const interval = setInterval(() => {
      loadUrls();
    }, 3000);

    return () => clearInterval(interval);
  }, [urls, loadUrls]);

  const handleAddUrl = async (address: string) => {
    try {
      await addUrl(address);
      await loadUrls(); // Refresh to show new URL
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add URL');
    }
  };

  const handleDeleteUrl = async (id: number) => {
    try {
      await deleteUrl(id);
      await loadUrls(); // Refresh to remove deleted URL
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete URL');
    }
  };

  const handleRowClick = (id: number) => {
    navigate(`/details/${id}`);
  };

  const handleStartAnalysis = async (id: number) => {
    try {
      await startAnalysis(id);
      await loadUrls(); // Refresh to show updated status
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start analysis');
    }
  };

  const handleStopAnalysis = async (id: number) => {
    try {
      await stopAnalysis(id);
      await loadUrls(); // Refresh to show updated status
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to stop analysis');
    }
  };

  const handleEditUrl = async (id: number, newAddress: string) => {
    try {
      await updateUrl(id, newAddress);
      await loadUrls(); // Refresh to show updated URL
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update URL');
    }
  };

  const handleAddUrlClick = (address: string) => {
    handleAddUrl(address);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mt: 12.5, // 100px from top (12.5 * 8px = 100px)
        mb: 12.5  // 100px between heading and table (12.5 * 8px = 100px)
      }}>
        <Typography variant="h4" align="center">
          Web Crawler Dashboard
        </Typography>
      </Box>

      {/* URL Table */}
      <UrlTable 
        urls={urls} 
        onDelete={handleDeleteUrl} 
        onRowClick={handleRowClick}
        onStartAnalysis={handleStartAnalysis}
        onStopAnalysis={handleStopAnalysis}
        onEditUrl={handleEditUrl}
        onAddUrl={handleAddUrlClick}
        loading={loading}
      />

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleCloseError}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}