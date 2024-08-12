import React, { useState, useEffect } from "react";
import "../css/HomePage.css";
import Photo from "../components/Photo";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Typography, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { getAlbumPhotos } from "../api/photo";
import { deleteAlbum as deleteAlbumFromAPI } from "../api/album"; // Renamed import to avoid conflict

function AlbumPage() {
  const navigate = useNavigate();
  const currentAlbum = useSelector((state) => state.currentAlbum);
  const [photos, setPhotos] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (currentAlbum.albumId === "ROOT") navigate(`/`, { replace: true });
  }, [navigate, currentAlbum.albumId]);

  useEffect(() => {
    const unsubscribe = getAlbumPhotos(currentAlbum.albumId, (snapshot) => {
      setPhotos(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
    });

    return unsubscribe;
  }, [currentAlbum.albumId]);

  const openDeleteModal = () => setOpen(true);
  const closeDeleteModal = () => setOpen(false);

  const handleAlbumDeletion = () => {
    deleteAlbumFromAPI(photos, currentAlbum.albumId); // Using renamed function
    closeDeleteModal();
    navigate(`/`, { replace: true });
  };

  return (
    <div className="albumpage">
      <div className="albumpage__header">
        <Typography variant="h5">{currentAlbum.albumName}</Typography>

        <IconButton onClick={openDeleteModal}>
          <DeleteIcon />
        </IconButton>
      </div>
      <div className="albumpage__photos">
        {photos.map(({ id, data }) => (
          <Photo key={id} id={id} data={data} />
        ))}
      </div>

      <Dialog
        open={open}
        onClose={closeDeleteModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Album Delete Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting the Album will also delete the Photos inside it... Do you
            want to delete this Album?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleAlbumDeletion} // Updated to call the correct function
            color="primary"
            autoFocus
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AlbumPage;
