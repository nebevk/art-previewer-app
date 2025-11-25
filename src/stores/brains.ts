import axios from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { rgb_to_lab, diff } from "color-diff";

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

export const useBrainsStore = defineStore(
  "brains",
  () => {
    const photos = ref<Img[]>([]);
    const query = ref("art");
    const page = ref(1);
    const loading = ref(false);
    // history reference
    const downloadHistory = ref<Img[]>([]);
    // color filter reference
    const activeColor = ref<string | null>(null);

    // COLOR TOLERANCE - how close the color is to the target color
    const COLOR_TOLERANCE = 25;

    const labCache = new Map<string, any>();
    const hexToRgb = (
      hex: string
    ): { R: number; G: number; B: number } | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            R: parseInt(result[1] || '0', 16),
            G: parseInt(result[2] || '0', 16),
            B: parseInt(result[3] || '0', 16),
          }
        : null;
    };

    const getLab = (hex: string) => {
      if (labCache.has(hex)) return labCache.get(hex);
      const rgb = hexToRgb(hex);
      if (!rgb) return null;
      const lab = rgb_to_lab(rgb);
      labCache.set(hex, lab);
      return lab;
    };

    const search = async (reset = false) => {
      if (activeColor.value) {
        // When color is active, don't fetch — just filter locally
        if (reset) photos.value = [];
        loading.value = false;
        return;
      }

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

    const addToHistory = (photo: Img) => {
      if (!downloadHistory.value.some((p: Img) => p.id === photo.id)) {
        downloadHistory.value.unshift({
          ...photo,
          downloadedAt: new Date().toISOString(),
        });
        console.log(
          "brains store: addToHistory: downloadHistory",
          downloadHistory.value
        );
      }
      if (downloadHistory.value.length > 100) downloadHistory.value.pop();
    };

    
    const setColorFilter = (color: string | null) => {
      activeColor.value = color;
      // No API call — instant local filtering
    };

    const filteredPhotos = computed(() => {
      if (!activeColor.value) return photos.value;

      const targetLab = getLab(activeColor.value);
      if (!targetLab) return photos.value;

      return photos.value
        .map((photo) => {
          const photoLab = getLab(photo.avg_color);
          if (!photoLab) return { photo, distance: Infinity };
          const distance = diff(targetLab, photoLab);
          return { photo, distance };
        })
        .filter(({ distance }) => distance <= COLOR_TOLERANCE)
        .sort((a, b) => a.distance - b.distance) // best matches first
        .map(({ photo }) => photo);
    });

    

    // Load initial images
    search();

    return {
      photos,
      filteredPhotos,
      query,
      loading,
      downloadHistory,
      activeColor,
      search,
      addToHistory,
      setColorFilter,
    };
  },
  {
    persist: {
      pick: ["downloadHistory"],
    },
  }
);
