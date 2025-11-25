<script setup lang="ts">
import type { Img } from '../stores/brains'
import { useBrainsStore } from '../stores/brains'
import { saveAs } from 'file-saver'

const props = defineProps<{ photo: Img }>()
const store = useBrainsStore()

const startDrag = (e: DragEvent) => {
  if (!e.dataTransfer) return
  const url = props.photo.src.original
  const filename = `${props.photo.alt.replace(/[^a-z0-9]/gi, '_')}_${props.photo.id}.jpg`
  e.dataTransfer.setData('DownloadURL', `image/jpeg:${filename}:${url}`)
}

const download = async () => {
  const blob = await fetch(props.photo.src.original).then(r => r.blob())
  console.log("ImageCard: blob", blob)
  console.log("ImageCard: props", props.photo)
  saveAs(blob, `${props.photo.alt}_${props.photo.id}.jpg`)

  // add to history
  store.addToHistory(props.photo)
  
}
</script>

<template>
  <div
    class="group relative rounded-sm overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
    draggable="true" @dragstart="startDrag" @click="download">
    <div class="absolute top-2 left-2">
      <div class="w-6 h-6 rounded-lg shadow-2xl border-4 border-white/20"
        :style="{ backgroundColor: photo.avg_color }" ></div>
    </div>
    <img :src="photo.src.large2x" :alt="photo.alt" class="w-full aspect-video object-cover" loading="lazy" />

    <div
      class="absolute inset-0 bg-linear-to-t from-black/90 via-transparent opacity-0 group-hover:opacity-100 transition">
      <div class="absolute bottom-4 left-4 right-4 text-white">
        <p class="font-light text-md truncate">{{ photo.alt }}</p>
        <p class="text-xs opacity-80">by {{ photo.photographer }}</p>
        <p class="text-xs mt-2 opacity-70">Click to download | Drag to desktop/Figma</p>
      </div>
    </div>
  </div>
</template>