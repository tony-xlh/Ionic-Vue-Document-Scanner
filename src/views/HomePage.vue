<template>
  <ion-page>
    <ion-header :translucent="true" :class="mode!='normal'?'hidden':''">
      <ion-toolbar>
        <ion-title>Docs Scan</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div :class="'footer'+(mode!='normal'?' hidden':'')">
        <button class="shutter-button round" @click="startScanning">Scan</button>
      </div>
      <div class="cropper fullscreen" v-if="mode==='cropping'">
        <image-cropper :img="img"></image-cropper>
      </div>
      <div class="scanner fullscreen" v-if="mode==='scanning'">
        <DocumentScanner @on-scanned="onScanned"></DocumentScanner>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import DocumentScanner from '@/components/DocumentScanner.vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { DetectedQuadResultItem } from 'image-cropper-component';
import { ref } from 'vue';

const img = ref<undefined|HTMLImageElement>();
const mode = ref<"scanning"|"cropping"|"normal">("normal");

const startScanning = () => {
  mode.value = "scanning";
}

const onScanned = (blob:Blob,results:DetectedQuadResultItem[]) => {
  const url = URL.createObjectURL(blob);
  const image = document.createElement("img");
  image.src = url;
  image.onload = function(){
    img.value = image;
    console.log(image);
  }
  console.log(results);
  mode.value = "cropping";
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 50px;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
}

.shutter-button {
  background-color: black;
  border: none;
  color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  width: 50px;
  height: 50px;
  transform: translateY(-10px);
  cursor: pointer;
}

.shutter-button:hover {
  background-color: rgba(0,0,0,0.8);
}

.round{
  border-radius: 50%;
}

.fullscreen {
  position: absolute;
  left:0;
  top:0;
  top: env(safe-area-inset-top);
  width: 100%;
  height: 100%;
  height: calc(100% - env(safe-area-inset-top));
  background: transparent;
  z-index: 200;
}

.hidden {
  visibility: hidden;
}
</style>
