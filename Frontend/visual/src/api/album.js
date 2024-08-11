import axios from 'axios';

// Get albums
export const getAlbums = async (uid) => {
    try {
        const response = await axios.get(`/albums/${uid}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching albums:', error);
        return [];
    }
};

// Create album
export const createAlbum = async (albumName, uid) => {
    try {
        const response = await axios.post('/albums', { albumName, uid });
        return response.data;
    } catch (error) {
        console.error('Error creating album:', error);
    }
};

// Delete album
export const deleteAlbum = async (albumId, photos) => {
    try {
        await axios.delete(`/albums/${albumId}`, { data: { photos } });
    } catch (error) {
        console.error('Error deleting album:', error);
    }
};
