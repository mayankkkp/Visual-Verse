import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";

import { Button, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { createAlbum } from "../api/album";

function CreateAlbumModal({ isCreateAlbumOpen, setIsCreateAlbumOpen }) {
  const { uid } = useSelector((state) => state.user);
  const [error, setError] = useState(false);
  const inputRef = useRef();

  const handleCreateAlbum = (e) => {
    setError(false);
    e.preventDefault();
    const newName = inputRef.current.value;
    if ((newName.length < 1) | (newName.length > 16)) return setError(true);

    createAlbum(inputRef.current.value, uid);
    setIsCreateAlbumOpen(false);
  };

  const handleClose = () => {
    setError(false);
    setIsCreateAlbumOpen(false);
  };

  return (
    <div>
      <Dialog
        open={isCreateAlbumOpen}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">New Album</DialogTitle>

        <form onSubmit={handleCreateAlbum} autoComplete="off">
          <DialogContent>
            <Typography>Enter a name for your new Album</Typography>

            <div>
              <TextField
                error={error}
                id="filled-error-helper-text"
                autoFocus
                margin="dense"
                label="Album Name"
                type="text"
                fullWidth
                required
                inputRef={inputRef}
                helperText="name should be between 1 and 16 characters"
                variant="filled"
              />
            </div>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

export default CreateAlbumModal;