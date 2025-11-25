import axios from "axios";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
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
    const hasMoreResults = ref(true);
    const error = ref<string | null>(null);
    const retryCount = ref(0);
    const maxRetries = 3;
    // history reference
    const downloadHistory = ref<Img[]>([]);
    // color filter reference
    const activeColor = ref<string | null>(null);

    // faster search
    const isTyping = ref(false);
    const typingTimeout = ref<number | null>(null);



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


    // get LAB color space
    const getLab = (hex: string) => {
      if (labCache.has(hex)) return labCache.get(hex);
      const rgb = hexToRgb(hex);
      if (!rgb) return null;
      const lab = rgb_to_lab(rgb);
      labCache.set(hex, lab);
      return lab;
    };

    const performSearch = async (reset = false) => {
      // Don't search while color is active
      if (activeColor.value) {
        if (reset) photos.value = [];
        loading.value = false;
        return;
      }

      if (reset) {
        page.value = 1;
        photos.value = [];
        hasMoreResults.value = true;
        error.value = null;
        retryCount.value = 0;
      }

      loading.value = true;
      error.value = null;

      try {
        const cleanQuery = query.value.trim().toLowerCase() || "art";

        const res = await axios.get("https://api.pexels.com/v1/search", {
          headers: { Authorization: import.meta.env.VITE_PEXELS_API_KEY },
          params: {
            query: cleanQuery,
            per_page: 40,
            page: page.value,
          },
          timeout: 10000, // 10 second timeout
        });

        const newPhotos = res.data.photos?.map((p: any) => ({
          id: p.id,
          alt: p.alt || "Untitled",
          photographer: p.photographer,
          avg_color: p.avg_color,
          src: p.src,
        })) || [];

        // Check if we got fewer results than requested (indicates last page)
        if (newPhotos.length < 40) {
          hasMoreResults.value = false;
        }

        photos.value = reset ? newPhotos : [...photos.value, ...newPhotos];

        // Only increment page if we successfully got results
        if (newPhotos.length > 0 && !reset) {
          page.value++;
        }

        // Reset retry count on success
        retryCount.value = 0;

      } catch (e: any) {
        console.error("Search failed:", e);

        // Handle different error types
        if (e.response?.status === 429) {
          // Rate limiting
          error.value = "Too many requests. Please wait a moment and try again.";
          hasMoreResults.value = false;
        } else if (e.response?.status === 401) {
          // API key issues
          error.value = "API key is invalid or missing. Please check your configuration.";
          hasMoreResults.value = false;
        } else if (e.code === 'ECONNABORTED' || e.code === 'ENOTFOUND') {
          // Network issues - retry logic
          if (retryCount.value < maxRetries) {
            retryCount.value++;
            console.log(`Retrying search (attempt ${retryCount.value}/${maxRetries})`);
            // Wait before retrying (exponential backoff)
            setTimeout(() => performSearch(reset), Math.pow(2, retryCount.value) * 1000);
            return; // Don't set loading to false yet
          } else {
            error.value = "Network error. Please check your connection and try again.";
            hasMoreResults.value = false;
          }
        } else {
          // Other errors
          error.value = "Failed to load images. Please try again.";
          hasMoreResults.value = false;
        }
      } finally {
        loading.value = false;
        isTyping.value = false;
      }
    };

    // Watch query → instant search with 300ms debounce
    watch(
      query,
      () => {
        isTyping.value = true;
        if (typingTimeout.value) clearTimeout(typingTimeout.value);

        typingTimeout.value = setTimeout(() => {
          performSearch(true); // reset on new query
        }, 300) as unknown as number;
      },
      { immediate: false }
    );

    // Manual load more (for scroll)
    const loadMore = () => {
      if (!loading.value && !activeColor.value && hasMoreResults.value) {
        performSearch(false);
      }
    };

    const addToHistory = (photo: Img) => {
      if (!downloadHistory.value.some((p) => p.id === photo.id)) {
        downloadHistory.value.unshift({
          ...photo,
          downloadedAt: new Date().toISOString(),
        });
      }
      if (downloadHistory.value.length > 100) downloadHistory.value.pop();
    };

    const setColorFilter = (color: string | null) => {
      activeColor.value = color;
      // Color filter = instant local, no API
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
        .sort((a, b) => a.distance - b.distance)
        .map(({ photo }) => photo);
    });

    // Live result count
    const resultCount = computed(() => {
      const list = activeColor.value ? filteredPhotos.value : photos.value;
      return list.length;
    });

    // Initial load
    performSearch(true);

  

    return {
      photos,
      filteredPhotos,
      query,
      loading,
      hasMoreResults,
      error,
      isTyping,
      resultCount,
      downloadHistory,
      activeColor,
      performSearch,
      loadMore,
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
