<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-button expand="full" @click="goToScanner()">Go to scanner</ion-button>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonButton, IonPage, IonTitle, IonToolbar, IonFab,IonFabButton,IonIcon, actionSheetController, isPlatform, useIonRouter,loadingController  } from '@ionic/vue';

import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonContent,
    IonHeader,
    IonButton,
    IonPage,
    IonTitle,
    IonToolbar
  },
  setup() {
    const router = useIonRouter();
    const goToScanner = () => {
      router.push('/scanner');
    }

    const prefetch = async () => {
      let urls = 
      ['/assets/dwt-resources/src/dynamsoft.webtwain.css?t=20220624191623',
        '/assets/dwt-resources/src/dynamsoft.viewer.css?t=20220624191623',
        '/assets/dwt-resources/src/dynamsoft.viewer.js?t=20220624191623',
        '/assets/dwt-resources/src/dynamsoft.lts.js?t=20220624191623',
        '/assets/dwt-resources/addon/dynamsoft.webtwain.addon.camera.css?t=20220624191623',
        '/assets/dwt-resources/src/dynamsoft.imageio_wasm-1.7.3.js',
        '/assets/dwt-resources/src/dynamsoft.imageio-1.7.3.wasm',
        '/assets/dwt-resources/src/dynamsoft.crypto-1.7.3.wasm',
        '/assets/dwt-resources/src/dynamsoft.imagecore-1.7.3.wasm',
        '/assets/dwt-resources/src/dynamsoft.imageProc-sn-1.7.3.wasm',
        '/assets/dwt-resources/src/dynamsoft.pdfReader_wasm-1.7.3.js',
        '/assets/dwt-resources/src/dynamsoft.pdfReader-1.7.3.wasm',
      ];

      const loading = await loadingController.create({
        message: 'Loading resources...',
      });

      loading.present();

      for (let index = 0; index < urls.length; index++) {
        const url = urls[index];
        await fetch(url); 
      }

      loading.dismiss();
    }

    onMounted(() => {
      prefetch();
    })

    return {
      goToScanner
    }
  }
});
</script>

<style scoped>
ion-buttons {
  overflow:auto;
}
</style>
