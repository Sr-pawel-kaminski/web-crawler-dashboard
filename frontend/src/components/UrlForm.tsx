import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";

export function UrlForm({ onAdd }: { onAdd: (url: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <Box component="form" onSubmit={e => { e.preventDefault(); onAdd(value); setValue(""); }} sx={{ display: "flex", gap: 2 }}>
      <TextField
        label="Website URL"
        value={value}
        onChange={e => setValue(e.target.value)}
        required
        type="url"
        size="small"
        sx={{ flex: 1 }}
      />
      <Button type="submit" variant="contained">Add</Button>
    </Box>
  );
} 