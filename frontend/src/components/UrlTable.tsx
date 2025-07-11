import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box, Typography, Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { Delete as DeleteIcon, PlayArrow as PlayIcon, Stop as StopIcon, Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import { StatusChip } from "./StatusChip";
import type { UrlItem } from "../types";
import { useState } from "react";

interface UrlTableProps {
  urls: UrlItem[];
  onDelete: (id: number) => void;
  onRowClick: (id: number) => void;
  onStartAnalysis: (id: number) => void;
  onStopAnalysis: (id: number) => void;
  onEditUrl: (id: number, newAddress: string) => void;
  onAddUrl?: (address: string) => void;
  loading?: boolean;
}

export function UrlTable({ urls, onDelete, onRowClick, onStartAnalysis, onStopAnalysis, onEditUrl, onAddUrl, loading = false }: UrlTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  // Process URLs to add computed fields for sorting
  const processedUrls = urls.map(url => ({
    ...url,
    internal_links: url.results?.[0]?.internal_links ?? 0,
    external_links: url.results?.[0]?.external_links ?? 0,
    broken_links: url.results?.[0]?.broken_links ?? 0,
  }));

  const handleAddClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewUrl("");
  };

  const handleSubmit = () => {
    if (newUrl.trim() && onAddUrl) {
      onAddUrl(newUrl.trim());
      handleDialogClose();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  const columns: GridColDef[] = [
    { 
      field: "address", 
      headerName: "URL", 
      flex: 2,
      minWidth: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: "status", 
      headerName: "Status", 
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <StatusChip status={params.value} />
        </Box>
      )
    },
    { 
      field: "internal_links", 
      headerName: "Internal Links", 
      flex: 1,
      type: "number",
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      sortComparator: (v1, v2) => v1 - v2
    },
    { 
      field: "external_links", 
      headerName: "External Links", 
      flex: 1,
      type: "number",
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      sortComparator: (v1, v2) => v1 - v2
    },
    { 
      field: "broken_links", 
      headerName: "Broken Links", 
      flex: 1,
      type: "number",
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      sortComparator: (v1, v2) => v1 - v2
    },

    {
      field: "analysis",
      headerName: "Analysis",
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const isRunning = params.row.status === "running";
        const isQueued = params.row.status === "queued";
        const canStop = isRunning;
        
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {!isRunning && (
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<PlayIcon />}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onStartAnalysis(params.row.id); 
                  }}
                >
                  Start
                </Button>
              )}
              {canStop && (
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="warning" 
                  startIcon={<StopIcon />}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onStopAnalysis(params.row.id); 
                  }}
                >
                  Stop
                </Button>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button 
              size="small" 
              variant="outlined" 
              color="secondary" 
              startIcon={<EditIcon />}
              onClick={(e) => { 
                e.stopPropagation(); 
                const newAddress = prompt("Enter new URL:", params.row.address);
                if (newAddress && newAddress.trim()) {
                  onEditUrl(params.row.id, newAddress.trim());
                }
              }}
            >
              Edit
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={(e) => { 
                e.stopPropagation(); 
                onDelete(params.row.id); 
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading URLs...</Typography>
      </Box>
    );
  }

  if (processedUrls.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography color="text.secondary">No URLs found. Add a URL to get started.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <DataGrid
        rows={processedUrls}
        columns={columns}
        autoHeight
        pagination
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          sorting: {
            sortModel: [{ field: 'createdAt', sort: 'desc' }],
          },
        }}
        getRowId={(row) => row.id}
        onRowClick={(params) => onRowClick(params.row.id)}
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e0e0e0',
            cursor: 'pointer',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f5f5f5',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            borderBottom: '2px solid #e0e0e0',
          },
        }}
      />
      {onAddUrl && (
        <Fab
          color="primary"
          size="small"
          onClick={handleAddClick}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Add URL Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New URL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL Address"
            type="url"
            fullWidth
            variant="outlined"
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!newUrl.trim()}>
            Add URL
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 