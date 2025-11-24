import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";

/* img interface */

export interface Img {
  id: number;
  alt: string;
  photographer: string;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    medium: string;
  };
  downloadedAt?: string;
}

/* brains store */

export const useBrainsStore = defineStore("brains", () => {
  const photos = ref<Img[]>([]);
  const query = ref("art");
  const page = ref(1);
  const loading = ref(false);

  const search = async (reset = false) => {
    if (reset) {
      page.value = 1;
      photos.value = [];
    }
    loading.value = true;

    try {
      const res = await axios.get("https://api.pexels.com/v1/search", {
        headers: { Authorization: import.meta.env.VITE_PEXELS_API_KEY },
        params: {
          query: query.value || "art",
          per_page: 40,
          page: page.value,
        },
      });
      console.log("res.data", res.data);

      const newPhotos = res.data.photos.map((p: any) => ({
        id: p.id,
        alt: p.alt || "Untitled",
        photographer: p.photographer,
        avg_color: p.avg_color,
        src: p.src,
      }));
      // Combine new photos with existing photos if not resetting
      photos.value = reset ? newPhotos : [...photos.value, ...newPhotos];
      if (!reset) page.value++;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  // Load initial images
  search();

  return { photos, query, loading, search };
});
