<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div v-if="isOpen" class="modal modal-open">
    <div class="modal-box max-w-xl">
      <h3 class="font-bold text-xl mb-4">Some useful tips</h3>
      <div class="space-y-4 text-sm leading-relaxed">
        <div class="space-y-2">
          <p>
            Use the search bar to describe the kind of artwork you&apos;d like to
            see. Results update as you refine your prompt.
          </p>
          <p>
            The color picker lets you filter results by a dominant color, and the
            custom
            <span class="font-mono text-xs">#RRGGBB</span> input accepts any hex
            color. Each image also have average color swatch that you can click to
            copy the hex color to clipboard.
          </p>
          <p>
            The history panel keeps track of your recent downloads. Thubmnails can
            be clicked to redownload the image.
          </p>
        </div>

        <div>
          <h4 class="font-semibold mb-1">Keyboard shortcuts</h4>
          <ul class="list-disc list-inside space-y-1 text-xs sm:text-sm">
            <li>
              <kbd class="kbd kbd-xs">Esc</kbd> – Close the color palette (if
              open) and clear the search query.
            </li>
            <li>
              <kbd class="kbd kbd-xs">Ctrl</kbd> + <kbd class="kbd kbd-xs">I</kbd>
              – Open the color palette and focus the custom hex input.
            </li>
            <li>
              <kbd class="kbd kbd-xs">Ctrl</kbd> + <kbd class="kbd kbd-xs">F</kbd>
              – Focus the main search input.
            </li>
          </ul>
        </div>
      </div>
      <div class="modal-action">
        <button class="btn rounded-full" type="button" @click="emit('close')">
          Got it
        </button>
      </div>
    </div>
    <button
      class="modal-backdrop"
      type="button"
      aria-label="Close info"
      @click="emit('close')"
    ></button>
  </div>
</template>

