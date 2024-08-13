import React, { useState, useEffect } from "react";
import "../css/HomePage.css";
import Album from "../components/Album";
import Photo from "../components/Photo";
import CreateAlbumModal from "../components/CreateAlbumModal";

import { Typography, IconButton, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";

import { setCurrentAlbum } from "../actions";
import { getAlbums } from "../api/album";
import { getRootPhotos } from "../api/photo";

function HomePage() {
  const dispatch = useDispatch();
  const { uid } = useSelector((state) => state.user);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    dispatch(setCurrentAlbum({ albumId: "ROOT", albumName: "ROOT" }));
  }, [dispatch]);

  // Fetch Root Photos
  useEffect(() => {
    const unsubscribe = getRootPhotos(uid, (snapshot) => {
      setPhotos(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
    });
    return unsubscribe;
  }, [uid]);

  // Fetch Albums
  useEffect(() => {
    const unsubscribe = getAlbums((snapshot) => {
      setAlbums(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
    }, uid);

    return unsubscribe;
  }, [uid]);

  const handleCreateAlbumModal = () => {
    setIsCreateAlbumOpen(true);
  };

  return (
    <div className="homepage">
      <Typography variant="h4" className="homepage__title">
        Albums
      </Typography>

      <Grid container spacing={2} className="homepage__albums">
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <div
            className="homepage__createAlbum"
            onClick={handleCreateAlbumModal}
          >
            <IconButton aria-label="Create New Album" size="large">
              <AddIcon fontSize="large" />
            </IconButton>
            <Typography>Create New Album</Typography>
          </div>
        </Grid>

        {albums.map(({ id, data }) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
            <Album id={id} data={data} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h4" className="homepage__title">
        Photos
      </Typography>

      <Grid container spacing={2} className="homepage__photos">
        {photos.map(({ id, data }) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
            <Photo id={id} data={data} />
          </Grid>
        ))}
      </Grid>

      <CreateAlbumModal
        isCreateAlbumOpen={isCreateAlbumOpen}
        setIsCreateAlbumOpen={setIsCreateAlbumOpen}
      />
    </div>
  );
}

export default HomePage;
