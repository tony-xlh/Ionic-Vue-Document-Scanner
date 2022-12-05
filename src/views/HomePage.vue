<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Document Scanner</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Blank</ion-title>
        </ion-toolbar>
      </ion-header>
      <DWT width="100%" height="100%" @onWebTWAINReady="onWebTWAINReady"></DWT>
      <ion-fab vertical="bottom" horizontal="start" slot="fixed">
        <ion-fab-button @click="startScan">
          <ion-icon name="camera-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab,IonFabButton,IonFabList,IonIcon } from '@ionic/vue';
import { WebTwain } from 'mobile-web-capture/dist/types/WebTwain';
import { defineComponent } from 'vue';
import DWT from '../components/DWT.vue'
import { cameraOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonFabList,
    IonIcon,
    DWT
  },
  setup() {
    addIcons({
      'camera-outline': cameraOutline,
    });

    let DWObject: WebTwain|null;
    const onWebTWAINReady = (dwt:WebTwain) {
      DWObject = dwt;
    };

    const startScan = () => {
      if (DWObject) {
        DWObject.Addon.Camera.scanDocument();
      }
    };

    return {
      onWebTWAINReady,
      startScan
    }
  }
});
</script>

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
