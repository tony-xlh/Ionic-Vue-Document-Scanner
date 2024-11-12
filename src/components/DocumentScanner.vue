<template>
  <div ref="container" class="container">
    <div class="dce-video-container"></div>
    <SVGOverlay :viewBox="viewBox" :quad="quadResultItem"></SVGOverlay>
  </div>
  <ion-fab slot="fixed" vertical="bottom" horizontal="end">
    <ion-fab-button>
      <ion-icon :icon="chevronUpCircle"></ion-icon>
    </ion-fab-button>
    <ion-fab-list side="top">
      <ion-fab-button @click="stopCamera">
        <ion-icon :icon="stop"></ion-icon>
      </ion-fab-button>
      <ion-fab-button @click="switchCamera">
        <ion-icon :icon="cameraReverse"></ion-icon>
      </ion-fab-button>
      <ion-fab-button @click="toggleTorch">
        <ion-icon :icon="flashlight"></ion-icon>
      </ion-fab-button>
    </ion-fab-list>
  </ion-fab>
  <ion-loading :is-open="!initialized" message="Loading..." />
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { IonFab, IonFabButton, IonIcon, IonFabList, IonLoading } from '@ionic/vue';
import { CameraPreview } from 'capacitor-plugin-camera';
import { DocumentNormalizer, intersectionOverUnion } from 'capacitor-plugin-dynamsoft-document-normalizer';
import { DetectedQuadResultItem } from 'dynamsoft-document-normalizer'
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import SVGOverlay from '@/components/SVGOverlay.vue';
import {
  chevronUpCircle,
  flashlight,
  stop,
  cameraReverse,
} from 'ionicons/icons';
const previousResults:DetectedQuadResultItem[] = [];
const quadResultItem = ref<undefined|DetectedQuadResultItem>()
const viewBox = ref("0 0 1280 720");

const emit = defineEmits<{
  (e: 'onStopped'): void
  (e: 'onScanned',blob:Blob,path:string|undefined,detectionResults:DetectedQuadResultItem[]): void
}>();

const container = ref<HTMLDivElement|undefined>();
const initialized = ref(false);
let torchOn = false;
let onPlayedListener:PluginListenerHandle|undefined;
let interval:any;
let detecting = false;

onMounted(async () => {
  try {
    if (container.value && Capacitor.isNativePlatform() === false) {
      await CameraPreview.setElement(container.value);
    }
    await CameraPreview.initialize();
    await CameraPreview.requestCameraPermission();
    await DocumentNormalizer.initialize();
    if (onPlayedListener) {
      onPlayedListener.remove();
    }
    
    onPlayedListener = await CameraPreview.addListener("onPlayed", () => {
      updateViewBox();
      startScanning();
    });
    
    await CameraPreview.startCamera();
  } catch (error) {
    alert(error);
  }
  initialized.value = true;
});

onBeforeUnmount(async () => {
  if (onPlayedListener) {
    onPlayedListener.remove();
  }
  stopScanning();
  await CameraPreview.stopCamera();
});

const startScanning = () => {
  stopScanning();
  interval = setInterval(captureAndDetect,100);
}

const stopScanning = () => {
  clearInterval(interval);
}

const stopCamera = async () => {
  if (onPlayedListener) {
    onPlayedListener.remove();
  }
  stopScanning();
  await CameraPreview.stopCamera();
  emit("onStopped");
}

const captureAndDetect = async () => {
  if (detecting === true) {
    return;
  }
  let results:DetectedQuadResultItem[] = [];
  detecting = true;
  try {
    if (Capacitor.isNativePlatform()) {
      await CameraPreview.saveFrame();
      results = (await DocumentNormalizer.detectBitmap({})).results;
    }else{
      if (container.value) {
        const video = container.value.getElementsByTagName("video")[0] as any;
        const response = await DocumentNormalizer.detect({source:video});
        results = response.results;
      }
    }
    if (results.length>0) {
        quadResultItem.value = results[0];
        checkIfSteady(results);
      }else{
        quadResultItem.value = undefined;
      }
    console.log(results);
  } catch (error) {
    console.log(error);
  }
  detecting = false;
}

