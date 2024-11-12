<template>
  <ion-page>
    <ion-header :translucent="true" :class="mode!='normal'?'hidden':''">
      <ion-toolbar>
        <ion-title>Docs Scan</ion-title>
        <ion-buttons slot="primary">
          <ion-button @click="clearImages">
            <ion-icon :icon="trash"></ion-icon>
          </ion-button>
          <ion-button @click="saveImages">
            <ion-icon :icon="save"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="documentViewer" ref="viewer">
        <div class="image" v-for="(dataURL,index) in scannedImages" :key="index" >
          <img :src="dataURL" alt="scanned" />
        </div>
      </div>
      <div :class="'footer'+(mode!='normal'?' hidden':'')">
        <button class="shutter-button round" @click="startScanning">Scan</button>
      </div>
      <div :class="'cropper fullscreen'+(mode!='cropping'?' hidden':'')" >
        <image-cropper :img="img" v-on:canceled="onCanceled" v-on:confirmed="onConfirmed"></image-cropper>
      </div>
      <div class="scanner fullscreen" v-if="mode==='scanning'">
        <DocumentScanner @on-scanned="onScanned"></DocumentScanner>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import DocumentScanner from '@/components/DocumentScanner.vue';
import { IonButtons, IonButton, IonIcon, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { DocumentNormalizer } from 'capacitor-plugin-dynamsoft-document-normalizer';
import { DetectedQuadResultItem, Quad } from 'image-cropper-component';
import { ref } from 'vue';
import {
  trash,
  save
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import jsPDF, { jsPDFOptions } from 'jspdf';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
const scannedImages = ref<string[]>([]);
const img = ref<undefined|HTMLImageElement>();
const viewer = ref<undefined|HTMLDivElement>();
const mode = ref<"scanning"|"cropping"|"normal">("normal");

const clearImages = () => {
  scannedImages.value = [];
}

const saveImages = async () => {
  if (!viewer.value) {
    return;
  }
  const images = viewer.value.getElementsByTagName("img");
  if (images.length === 0) {
    alert("No images");
    return;
  }
  let orientation:"p" | "portrait" | "l" | "landscape" | undefined = "p";
  if (images[0].naturalWidth>images[0].naturalHeight) {
    orientation = "l";
  }
  const options:jsPDFOptions  = {orientation:orientation,unit: "px", format: [images[0].naturalWidth, images[0].naturalHeight]};
  const doc = new jsPDF(options);

  for (let index = 0; index < images.length; index++) {
    const image = images[index];
    if (index > 0) {
      if (image.naturalWidth>image.naturalHeight) {
        orientation = "l";
      }else{
        orientation = "p";
      }
      doc.addPage([image.naturalWidth,image.naturalHeight],orientation);
    }
    doc.addImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
  }
  if (Capacitor.isNativePlatform()) {
    const data = doc.output("datauristring");    
    const fileName = "scanned.pdf";
    const writingResult = await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: Directory.Cache
    });
    Share.share({
      title: fileName,
      text: fileName,
      url: writingResult.uri,
    });
  }else{
    doc.save("scanned.pdf");
  }
}

const startScanning = () => {
  mode.value = "scanning";
}

const onCanceled = () => {
  mode.value = "normal";
}

const onConfirmed = () => {
  mode.value = "normal";
  loadCroppedImage();
}

const loadCroppedImage = async () => {
  const cropper = document.querySelector("image-cropper");
  if (cropper) {
    const quad = await cropper.getQuad();
    const quadItem:any = quad;
    quadItem.area = 0;
    const response = await DocumentNormalizer.normalize({source:cropper.img,quad:quadItem,template:"NormalizeDocument_Color",includeBase64:true});
    let base64 = response.result.base64;
    if (base64) {
      if (!base64.startsWith("data")) {
        base64 = "data:image/jpeg;base64," + base64;
      }
      const newList:string[] = [];
      for (let index = 0; index < scannedImages.value.length; index++) {
        const element = scannedImages.value[index];
        newList.push(element);
      }
      newList.push(base64);
      scannedImages.value = newList;
    }
  }
}

const onScanned = (blob:Blob,results:DetectedQuadResultItem[]) => {
  const url = URL.createObjectURL(blob);
  const image = document.createElement("img");
  image.src = url;
  image.onload = function(){
    img.value = image;
    if (results.length>0) {
      const item = results[0];
      const quadItem:Quad = {points:item.location.points};
      document.querySelector("image-cropper")!.quad = quadItem;
      console.log(quadItem);
    }
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

.documentViewer {
  width: 100%;
  height: calc(100% - 50px);
  display: grid;
  grid-template-columns: repeat(auto-fill, 48%);
  grid-row-gap: 10px;
  grid-column-gap: 4%;
  overflow: auto;
}

.image {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
  height: 200px;
  border: 1px solid gray;
}

.image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
