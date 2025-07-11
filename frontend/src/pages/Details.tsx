import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Button,
  Paper,
  Grid,
  Chip
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { fetchUrlDetails } from "../api";
import type { UrlItem } from "../types";

export default function Details() {
  const { id } = useParams<{ id: string }>();
  const [url, setUrl] = useState<UrlItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUrlDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('Fetching details for URL ID:', id);
        const response = await fetchUrlDetails(Number(id));
        console.log('=== API RESPONSE ===');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('URL results:', response.data.results);
        console.log('First result:', response.data.results?.[0]);
        setUrl(response.data);
      } catch (error) {
        console.error('Error loading URL details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load URL details');
      } finally {
        setLoading(false);
      }
    };

    loadUrlDetails();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  if (!url) {
    return (
      <Container>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h6" color="warning.main">No data found.</Typography>
      </Container>
    );
  }

  const result = url.results?.[0];
  console.log('=== CURRENT STATE ===');
  console.log('URL object:', url);
  console.log('Result:', result);
  console.log('Results array:', url.results);
  console.log('Results length:', url.results?.length);

  if (!result) {
    return (
      <Container>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h6" color="warning.main">No analysis result available.</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          URL Status: {url.status}
        </Typography>
        <Typography variant="body1">
          Results Count: {url.results?.length || 0}
        </Typography>
      </Container>
    );
  }

  // Debug logging for result data
  console.log('=== RESULT DATA ===');
  console.log('Result object:', result);
  console.log('HTML Version:', result.html_version);
  console.log('Title:', result.title);
  console.log('Headings:', result.headings);
  console.log('Internal Links:', result.internal_links);
  console.log('External Links:', result.external_links);
  console.log('Broken Links:', result.broken_links);
  console.log('Login Form:', result.login_form);
  console.log('Links array:', result.links);

  // Prepare chart data
  const chartData = [
    { name: "Internal", value: result.internal_links, fill: "#0088FE" },
    { name: "External", value: result.external_links, fill: "#00C49F" },
  ];

  const hasLinks = result.internal_links > 0 || result.external_links > 0 || result.broken_links > 0;
  const hasHeadings = result.headings && Object.values(result.headings).some(count => count > 0);

  console.log('=== COMPUTED VALUES ===');
  console.log('Has Links:', hasLinks);
  console.log('Has Headings:', hasHeadings);
  console.log('Chart Data:', chartData);

  return (
    <Container maxWidth="lg">
      {/* Navigation */}
      <Button 
        component={RouterLink} 
        to="/" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>
      
      {/* Page Header */}
      <Typography variant="h4" gutterBottom>{url.address}</Typography>
      
      {/* Debug Info */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>Debug Info</Typography>
        <Typography variant="body2">Status: {url.status}</Typography>
        <Typography variant="body2">Results Count: {url.results?.length || 0}</Typography>
        <Typography variant="body2">Has Result: {result ? 'Yes' : 'No'}</Typography>
      </Paper>
      
      {/* Basic Info Card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Page Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>HTML Version:</strong> {result.html_version || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Title:</strong> {result.title || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Login Form Detection */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Login Form Detection</Typography>
        <Chip 
          label={result.login_form ? "Login form detected" : "No login form found"}
          color={result.login_form ? "success" : "default"}
          variant={result.login_form ? "filled" : "outlined"}
        />
      </Paper>

      {/* Heading Tags */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Heading Structure</Typography>
        {hasHeadings ? (
          <Grid container spacing={2}>
            {Object.entries(result.headings).map(([tag, count]) => (
              <Grid item xs={4} sm={2} key={tag}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary">{count}</Typography>
                  <Typography variant="body2">{tag.toUpperCase()}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No headings found on this page
          </Typography>
        )}
      </Paper>

      {/* Links Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Link Distribution</Typography>
        {hasLinks ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={300} height={300}>
              <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                label
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No links found on this page
          </Typography>
        )}
      </Paper>

      {/* Link Details */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Link Details</Typography>
      
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Broken Links ({result.broken_links})
          </Typography>
          {result.broken_links > 0 ? (
            <List dense>
              {result.links.filter(link => link.broken).map(link => (
                <ListItem key={link.id}>
                  <ListItemText 
                    primary={link.url} 
                    secondary={`Status: ${link.status}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No broken links found
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
} 