const updateViewBox = async () => {
  const res = (await CameraPreview.getResolution()).resolution;
  const width = parseInt(res.split("x")[0]);
  const height = parseInt(res.split("x")[1]);
  const orientation = (await CameraPreview.getOrientation()).orientation;
  let box:string;
  if (orientation === "PORTRAIT") {
    if (!Capacitor.isNativePlatform()) {
      box = "0 0 "+width+" "+height;
    }else{
      box = "0 0 "+height+" "+width;
    }
  }else{
    box = "0 0 "+width+" "+height;
  }
  console.log(box);
  viewBox.value = box;
}

const checkIfSteady = (results:DetectedQuadResultItem[]) => {
  console.log(results);
  if (results.length>0) {
    const result = results[0];
    if (previousResults.length >= 3) {
      if (steady() == true) {
        console.log("steady");
        takePhotoAndStop();
      }else{
        console.log("shift and add result");
        previousResults.shift();
        previousResults.push(result);
      }
    }else{
      console.log("add result");
      previousResults.push(result);
    }
  }
}

const steady = () => {
  if (previousResults[0] && previousResults[1] && previousResults[2]) {
    const iou1 = intersectionOverUnion(previousResults[0].location.points,previousResults[1].location.points);
    const iou2 = intersectionOverUnion(previousResults[1].location.points,previousResults[2].location.points);
    const iou3 = intersectionOverUnion(previousResults[2].location.points,previousResults[0].location.points);
    if (iou1>0.9 && iou2>0.9 && iou3>0.9) {
      return true;
    }else{
      return false;
    }
  }
  return false;
}

const takePhotoAndStop = async () => {
  stopScanning();
  let blob:Blob|undefined;
  let detectionResults:DetectedQuadResultItem[] = [];
  let path;
  if (Capacitor.isNativePlatform()) {
    const photo = await CameraPreview.takePhoto({includeBase64:true});
    blob = await getBlobFromBase64(photo.base64!);
    detectionResults = (await DocumentNormalizer.detect({path:photo.path})).results;
    path = photo.path;
    console.log(detectionResults);
  }else{
    const photo = await CameraPreview.takePhoto({});
    console.log(photo);
    if (photo.blob) {
      blob = photo.blob;
    }else if (photo.base64) {
      blob = await getBlobFromBase64(photo.base64);
    }
    const img = await loadBlobAsImage(blob!);
    console.log(img);
    detectionResults = (await DocumentNormalizer.detect({source:img})).results;
  }
  if (blob && detectionResults) {
    emit("onScanned", blob, path, detectionResults);
  }
}

const getBlobFromBase64 = async (base64:string):Promise<Blob> => {
  if (!base64.startsWith("data")) {
    base64 = "data:image/jpeg;base64," + base64;
  }
  const response = await fetch(base64);
  const blob = await response.blob();
  return blob;
}

const loadBlobAsImage = (blob:Blob):Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.onload = function(){
      resolve(img);
    };
    img.src = URL.createObjectURL(blob);
  });
}

const switchCamera = async () => {
  const currentCamera = (await CameraPreview.getSelectedCamera()).selectedCamera;
  const result = await CameraPreview.getAllCameras();
  const cameras = result.cameras;
  const currentCameraIndex = cameras.indexOf(currentCamera);
  let desiredIndex = 0
  if (currentCameraIndex < cameras.length - 1) {
    desiredIndex = currentCameraIndex + 1;
  }
  await CameraPreview.selectCamera({cameraID:cameras[desiredIndex]});
}

const toggleTorch = () => {
  if (initialized.value) {
    torchOn = !torchOn;
    CameraPreview.toggleTorch({on:torchOn});
  }
}

</script>

<style scoped>
.container {
  width:100%;
  height:100%;
}
</style>